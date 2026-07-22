import { useState } from "react";
import { useExport } from "./useExport"; 
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { slugify } from 'transliteration';
import { compileRenPyScript, generateZipFileName, generateConfigString, generateAssetsRpy } from "./renpyGenerator";
import { supabase } from '../lib/supabaseClient';

// Path อ้างอิงไฟล์เทมเพลตในโฟลเดอร์ public/
const GITHUB_TEMPLATE_URL = "/templates/renpy_template-1.0-pc.zip";

let cachedTemplateBlob = null;

export const useRenPyExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const { handleExportZIP } = useExport(); 

  const exportProject = async (projectId, projectName, onSaveBeforeExport) => {
    if (!projectId) return;

    setIsExporting(true);

    if (typeof onSaveBeforeExport === 'function') {
      setExportProgress("กำลังบันทึกข้อมูลล่าสุดไปยังฐานข้อมูลอัตโนมัติ...");
      const isSaveSuccess = await onSaveBeforeExport();
      if (!isSaveSuccess) {
        setIsExporting(false);
        setExportProgress("");
        return; 
      }
    }
    
    try {
      // 1. ดึงข้อมูลชื่อเกม
      const { data: projectData } = await supabase
        .from('Projects') 
        .select('titles')
        .eq('id', projectId)
        .single();

      const currentProjectName = projectData?.titles || projectName || "Untitled_Project";

      // 2. ดึงข้อมูลเนื้อหาเกม (Chapters, Blocks, Assets)
      const gameData = await handleExportZIP(projectId);
      if (!gameData) {
        setIsExporting(false);
        setExportProgress("");
        return;
      }

      const { chapters, blocks, assets } = gameData;

      // 3. ดึงไฟล์ Base Template Zip จาก public/
      let templateZipBlob = cachedTemplateBlob;
      if (!templateZipBlob) {
        setExportProgress("กำลังดาวน์โหลดโครงสร้างระบบเกม (Ren'Py Engine Template)...");
        const templateResponse = await fetch(GITHUB_TEMPLATE_URL);
        if (!templateResponse.ok) {
          throw new Error("ไม่สามารถดาวน์โหลด Base Template ได้ กรุณาเช็กว่ามีไฟล์ใน public/templates/");
        }
        templateZipBlob = await templateResponse.blob();
        cachedTemplateBlob = templateZipBlob;
      }

      // 4. โหลด Base Template และสร้าง Zip ใหม่พร้อมเปลี่ยนชื่อโฟลเดอร์ & .exe
      setExportProgress("กำลังเตรียมโครงสร้างโฟลเดอร์และไฟล์รันเกม...");
      
      const rpyContent = compileRenPyScript(currentProjectName, chapters, blocks, assets);
      const configContent = generateConfigString(currentProjectName);
      const assetsContent = generateAssetsRpy(assets);

      // สร้างชื่อที่ปลอดภัยสำหรับโฟลเดอร์และไฟล์ .exe
      const safeProjectName = currentProjectName
        .replace(/[\/:*?"<>|]/g, "_")
        .replace(/\s+/g, "_")
        .trim() || "My_RenPy_Game";

      const templateZip = await JSZip.loadAsync(templateZipBlob);
      const newZip = new JSZip();

      // หาชื่อ Root Folder เดิม (เช่น "renpy_template-1.0-pc/")
      let oldRootFolder = "";
      const firstPath = Object.keys(templateZip.files)[0];
      if (firstPath && firstPath.includes("/")) {
        oldRootFolder = firstPath.split("/")[0] + "/";
      }

      // หาชื่อไฟล์ Exe เดิม (เช่น "renpy_template")
      let oldExeBaseName = "";
      Object.keys(templateZip.files).forEach((filePath) => {
        if (filePath.endsWith(".exe")) {
          const fileName = filePath.split("/").pop();
          oldExeBaseName = fileName.replace(".exe", "");
        }
      });

      // ย้ายไฟล์ทั้งหมดพร้อมเปลี่ยนชื่อโฟลเดอร์และไฟล์ .exe
      const filePromises = [];

      templateZip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;

        let newPath = relativePath;

        if (oldRootFolder && newPath.startsWith(oldRootFolder)) {
          newPath = newPath.replace(oldRootFolder, `${safeProjectName}/`);
        } else if (!oldRootFolder) {
          newPath = `${safeProjectName}/${newPath}`;
        }

        if (oldExeBaseName) {
          const fileName = newPath.split("/").pop();
          if (fileName.startsWith(oldExeBaseName)) {
            const ext = fileName.replace(oldExeBaseName, "");
            const newFileName = `${safeProjectName}${ext}`;
            newPath = newPath.replace(fileName, newFileName);
          }
        }

        const promise = zipEntry.async("arraybuffer").then((content) => {
          newZip.file(newPath, content);
        });
        filePromises.push(promise);
      });

      await Promise.all(filePromises);

      // เขียนไฟล์สคริปต์ Ren'Py ลงโฟลเดอร์ game/ ใหม่
      newZip.file(`${safeProjectName}/game/script.rpy`, rpyContent);
      newZip.file(`${safeProjectName}/game/project_config.rpy`, configContent);
      newZip.file(`${safeProjectName}/game/assets_definition.rpy`, assetsContent);

      // 5. ดาวน์โหลดไฟล์มีเดีย (Assets) ยัดลงโฟลเดอร์ game/
      if (assets && assets.length > 0) {
        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];
          if (!asset.storage_path) continue;

          try {
            setExportProgress(`กำลังดึงไฟล์สื่อ (${i + 1}/${assets.length}): ${asset.file_name || "ไฟล์มีเดีย"}`);
            const { data } = supabase.storage.from("game-assets").getPublicUrl(asset.storage_path);

            const response = await fetch(data.publicUrl);
            if (!response.ok) throw new Error("Network error");

            const fileBlob = await response.blob();

            const fileType = (asset.file_type || "").toLowerCase();
            const matchExt = asset.file_name ? asset.file_name.match(/\.[^.]+$/) : null;
            const ext = matchExt ? matchExt[0].toLowerCase() : "";

            const isAudio = fileType.includes("music") || 
                            fileType.includes("audio") || 
                            fileType.includes("sound") || 
                            fileType.includes("sfx") || 
                            fileType.includes("bgm") || 
                            [".mp3", ".wav", ".ogg", ".opus"].includes(ext);

            let finalFileName = generateZipFileName(asset, isAudio);

            if (!isAudio && fileType.includes("sprite")) {
              const rawExpression = asset.expression_tag;
              if (rawExpression && rawExpression.trim()) {
                let cleanExpr = slugify(rawExpression).replace(/-/g, "_");
                if (cleanExpr) {
                  const dotIndex = finalFileName.lastIndexOf(".");
                  if (dotIndex !== -1) {
                    const baseName = finalFileName.substring(0, dotIndex);
                    const fileExt = finalFileName.substring(dotIndex);
                    finalFileName = `${baseName} ${cleanExpr}${fileExt}`;
                  } else {
                    finalFileName = `${finalFileName} ${cleanExpr}`;
                  }
                }
              }
            }

            if (isAudio) {
              newZip.file(`${safeProjectName}/game/audio/${finalFileName}`, fileBlob);
            } else {
              newZip.file(`${safeProjectName}/game/images/${finalFileName}`, fileBlob);
            }
          } catch (err) {
            console.error(`❌ Skip file [${asset.file_name}]:`, err);
          }
        }
      }

      // 6. บีบอัดและดาวน์โหลด
      setExportProgress("กำลังม้วนไฟล์เกมตัวเต็มพร้อมเล่น...");

      const zipBlob = await newZip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${safeProjectName}_playable.zip`);

    } catch (error) {
      console.error("Export Error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออก: " + error.message);
    } finally {
      setIsExporting(false);
      setExportProgress("");
    }
  };

  return { exportProject, isExporting, exportProgress };
};