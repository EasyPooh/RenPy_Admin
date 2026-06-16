// src/hooks/useSaveManager.js
import { useState } from 'react';
import { chapterService } from "../lib/chapterService";
import { upsertWorkspaceConfig } from "../lib/workspaceService"; 

export const useSaveManager = () => {
  const [isSaving, setIsSaving] = useState(false);

  // 🌟 เปลี่ยนพารามิเตอร์รับเป็น allWorkspaces (และเอา activeChapterId ออกเนื่องจากเราจะเซฟทุกบทอยู่แล้ว)
  const handleSaveAll = async (projectId, chapters, allWorkspaces, setIsDataChanged) => {
    setIsSaving(true);
    try {
      // 1. วนลูปเซฟ Chapters (ทำงานเหมือนเดิม)
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        await chapterService.updateExistingChapter(c.id, c.name, i, c.tags || [], c.status);
      }

      // 2. 🌟 วนลูปเซฟทุก Workspace ที่มีการโหลดขึ้นมาหรือถูกแก้ไขในเครื่องพร้อมๆ กัน
      if (allWorkspaces) {
        const workspaceList = Object.values(allWorkspaces); // แปลงก้อน Dictionary Map ให้กลายเป็น Array เพื่อวนลูป
        
        for (const ws of workspaceList) {
          const payload = {
            ...(ws.id && { id: ws.id }), // ถ้าเคยมีใน DB มันจะส่ง ID ไปอัปเดต ถ้าไม่มีจะเป็นแถวใหม่
            chapter_id: ws.chapter_id,
            project_id: projectId,
            start_bg_asset_id: ws.start_bg_asset_id || null,
            start_music_asset_id: ws.start_music_asset_id || null,
            start_characters: ws.start_characters || [],
          };

          // ยิงเข้าฐานข้อมูลทีละบทจนครบขบวน
          await upsertWorkspaceConfig(payload);
        }
      }

      setIsDataChanged(false); 
      alert("💾 บันทึกข้อมูล Chapters และ Workspace ทุกบทสำเร็จเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveAll, isSaving };
};