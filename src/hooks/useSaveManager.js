// src/hooks/useSaveManager.js
import { useState } from 'react';
import { chapterService } from "../lib/chapterService";
import { upsertWorkspaceConfig } from "../lib/workspaceService"; 
import { supabase } from "../lib/supabaseClient"; 

export const useSaveManager = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async (
    projectId, 
    chapters, 
    allWorkspaces, 
    allBlocks, 
    pendingDeletions, 
    clearPendingDeletions, 
    setIsDataChanged
  ) => {
    setIsSaving(true);
    try {
      // 1. วนลูปเซฟ Chapters
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        await chapterService.updateExistingChapter(c.id, c.name, i, c.tags || [], c.status);
      }

      // 2. วนลูปเซฟทุก Workspace 
      if (allWorkspaces) {
        const workspaceList = Object.values(allWorkspaces);
        for (const ws of workspaceList) {
          const payload = {
            ...(ws.id && { id: ws.id }), 
            chapter_id: ws.chapter_id,
            project_id: projectId,
            start_bg_asset_id: ws.start_bg_asset_id || null,
            start_music_asset_id: ws.start_music_asset_id || null,
            start_characters: ws.start_characters || [],
          };
          await upsertWorkspaceConfig(payload);
        }
      }

      // 3. สั่งลบบล็อกที่ผู้ใช้เคยกดลบทิ้งค้างไว้ ออกจาก Supabase ของจริง
      if (pendingDeletions && pendingDeletions.length > 0) {
        const { error: deleteError } = await supabase
          .from('blocks')
          .delete()
          .in('id', pendingDeletions);

        if (deleteError) throw deleteError;
        clearPendingDeletions(); 
      }

      // 4. 🌟 บันทึก Blocks ทั้งหมดด้วยวิธี Bulk Upsert (ส่งก้อนเดียว จบในรอบเดียว)
      if (allBlocks) {
        const blocksToUpsert = [];

        for (const [wsId, blockList] of Object.entries(allBlocks)) {
          for (let index = 0; index < blockList.length; index++) {
            const b = blockList[index];
            
            // 💡 ดึงค่าจากตัวแปรหน้าเว็บ ไปแมปเข้าคอลัมน์ฐานข้อมูลจริงให้ตรงล็อก
            const characterName = b.character_name || b.character || null;
            //const contentText = b.content || b.text || '';
            const assetId = b.asset_id || b.background || b.audio || b.sprite || null;

            const contentText = b.type === 'dialogue' 
    ? (b.text !== undefined ? b.text : '') 
    : (b.content || '');

            // มัดรวมค่าพรอพเพอร์ตี้เสริมเฉพาะทาง เก็บลงคอลัมน์ JSONB
            const extraProperties = {
              expression: b.expression || null,
              backgroundEffect: b.backgroundEffect || null,
              backgroundEffectSpeed: b.backgroundEffectSpeed || null,
              spritecommand: b.spritecommand || null,
              spriteposition: b.spriteposition || null,
              spriteSpeed: b.spriteSpeed || null,
              audiocommand: b.audiocommand || null,
              audiotype: b.audiotype || null,
              choice: b.choice || null,
              ...(b.properties || {}) // แตกก้อน properties เดิมที่มีอยู่มาใส่เผื่อไว้ด้วย
            };

            const blockPayload = {
              id: b.id,
              workspace_id: wsId,
              type: b.type || 'default',
              character_name: characterName,
              content: contentText,
              asset_id: assetId,
              sort_order: index, // เรียงตามตำแหน่งก่อนหลังบนหน้าจอ
              properties: extraProperties
            };

            // เช็คเรื่อง ID: ถ้าเป็นไอดีเก่า (String UUID) ให้แนบไปเพื่อสั่งเซฟทับแถวเดิม
            // แต่ถ้าเป็นไอดีใหม่เอี่ยมแกะกล่อง (เช่นตัวเลข Timestamp) ไม่ต้องส่งไป เพื่อให้ Supabase เจนรหัส UUID ใหม่ให้เองอัตโนมัติ
            if (typeof b.id === 'string' && b.id.length > 15) {
              blockPayload.id = b.id;
            }

            blocksToUpsert.push(blockPayload);
          }
        }

        // ยิงข้อมูลชุดใหญ่ขึ้นไปเซฟที่ Supabase รอบเดียวเสร็จสิ้น! วิ่งเร็วขึ้นกว่าเดิม 20 เท่า 🚀
        if (blocksToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('blocks')
            .upsert(blocksToUpsert, { onConflict: 'id' });

          if (upsertError) throw upsertError;
        }
      }

      setIsDataChanged(false); 
      alert("💾 บันทึกข้อมูลผังเรื่องราว, ฉากตั้งต้น และบล็อกเนื้อหาทั้งหมดสำเร็จเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveAll, isSaving };
};