import { useState } from "react";
import { useExport } from "./useExport"; 
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { slugify } from 'transliteration';
import { compileRenPyScript, generateZipFileName, generateConfigString, generateAssetsRpy } from "./renpyGenerator";
import { supabase } from '../lib/supabaseClient';

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
    
    setExportProgress("กำลังดึงข้อมูลจากฐานข้อมูล...");

    try {
      // 1. ดึงชื่อโปรเจกต์จากคอลัมน์ titles ในตาราง Projects ผ่าน Supabase Client
      const { data: projectData, error: projectError } = await supabase
        .from('Projects')       // ชื่อตารางอิงตามโครงสร้างฐานข้อมูล
        .select('titles')       // คอลัมน์เก็บชื่อเกม
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error("❌ ไม่สามารถดึงชื่อโปรเจกต์จากคลาวด์ได้:", projectError.message);
      }

      // ใช้ชื่อที่ดึงมาสดๆ จากตารางซูพาเบส (หากดึงพลาดจะดรอปกลับไปใช้ชื่อจากพารามิเตอร์หรือชื่อ Default)
      const currentProjectName = projectData?.titles || projectName || "Untitled_Project";

      // 2. ดึงข้อมูลเนื้อหาเกม (Chapters, Blocks, Assets)
      const gameData = await handleExportZIP(projectId);
      if (!gameData) {
        alert("ไม่สามารถดึงข้อมูลสำหรับส่งออกได้ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล");
        setIsExporting(false);
        setExportProgress("");
        return;
      }

      const { chapters, blocks, assets } = gameData;

      setExportProgress("กำลังประมวลผลตัวละครและโครงสร้างสคริปต์...");

      // 🎯 ส่งข้อมูลเข้าฟังก์ชันเจเนอเรตสคริปต์ภาษา Ren'Py
      const rpyContent = compileRenPyScript(currentProjectName, chapters, blocks, assets);
      const configContent = generateConfigString(currentProjectName);
      // 🔥 [จุดที่ 1] เจนเนื้อหาของไฟล์สคริปต์ asset พิกัดซูมต่างๆ
      const assetsContent = generateAssetsRpy(assets); 

      // ==========================================
      // 📦 ZIP PACKAGING
      // ==========================================
      setExportProgress("กำลังม้วนสคริปต์ลงโฟลเดอร์ ZIP...");
      const zip = new JSZip();
      const gameFolder = zip.folder("game");
      
      gameFolder.file("script.rpy", rpyContent);
      gameFolder.file("project_config.rpy", configContent);
      // 🔥 [จุดที่ 2] เขียนไฟล์ assets_definition.rpy ลงไปในโฟลเดอร์ game ของ ZIP
      gameFolder.file("assets_definition.rpy", assetsContent); 

      const imagesFolder = gameFolder.folder("images");
      const audioFolder = gameFolder.folder("audio");

      if (assets && assets.length > 0) {
        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];
          if (!asset.storage_path) continue;

          try {
            setExportProgress(`กำลังดึงไฟล์ (${i + 1}/${assets.length}): ${asset.file_name || "คลังภาพ"}`);
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
                            fileType.includes("summit") || // แก้ไข typos เผื่อไว้
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
              audioFolder.file(finalFileName, fileBlob);
            } else {
              imagesFolder.file(finalFileName, fileBlob);
            }
          } catch (err) {
            console.error(`❌ Skip file [${asset.file_name}]:`, err);
          }
        }
      }

      setExportProgress("กำลังดาวน์โหลดไฟล์ลงเครื่อง...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const safeFileName = currentProjectName.toLowerCase().replace(/[\/:*?"<>|]/g, "_").trim();
      saveAs(zipBlob, `${safeFileName || "renpy_project"}_export.zip`);

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