// src/hooks/useBlocks.js
import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabaseClient";

// 🟢 [แก้ไข] เพิ่ม Parameter "isDataChanged" เข้ามาในวงเล็บ
export const useBlocks = (projectId, chapterId, isDataChanged, setIsDataChanged) => {
  
  // 1. โหลดข้อมูลดราฟต์เริ่มต้นจากคอมพิวเตอร์ (คงเดิมไว้)
  const [allBlocks, setAllBlocks] = useState(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`draft_blocks_project_${projectId}`);
      if (savedDraft) {
        try { return JSON.parse(savedDraft); } catch (e) { console.error(e); }
      }
    }
    return {}; 
  }); 

  const [pendingDeletions, setPendingDeletions] = useState(() => {
    if (projectId) {
      const savedDeletions = localStorage.getItem(`draft_deletions_project_${projectId}`);
      return savedDeletions ? JSON.parse(savedDeletions) : [];
    }
    return [];
  }); 

  const [loading, setLoading] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState(null);

  // 2. เซฟประวัติการลบค้างไว้ลง LocalStorage (คงเดิมไว้)
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`draft_deletions_project_${projectId}`, JSON.stringify(pendingDeletions));
    }
  }, [pendingDeletions, projectId]);

  // 🟢 3. [เพิ่มใหม่] ย้ายระบบ Auto-Save ของบล็อกมาอยู่ในนี้ เมื่อมีการพิมพ์และสถานะเปลี่ยน ให้เซฟลงเครื่องทันที
  useEffect(() => {
    if (projectId && isDataChanged && Object.keys(allBlocks).length > 0) {
      localStorage.setItem(`draft_blocks_project_${projectId}`, JSON.stringify(allBlocks));
    }
  }, [allBlocks, projectId, isDataChanged]);

  // 4. เช็คว่าถ้าเปิดหน้าเว็บมาแล้วเจอดราฟต์ค้างอยู่ ให้เปิดสวิตช์แจ้งเตือนหน้าบ้านทันที (คงเดิมไว้)
  useEffect(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`draft_blocks_project_${projectId}`);
      if (savedDraft) {
        setIsDataChanged(true);
      }
    }
  }, [projectId, setIsDataChanged]);

  // 5. ดึงข้อมูลจาก Supabase (คงเดิมไว้)
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
  }, [chapterId, allBlocks]);

  const currentBlocks = allBlocks[chapterId] || [];

  

  const handleAddBlock = (type, inheritedData = null) => {
    const initialContent = type === "dialogue" ? "" : null;
    if (!chapterId) return;
    const newId = crypto.randomUUID();
    let newBlock = {
      id: newId,
      type: type || "default",
      content: initialContent,
      createdAt: new Date().toLocaleTimeString(),
    };

    switch (type) {
      case "dialogue":
        newBlock = { ...newBlock, character: inheritedData?.character || "", expression: inheritedData?.expression || "",selected_asset_id: inheritedData?.selected_asset_id || null, sprite_tag: inheritedData?.sprite_tag || "", text: "" };
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
        newBlock = { ...newBlock, target_chapter_id: null, action_type: "jump" };
        break;
    }

    setAllBlocks(prev => ({ ...prev, [chapterId]: [...(prev[chapterId] || []), newBlock] }));
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

    setAllBlocks(prev => ({ ...prev, [chapterId]: updatedArray }));
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