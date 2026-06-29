// src/hooks/useBlocks.js
import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabaseClient";

export const useBlocks = (chapterId ,setIsDataChanged) => {
  const [allBlocks, setAllBlocks] = useState({}); 
  const [pendingDeletions, setPendingDeletions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState(null);

  useEffect(() => {
    if (!chapterId || chapterId === "mock-initial" || chapterId.length < 30) return;
    if (allBlocks[chapterId]) return;

    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blocks')
          .select('*,assets:asset_id (file_name)')
          .eq('chapter_id', chapterId)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedBlocks = data.map(row => {
            const props = row.properties || {};
            
            return {
              id: row.id, 
              type: row.type,
              content: row.content,
              file_name: row.assets?.file_name,
              ...props, 

              target_chapter_id: row.target_chapter_id || null,
              text: row.type === 'dialogue' ? (row.content || '') : '',
              character: row.character_name || '',
              selected_asset_id: row.type === 'dialogue' ? (row.asset_id || null) : null,

              background: row.type === 'scene' ? (row.asset_id || '') : '',
              sprite: row.type === 'sprite' ? (row.asset_id || '') : '',
              audio: row.type === 'audio' ? (row.asset_id || '') : '',
            };
          });

          setAllBlocks(prev => ({ ...prev, [chapterId]: formattedBlocks }));
        } else {
          setAllBlocks(prev => ({ ...prev, [chapterId]: [] }));
        }
      } catch (err) {
        console.error("❌ ดึงข้อมูลบล็อกล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [chapterId]);

  const currentBlocks = allBlocks[chapterId] || [];

  const handleAddBlock = (type, inheritedData = null) => {
    if (!chapterId) return;
    const newId = crypto.randomUUID() 
    
    let newBlock = {
      id: newId,
      type: type || "default",
      content: `บล็อกใหม่ที่ #${currentBlocks.length + 1}`,
      createdAt: new Date().toLocaleTimeString(),
    };

    switch (type) {
      case "dialogue":
        newBlock = { ...newBlock, character: inheritedData?.character || "", expression: inheritedData?.expression || "",selected_asset_id: inheritedData?.selected_asset_id || null,
      sprite_tag: inheritedData?.sprite_tag || "", text: "" };
        break;
      case "scene":
        newBlock = { ...newBlock, background: "", backgroundEffect: "", backgroundEffectSpeed: "normal" };
        break;
      case "sprite":
        newBlock = { ...newBlock, sprite: "", spritecommand: "show", spriteposition: "center", spriteSpeed: "normal" };
        break;
      case "audio":
        newBlock = { ...newBlock, audio: "", audiotype: "bgm", audioCommand: "stop" };
        break;
      case "choice":
        newBlock = { ...newBlock, choice: "" };
        break;
      case "jump":
        newBlock = { 
          ...newBlock, 
          target_chapter_id: null,  
          action_type: "jump"         
        };
        break;
    }

    setAllBlocks(prev => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), newBlock]
    }));
    setFocusedBlockId(newId);
    setIsDataChanged(true);
  };

  const handleUpdateBlock = (blockId, fieldOrObject, value) => {
    if (!chapterId) return; 

    setAllBlocks(prev => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).map(block => {
        if (block.id === blockId) {
          if (typeof fieldOrObject === "object" && fieldOrObject !== null) {
            return { ...block, ...fieldOrObject };
          }
          return { ...block, [fieldOrObject]: value };
        }
        return block;
      })
    }));
    
    setIsDataChanged(true);
  };

  const handleDeleteBlock = (blockId) => {
    if (!chapterId) return;
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบบล็อกนี้? ข้อมูลนี้ไม่สามารถกู้คืนได้")) {
      
      if (typeof blockId === 'string') {
        setPendingDeletions(prev => [...prev, blockId]);
      }

      setAllBlocks(prev => ({
        ...prev,
        [chapterId]: (prev[chapterId] || []).filter(block => block.id !== blockId)
      }));
      alert("ลบบล็อกสำเร็จแล้ว!");
    }
    setIsDataChanged(true);
  };

  // --- 🟩 ฟังก์ชันสำหรับกดสลับตำแหน่งบล็อกฟอร์ม ขึ้น - ลง ---
  const handleMoveBlock = (index, direction) => {
    if (!chapterId) return;

    const targetArray = allBlocks[chapterId] || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // ระบบป้องกัน: ถ้าตำแหน่งเป้าหมายหลุดขอบอาร์เรย์ (เช่น ตัวแรกสุดกดขึ้น หรือตัวสุดท้ายกดลง) ให้หยุดการทำงาน
    if (targetIndex < 0 || targetIndex >= targetArray.length) return;

    // ทำการโคลน Array เพื่อไม่ให้กระทบ State เดิมโดยตรง (Immutability)
    const updatedArray = [...targetArray];
    
    // สลับตำแหน่งของ Object ระหว่าง index ปัจจุบัน กับ targetIndex (Swap Elements)
    const temp = updatedArray[index];
    updatedArray[index] = updatedArray[targetIndex];
    updatedArray[targetIndex] = temp;

    // อัปเดตค่ากลับเข้าไปในโครงสร้าง State แบบ Object ที่ผูกกับ chapterId
    setAllBlocks(prev => ({
      ...prev,
      [chapterId]: updatedArray
    }));

    // เปิดสวิตช์สถานะแจ้งหน้าบ้านว่าข้อมูลมีการเปลี่ยนแปลงเพื่อให้ปุ่มบันทึกทำงาน
    setIsDataChanged(true);
  };

  const clearPendingDeletions = () => setPendingDeletions([]);

  return {
    blocks: currentBlocks,       
    allBlocks,                  
    pendingDeletions,           
    loading,
    focusedBlockId,
    setFocusedBlockId,
    handleAddBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handleMoveBlock, // 👈 🌟 ส่งฟังก์ชันนี้ออกไปให้หน้าบ้านเรียกใช้ได้เลยครับ
    clearPendingDeletions
  };
};