// src/hooks/useBlocks.js
import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabaseClient";
import { useParams } from 'react-router-dom'; // 🟢 1. [เพิ่ม] อิมพอร์ต useParams มาใช้หา Project ID

export const useBlocks = (projectId, chapterId, setIsDataChanged) => {
  

  // 🟢 3. [แก้ไข] ให้ Initial State ไปเช็คข้อมูลร่างในคอมพิวเตอร์ก่อน ถ้ามีให้เอามาใช้เลย ไม่ต้องรอโหลดใหม่
  const [allBlocks, setAllBlocks] = useState(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`draft_blocks_project_${projectId}`);
      if (savedDraft) {
        try {
          return JSON.parse(savedDraft);
        } catch (e) {
          console.error("Parse draft_blocks ล้มเหลว:", e);
        }
      }
    }
    return {}; 
  });

  useEffect(() => {
  if (projectId) {
    const savedDraft = localStorage.getItem(`draft_blocks_project_${projectId}`);
    if (savedDraft) {
      setIsDataChanged(true); // สั่งเปิดสถานะ "มีข้อมูลยังไม่ได้บันทึก" ทันที
    }
  }
}, [projectId, setIsDataChanged]);

  // 🟢 4. [แก้ไข] ป้องกันข้อมูลบล็อกที่กดลบค้างไว้หายตอนสลับหน้า (ถ้าหาย ตอนกดเซฟจริง Supabase จะไม่ยอมลบให้)
  const [pendingDeletions, setPendingDeletions] = useState(() => {
    if (projectId) {
      const savedDeletions = localStorage.getItem(`draft_deletions_project_${projectId}`);
      return savedDeletions ? JSON.parse(savedDeletions) : [];
    }
    return [];
  }); 

  const [loading, setLoading] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState(null);

  // 🟢 5. [เพิ่ม] ใช้ useEffect บันทึกประวัติการลบบล็อกค้างไว้ลง LocalStorage ทันทีที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`draft_deletions_project_${projectId}`, JSON.stringify(pendingDeletions));
    }
  }, [pendingDeletions, projectId]);

  useEffect(() => {
    if (!chapterId || chapterId === "mock-initial" || chapterId.length < 30) return;
    
    // 🚨 จุดสำคัญ: ถ้าใน State มีบล็อกของบทนี้อยู่แล้ว (ไม่ว่าจะมาจากการพิมพ์ดราฟต์ค้างไว้ หรือเคยโหลดมาแล้ว)
    // จะ "ส่งคิวคืน" ทันที ไม่ยอมให้วิ่งไปดึงค่าดั้งเดิมจาก Supabase มาทับงานล่าสุดที่เพื่อนยังไม่ได้เซฟครับ
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
  }, [chapterId, allBlocks]); // 🟢 เพิ่ม allBlocks เข้าไปใน Dependencies ด้วยเพื่อความแม่นยำในการเช็คการอัปเดต

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

  const handleMoveBlock = (index, direction) => {
    if (!chapterId) return;

    const targetArray = allBlocks[chapterId] || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= targetArray.length) return;

    const updatedArray = [...targetArray];
    
    const temp = updatedArray[index];
    updatedArray[index] = updatedArray[targetIndex];
    updatedArray[targetIndex] = temp;

    setAllBlocks(prev => ({
      ...prev,
      [chapterId]: updatedArray
    }));

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
    handleMoveBlock, 
    clearPendingDeletions
  };
};