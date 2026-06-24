// src/hooks/useChapterConfig.js
import { useState, useEffect } from 'react';
import { getChapterConfigById } from "../lib/chapterConfigService";

export const useChapterConfig = (projectId, chapterId, setIsDataChanged) => {
  // เปลี่ยนชื่อ state ข้างในให้อ่านง่ายขึ้น แต่เก็บ logic มหาเทพของคุณไว้เหมือนเดิม
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chapterId || chapterId === "mock-initial" || chapterId.length < 30) return; 
    if (configs[chapterId]) return; // ระบบความจำจำกัด (Cache) ที่คุณเขียนไว้ดีมาก คงไว้เลยครับ!

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getChapterConfigById(chapterId);
        
        if (data) {
          setConfigs(prev => ({ ...prev, [chapterId]: data }));
        }
      } catch (err) {
        console.error("Fetch chapter config error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [chapterId, projectId]); 

  const currentConfig = configs[chapterId] || null;

  const updateConfig = (updates) => {
    if (!chapterId) return;

    setConfigs(prev => {
      const oldConfig = prev[chapterId] || {
        id: chapterId,
        project_id: projectId,
        start_bg_asset_id: null,
        start_music_asset_id: null,
        start_characters: []
      };
      
      return {
        ...prev,
        [chapterId]: { ...oldConfig, ...updates }
      };
    });

    if (setIsDataChanged) {
      setIsDataChanged(true);
    }
  };

  return { 
    config: currentConfig, 
    allConfigs: configs, // 🎯 หมุดสำคัญ: ต้องเพิ่มบรรทัดนี้เพื่อส่งก้อน Config ทั้งหมดออกไปให้ไฟล์พ่อใช้เซฟ!
    loading, 
    updateConfig,
  };
};