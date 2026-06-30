// src/hooks/useSaveManager.js
import { useState } from 'react';
import { chapterService } from "../lib/chapterService";
import { supabase } from "../lib/supabaseClient"; 

export const useSaveManager = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async (
    projectId, 
    chapters, 
    allConfigs, 
    allBlocks, 
    pendingDeletions, 
    clearPendingDeletions, 
    setIsDataChanged
  ) => {
    console.log("🚨 ปุ่ม Save ถูกกดจริง! ฟังก์ชันใน useSaveManager เริ่มทำงานแล้ว");
    console.log("🔍 ตรวจสอบค่าที่ส่งเข้ามาในฟังก์ชัน -> allConfigs:", allConfigs, " | allBlocks:", allBlocks);

    localStorage.removeItem(`draft_blocks_project_${id}`);
    localStorage.removeItem(`draft_configs_project_${id}`);
    localStorage.removeItem(`draft_deletions_project_${id}`);
    
    setIsSaving(true);
    try {
      // 1. วนลูปเซฟข้อมูลพื้นฐานของ Chapters (ชื่อ, ลำดับ, แท็ก, สถานะ)
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        await chapterService.updateExistingChapter(c.id, c.name, i, c.tags || [], c.status);
      }

      // 2. วนลูปเซฟค่า Config ฉากเริ่มต้น (Background, Music, ตัวละคร) บันทึกลงตาราง chapters ตรงๆ
      if (allConfigs && Object.keys(allConfigs).length > 0) {
        const configList = Object.values(allConfigs);
        console.log("📦 ข้อมูลชุดตั้งต้นฉากที่จะอัปเดตลงเบส:", configList);

        for (const conf of configList) {
          const targetChapterId = conf.chapter_id || conf.id;
          if (!targetChapterId || targetChapterId === "mock-initial") continue;

          // แปลงฟอร์แมตกลุ่มตัวละครให้พร้อมลงตาราง jsonb / text[] เพื่อความปลอดภัย
          const charactersPayload = Array.isArray(conf.start_characters) 
            ? conf.start_characters 
            : [];

          const { data, error: configError } = await supabase
            .from('chapters')
            .update({
              start_bg_asset_id: conf.start_bg_asset_id || null,
              start_music_asset_id: conf.start_music_asset_id || null,
              start_characters: charactersPayload,
            })
            .eq('id', targetChapterId)
            .select();

          if (configError) {
            console.error(`❌ Supabase Update พังที่บท [${targetChapterId}]:`, configError.message);
          } else {
            console.log(`✅ อัปเดตข้อมูลตั้งต้นฉากบท [${targetChapterId}] สำเร็จ:`, data);
          }
        }
      }

      // 3. สั่งลบบล็อกที่ผู้ใช้เคยกดลบทิ้งค้างไว้ ออกจากฐานข้อมูล
      if (pendingDeletions && pendingDeletions.length > 0) {
        const { error: deleteError } = await supabase
          .from('blocks')
          .delete()
          .in('id', pendingDeletions);

        if (deleteError) throw deleteError;
        clearPendingDeletions(); 
      }

      // 4. บันทึก บล็อกเนื้อเรื่อง/คำสั่ง ทั้งหมดด้วยวิธี Bulk Upsert
      if (allBlocks) {
        const blocksToUpsert = [];

        for (const [chapterId, blockList] of Object.entries(allBlocks)) {
          if (!chapterId || chapterId === "mock-initial") continue;

          for (let index = 0; index < blockList.length; index++) {
            const b = blockList[index];
            
            const characterName = b.character_name || b.character || null;
            const assetId = b.type === 'dialogue' 
    ? (b.selected_asset_id || null)
    : (b.asset_id || b.background || b.audio || b.sprite || null);
            const contentText = b.type === 'dialogue' ? (b.text !== undefined ? b.text : '') : (b.content || '');

            const extraProperties = {
              expression: b.expression || null,
              sprite_tag: b.sprite_tag || null,
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

            let targetChapterId = b.target_chapter_id || b.target_workspace_id || b.target || b.targetChapterId || null;

            if (typeof targetChapterId === 'string') {
              targetChapterId = targetChapterId.trim();
              const lowerValue = targetChapterId.toLowerCase();
              if (targetChapterId === '' || lowerValue === 'null' || lowerValue === 'undefined' || lowerValue === 'return') {
                targetChapterId = null;
              }
            }

            if (b.type === 'jump') {
              const isReturnAction = b.action_type === 'return' || b.jumpType === 'return' || b.properties?.action_type === 'return' || b.properties?.jumpType === 'return';
              if (isReturnAction) targetChapterId = null;
            }

            if (targetChapterId && typeof targetChapterId === 'string' && targetChapterId.length < 30) {
              targetChapterId = null; 
            }

            const blockPayload = {
              id: b.id,
              chapter_id: chapterId, 
              type: b.type || 'default',
              character_name: characterName,
              content: contentText,
              asset_id: assetId,
              sort_order: index, 
              target_chapter_id: targetChapterId, 
              properties: extraProperties
            };

            if (typeof b.id === 'string' && b.id.length > 15) {
              blockPayload.id = b.id;
            }

            blocksToUpsert.push(blockPayload);
          }
        }

        if (blocksToUpsert.length > 0) {
          console.log("🚀 กำลังยิงบล็อกเนื้อหาขึ้นฐานข้อมูลแบบกลุ่ม:", blocksToUpsert);
          const { error: upsertError } = await supabase
            .from('blocks')
            .upsert(blocksToUpsert, { onConflict: 'id' });

          if (upsertError) throw upsertError;
        }
      }

      setIsDataChanged(false); 
      alert("💾 บันทึกโครงสร้างและบล็อกเนื้อหาทั้งหมดลงตารางบทเรียนสำเร็จเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลแบบรวมกลุ่ม:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveAll, isSaving };
};