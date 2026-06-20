// src/hooks/useBlocks.js
import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabaseClient";

export const useBlocks = (workspaceId ,setIsDataChanged) => {
  const [allBlocks, setAllBlocks] = useState({}); 
  const [pendingDeletions, setPendingDeletions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState(null);

  useEffect(() => {
    if (!workspaceId || workspaceId === "mock-initial" || workspaceId.length < 30) return;
    if (allBlocks[workspaceId]) return;

    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blocks')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedBlocks = data.map(row => {
            const props = row.properties || {};
            
            return {
              id: row.id, 
              type: row.type,
              content: row.content,
              ...props, // ดึงพรอพเพอร์ตี้ยิบย่อยจาก JSON เช่น backgroundEffect ออกมาก่อน

              // 🌟 จุดสำคัญ: ดึงค่าจากคอลัมน์หลักในเบส กลับมาเป็นชื่อตัวแปรที่หน้าบ้านใช้

              // 🌟 เพิ่มบรรทัดนี้เข้าไปครับ! ดึงค่าจากคอลัมน์หลักมาเก็บใน State หน้าบ้าน
              target_workspace_id: row.target_workspace_id || null,
              
              // 1. แปลงบทพูดคืนค่าให้ตัวแปร text ที่กล่องบทสนทนารออ่าน
              text: row.type === 'dialogue' ? (row.content || '') : '',
              
              // 2. แปลงชื่อตัวละครในเบสกลับมาเป็นชื่อตัวแปร character
              character: row.character_name || '',

              // 3. แปลงรหัสจากคอลัมน์ asset_id คืนค่าให้ตรงกับ Dropdown แต่ละประเภทบล็อก
              background: row.type === 'scene' ? (row.asset_id || '') : '',
              sprite: row.type === 'sprite' ? (row.asset_id || '') : '',
              audio: row.type === 'audio' ? (row.asset_id || '') : '',
            };
          });

          setAllBlocks(prev => ({ ...prev, [workspaceId]: formattedBlocks }));
        } else {
          setAllBlocks(prev => ({ ...prev, [workspaceId]: [] }));
        }
      } catch (err) {
        console.error("❌ ดึงข้อมูลบล็อกล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [workspaceId]);

  const currentBlocks = allBlocks[workspaceId] || [];

  const handleAddBlock = (type) => {
    if (!workspaceId) return;
    const newId = crypto.randomUUID() 
    
    let newBlock = {
      id: newId,
      type: type || "default",
      content: `บล็อกใหม่ที่ #${currentBlocks.length + 1}`,
      createdAt: new Date().toLocaleTimeString(),
    };

    switch (type) {
      case "dialogue":
        newBlock = { ...newBlock, character: "", expression: "normal", text: "" };
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
      target_workspace_id: null,  // เริ่มต้นเป็น null (ยังไม่ได้เลือกบทปลายทาง)
      action_type: "jump"         // ค่าเริ่มต้นของ Radio Button ให้เป็นแบบกระโดดข้ามบท
    };
    break;
    }

    setAllBlocks(prev => ({
      ...prev,
      [workspaceId]: [...(prev[workspaceId] || []), newBlock]
    }));
    setFocusedBlockId(newId);
    setIsDataChanged(true);
  };

  // --- 🟨 2. อัปเดตข้อมูลบล็อก (แก้ไขตัวแปรดักควานหาแล้ว ✨) ---
  const handleUpdateBlock = (blockId, field, value) => {
    if (!workspaceId) return; // 🌟 แก้จาก chapterId เป็น workspaceId เรียบร้อยครับ
    setAllBlocks(prev => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map(block =>
        block.id === blockId ? { ...block, [field]: value } : block
      )
    }));
    setIsDataChanged(true);
  };

  const handleDeleteBlock = (blockId) => {
    if (!workspaceId) return;
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบบล็อกนี้? ข้อมูลนี้ไม่สามารถกู้คืนได้")) {
      
      if (typeof blockId === 'string') {
        setPendingDeletions(prev => [...prev, blockId]);
      }

      setAllBlocks(prev => ({
        ...prev,
        [workspaceId]: (prev[workspaceId] || []).filter(block => block.id !== blockId)
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