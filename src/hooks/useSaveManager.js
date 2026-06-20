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

      // 2. วนลูปเซฟทุก Workspace ที่เปิดใช้งานอยู่ปัจจุบัน
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

      /* ========================================================
          🛡️ ขั้นตอนพิเศษเพิ่มเติม: ป้องกันเออเร่อตระกูลสัญญาสนิม (Foreign Key 23503)
          ตรวจสอบและสร้าง Row ตั้งต้นให้ทุก Workspace ของทุก Chapter ก่อนจะเซฟบล็อก
         ======================================================== */
      if (chapters && chapters.length > 0) {
        for (const c of chapters) {
          let wsId = null;
          if (Array.isArray(c.workspaces) && c.workspaces[0]) {
            wsId = c.workspaces[0].id;
          } else if (c.workspaces && c.workspaces.id) {
            wsId = c.workspaces.id;
          } else if (c.workspace_id) {
            wsId = c.workspace_id;
          }

          if (wsId) {
            const { error: wsEnsureError } = await supabase
              .from('workspaces')
              .upsert({
                id: wsId,
                chapter_id: c.id,
                project_id: projectId
              }, { onConflict: 'id' });

            if (wsEnsureError) console.error("⚠️ ไม่สามารถบันทึกข้อมูลผังตั้งต้นได้:", wsEnsureError);
          }
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

      // 4. บันทึก Blocks ทั้งหมดด้วยวิธี Bulk Upsert
      if (allBlocks) {
        const blocksToUpsert = [];
        const chapterToWorkspaceMap = {};
        const validWorkspaceIds = new Set();

        /* ========================================================
            🎯 [ปรับปรุง] ดึงข้อมูลจากฐานทะเบียนผังทั้งหมดที่มีในระบบปัจจุบัน
           ======================================================== */
        // ทางเลือกหลัก: ดึงจากก้อนโครงสร้างแบนราบของ allWorkspaces (แม่นยำสูง)
        if (allWorkspaces) {
          Object.values(allWorkspaces).forEach(ws => {
            if (ws.id && ws.chapter_id) {
              chapterToWorkspaceMap[ws.chapter_id] = ws.id;
              validWorkspaceIds.add(ws.id);
            }
          });
        }

        // ทางเลือกเสริม: ป้องกันการตกหล่น ดึงโครงสร้างความสัมพันธ์จาก chapters มาสมทบด้วย
        if (chapters) {
          chapters.forEach(c => {
            let wsId = c.workspace_id || (c.workspaces?.id) || (Array.isArray(c.workspaces) && c.workspaces[0]?.id);
            if (wsId) {
              chapterToWorkspaceMap[c.id] = wsId;
              validWorkspaceIds.add(wsId);
            }
          });
        }

        for (const [wsId, blockList] of Object.entries(allBlocks)) {
          for (let index = 0; index < blockList.length; index++) {
            const b = blockList[index];
            
            const characterName = b.character_name || b.character || null;
            const assetId = b.asset_id || b.background || b.audio || b.sprite || null;

            const contentText = b.type === 'dialogue' 
              ? (b.text !== undefined ? b.text : '') 
              : (b.content || '');

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
              ...(b.properties || {})
            };

            // 🌟 [ปรับปรุง] ดักจับชื่อฟิลด์เป้าหมายให้ครอบคลุมทุกคีย์ที่หน้าบ้านอาจจะส่งมา
            let targetWorkspaceId = b.target_workspace_id || b.target_chapter_id || b.target || b.targetWorkspaceId || null;

            // กรองขั้นที่ 1: ล้างค่าสตริงเปล่าหรือคำแปลกปลอม
            if (typeof targetWorkspaceId === 'string') {
              targetWorkspaceId = targetWorkspaceId.trim();
              const lowerValue = targetWorkspaceId.toLowerCase();
              if (
                targetWorkspaceId === '' || 
                lowerValue === 'null' || 
                lowerValue === 'undefined' || 
                lowerValue === 'return'
              ) {
                targetWorkspaceId = null;
              }
            }

            // กรองขั้นที่ 2: ดักจับกรณีผู้ใช้เปลี่ยนไปเลือกจบเกม (return)
            if (b.type === 'jump') {
              const isReturnAction = 
                b.action_type === 'return' || 
                b.jumpType === 'return' || 
                b.properties?.action_type === 'return' || 
                b.properties?.jumpType === 'return';

              if (isReturnAction) {
                targetWorkspaceId = null;
              }
            }

            /* ========================================================
               🔄 [ปรับปรุงกรองขั้นที่ 3] ยืดหยุ่น ไม่ล้างค่า UUID ทิ้งมั่วซั่ว
               ======================================================== */
            if (targetWorkspaceId) {
              if (validWorkspaceIds.has(targetWorkspaceId)) {
                // สถานการณ์ A: หน้าบ้านแนบรหัส Workspace ID ปลายทางมาตรงล็อกอยู่แล้ว -> ผ่านฉลุย
              } else if (chapterToWorkspaceMap[targetWorkspaceId]) {
                // สถานการณ์ B: หน้าบ้านส่งรหัส Chapter ID มา -> สลับร่างแปลงเป็น Workspace ID ของบทนั้นให้ทันที!
                targetWorkspaceId = chapterToWorkspaceMap[targetWorkspaceId];
              } else {
                // สถานการณ์ C: ไม่เจอข้อมูลรหัสในแผนที่
                // 💡 ปรับปรุง: ถ้าค่าที่ส่งมาหน้าตาเป็น UUID (ความยาว > 30 ตัวอักษร) ให้ปล่อยผ่านไปเซฟก่อน เผื่อเป็นผังเรื่องใหม่ที่กำลังรอโหลดข้อมูล ห้ามปรับเป็น null ทันที
                if (typeof targetWorkspaceId === 'string' && targetWorkspaceId.length < 30) {
                  targetWorkspaceId = null; 
                }
              }
            }

            const blockPayload = {
              id: b.id,
              workspace_id: wsId,
              type: b.type || 'default',
              character_name: characterName,
              content: contentText,
              asset_id: assetId,
              sort_order: index, 
              target_workspace_id: targetWorkspaceId, 
              properties: extraProperties
            };

            if (typeof b.id === 'string' && b.id.length > 15) {
              blockPayload.id = b.id;
            }

            blocksToUpsert.push(blockPayload);
          }
        }

        console.log("🚀 Blocks payload ready to upsert:", blocksToUpsert);

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