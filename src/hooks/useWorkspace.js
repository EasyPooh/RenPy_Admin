// src/hooks/useWorkspace.js
import { useState, useEffect } from 'react';
import { getWorkspaceByChapterId, upsertWorkspaceConfig } from "../lib/workspaceService";

export const useWorkspace = (projectId, chapterId, setIsDataChanged) => {
  // 🌟 1. เปลี่ยนชื่อสเตทเป็น workspaces (เติม s) เพื่อบอกว่าก้อนนี้เก็บสเตทของ "ทุกบท" แยกด้วย ID
  const [workspaces, setWorkspaces] = useState({});
  const [blocks, setBlocks] = useState({}); // คงไว้ตามระบบเดิมของคุณ
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chapterId || chapterId === "mock-initial" || chapterId.length < 30) return; 
    
    // 🌟 2. ดักไว้: ถ้าในเครื่องมีสเตทของบทนี้อยู่แล้ว (กำลังแก้ไขค้างไว้) ไม่ต้องดึงจาก DB ซ้ำ ข้อมูลจะได้ไม่โดนทับ
    if (workspaces[chapterId]) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getWorkspaceByChapterId(chapterId);
        
        if (data) {
          // ถ้ามีข้อมูลใน DB -> บันทึกลงช่องของบทนั้นๆ
          setWorkspaces(prev => ({ ...prev, [chapterId]: data }));
        } else {
          console.log("ไม่พบข้อมูลเดิม เตรียมโครงสร้างรอไว้ใน Memory (เซฟจริงตอนกด Save All)...");
          
          // 🌟 3. แทนที่จะ Insert ลง DB ทันทีให้ติดกฎดีเลย์ เราสร้างก้อนจำลองรอไว้ในเครื่องก่อน
          const blankWorkspace = {
            chapter_id: chapterId,
            project_id: projectId,
            start_bg_asset_id: null,
            start_music_asset_id: null,
            start_characters: []
          };
          setWorkspaces(prev => ({ ...prev, [chapterId]: blankWorkspace }));
        }
      } catch (err) {
        console.error("Fetch workspace error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [chapterId, projectId]); 

  // 🌟 ดึงข้อมูลของบท "ปัจจุบัน" ออกมาส่งให้ UI แสดงผล
  const currentWorkspace = workspaces[chapterId] || null;

  // --- ฟังก์ชันอัปเดตสเตทจำในเครื่อง ---
  const updateConfig = (updates) => {
    if (!chapterId) return;

    setWorkspaces(prev => {
      const oldWs = prev[chapterId] || {
        chapter_id: chapterId,
        project_id: projectId,
        start_bg_asset_id: null,
        start_music_asset_id: null,
        start_characters: []
      };
      
      // อัปเดตเฉพาะบทที่เปิดอยู่ปัจจุบัน
      return {
        ...prev,
        [chapterId]: { ...oldWs, ...updates }
      };
    });

    if (setIsDataChanged) {
      setIsDataChanged(true);
    }
  };

  // ฟังก์ชันเซฟเฉพาะบทเดี่ยว (คงไว้เผื่อกรณีระบบคุณมีปุ่มเซฟแยกย่อย)
  const saveToDb = async () => {
    if (!currentWorkspace) return;
    
    try {
      const payload = {
        ...(currentWorkspace.id && { id: currentWorkspace.id }),
        chapter_id: chapterId,
        project_id: projectId,
        start_bg_asset_id: currentWorkspace.start_bg_asset_id || null,
        start_music_asset_id: currentWorkspace.start_music_asset_id || null,
        start_characters: currentWorkspace.start_characters || [],
      };

      const savedData = await upsertWorkspaceConfig(payload);
      
      if (savedData) {
        setWorkspaces(prev => ({ ...prev, [chapterId]: savedData }));
      }

      if (setIsDataChanged) setIsDataChanged(false);
      alert("💾 บันทึกข้อมูลฉากเริ่มต้นของบทนี้สำเร็จแล้ว!");
    } catch (err) {
      console.error("เซฟข้อมูลลง Supabase พัง:", err); 
      alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return { 
    workspace: currentWorkspace, // 🌟 ส่งก้อนของบทปัจจุบันไปให้หน้าลูกใช้ (หน้าลูกไม่ต้องแก้โค้ดเลย)
    allWorkspaces: workspaces,   // 🌟 ส่งก้อนใหญ่รวมทุกบทไปให้หน้าพ่อเพื่อใช้เซฟพร้อมกันทีเดียว
    blocks,  
    loading, 
    updateConfig, 
    saveToDb,
  };
};