import { useState, useEffect } from 'react';
import { getWorkspaceByChapterId, updateWorkspaceConfig } from "../lib/workspaceService";
import { supabase } from "../lib/supabaseClient";

export const useWorkspace = (chapterId) => {
  const [workspace, setWorkspace] = useState(null);
  const [blocks, setBlocks] = useState({});// เก็บเฉพาะบล็อกของบทปัจจุบัน
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    if (!chapterId) return;
    const fetchData = async () => {
      setLoading(true);
      // สมมติว่ามี service ดึงข้อมูลทั้งคู่มาพร้อมกัน
      const data = await getWorkspaceByChapterId(chapterId);
      setWorkspace(data);
      // ถ้ามี service ดึง blocks ให้เรียกตรงนี้ เช่น:
      // const blks = await getBlocksByChapterId(chapterId);
      // setBlocks(blks);
      setLoading(false);
    };
    fetchData();
  }, [chapterId]);

  // --- ฟังก์ชัน Config ---
  const updateConfig = (updates) => {
    setPendingChanges(prev => ({ ...prev, ...updates }));
    setWorkspace(prev => ({ ...prev, ...updates }));
  };

  const saveToDb = async () => {
    if (!workspace?.id || Object.keys(pendingChanges).length === 0) return;
    await updateWorkspaceConfig(workspace.id, pendingChanges);
    setPendingChanges({});
  };

  // --- ฟังก์ชัน Blocks (ชื่อเดิมตามที่คุณต้องการ) ---
  const handleAddBlock = (type,activeChapterId, setFocusedBlockId) => {
    console.log("ถั่วต้ม! ปุ่มกดทำงานส่งประเภทมาคือ:", type);
    const newId = Date.now();
    let newBlock = {
      id: Date.now(),
      type: type || "default",
      content: `บล็อกใหม่ที่ #${(blocks[activeChapterId] || []).length + 1}`,
      createdAt: new Date().toLocaleTimeString(),
    };
    // ใช้ switch เพื่อเติมค่าเฉพาะตามประเภท
    switch (type) {
      case "dialogue":
        newBlock = {
          ...newBlock,
          character: "",
          expression: "normal",
          text: "",
        };
        break;
      case "scene":
        newBlock = {
          ...newBlock,
          background: "",
          backgroundEffect: "",
          backgroundEffectSpeed: "normal",
        };
        break;
      case "sprite":
        newBlock = {
          ...newBlock,
          sprite: "",
          spritecommand: "show",
          spriteposition: "center",
          spriteSpeed: "normal",
        };
        break;
      case "audio":
        newBlock = {
          ...newBlock,
          audio: "",
          audiotype: "bgm",
          audioCommand: "stop",
        };
        break;
      case "choice":
        newBlock = {
          ...newBlock,
          choice: "",
        };
        break;
    }

    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [activeChapterId]: [...(prevBlocks[activeChapterId] || []), newBlock],
    }));
    setFocusedBlockId(newId);

    const handleScroll = (id) => {
      const element = document.getElementById(`block-${id}`);

      if (element) {
        console.log("✅ พบ Element แล้ว กำลังสั่งให้เลื่อนไปที่:", id);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        console.warn("❌ ไม่พบ Element ที่มี ID:", `block-${id}`);
      }
    };
  };

  const handleUpdateBlock = (blockId, field, value,activeChapterId) => {
    if (!activeChapterId) return;
    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [activeChapterId]: (prevBlocks[activeChapterId] || []).map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            [field]: value,
          };
        }
        return block;
      }),
    }));
  };

  const handleDeleteBlock = (blockId,activeChapterId) => {
    const isConfirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะลบบล็อกนี้? ข้อมูลนี้ไม่สามารถกู้คืนได้",
    );

    // 2. ถ้าผู้ใช้กด "ตกลง" ถึงจะให้ทำงานต่อ
    if (isConfirmed) {
      if (!activeChapterId) return;
      setBlocks((prevBlocks) => ({
        ...prevBlocks,
        [activeChapterId]: (prevBlocks[activeChapterId] || []).filter(
          (block) => block.id !== blockId,
        ),
      }));
      alert("ลบบล็อกสำเร็จแล้ว!");
    }
  };

  return { 
    workspace, 
    blocks, 
    loading, 
    updateConfig, 
    saveToDb,
    // ส่งฟังก์ชันชื่อเดิมออกไปให้ UI ใช้งาน
    handleAddBlock, 
    handleUpdateBlock, 
    handleDeleteBlock 
  };
};