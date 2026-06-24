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
              ...props, // ดึงพรอพเพอร์ตี้ยิบย่อยจาก JSON เช่น backgroundEffect ออกมาก่อน

              // 🌟 จุดสำคัญ: ดึงค่าจากคอลัมน์หลักในเบส กลับมาเป็นชื่อตัวแปรที่หน้าบ้านใช้

              // 🌟 เพิ่มบรรทัดนี้เข้าไปครับ! ดึงค่าจากคอลัมน์หลักมาเก็บใน State หน้าบ้าน
              target_chapter_id: row.target_chapter_id || null,
              
              // 1. แปลงบทพูดคืนค่าให้ตัวแปร text ที่กล่องบทสนทนารออ่าน
              text: row.type === 'dialogue' ? (row.content || '') : '',
              
              // 2. แปลงชื่อตัวละครในเบสกลับมาเป็นชื่อตัวแปร character
              character: row.character_name || '',

              //ดึง asset_id มาใส่ให้ตัวแปร selected_asset_id ของบล็อกสนทนา
              selected_asset_id: row.type === 'dialogue' ? (row.asset_id || null) : null,

              // 3. แปลงรหัสจากคอลัมน์ asset_id คืนค่าให้ตรงกับ Dropdown แต่ละประเภทบล็อก
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
      target_chapter_id: null,  // เริ่มต้นเป็น null (ยังไม่ได้เลือกบทปลายทาง)
      action_type: "jump"         // ค่าเริ่มต้นของ Radio Button ให้เป็นแบบกระโดดข้ามบท
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

  // --- 🟨 2. อัปเดตข้อมูลบล็อก  ---
  const handleUpdateBlock = (blockId, fieldOrObject, value) => {
  if (!chapterId) return; // 🌟 (หรือ workspaceId ตามที่คุณเปลี่ยนไว้)

  setAllBlocks(prev => ({
    ...prev,
    [chapterId]: (prev[chapterId] || []).map(block => {
      if (block.id === blockId) {
        // 🌟 จุดเด่น: เช็กว่าถ้าอาร์กิวเมนต์ที่ 2 เป็น Object ให้แตกกระจายค่าลงไปเลย
        if (typeof fieldOrObject === "object" && fieldOrObject !== null) {
          return { ...block, ...fieldOrObject };
        }
        
        // 🌟 ถ้าเป็น String ปกติ ให้ทำงานแบบเดิม (Dynamic Key)
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
    clearPendingDeletions
  };
};