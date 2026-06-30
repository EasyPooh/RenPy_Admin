// src/hooks/useChapterConfig.js
import { useState, useEffect } from 'react';
import { getChapterConfigById } from "../lib/chapterConfigService";

// 🟢 [แก้ไข] เพิ่ม Parameter "isDataChanged" เข้ามาในวงเล็บเช่นกัน
export const useChapterConfig = (projectId, chapterId, isDataChanged, setIsDataChanged) => {
  
  const [configs, setConfigs] = useState(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`draft_configs_project_${projectId}`);
      if (savedDraft) {
        try { return JSON.parse(savedDraft); } catch (e) { console.error(e); }
      }
    }
    return {};
  });

  const [loading, setLoading] = useState(false);

  // 🟢 [เพิ่มใหม่] ระบบ Auto-Save คอนฟิกตัวละคร/ฉากหลัง ฝังใน Hook ตัวเอง
  useEffect(() => {
    if (projectId && isDataChanged && Object.keys(configs).length > 0) {
      localStorage.setItem(`draft_configs_project_${projectId}`, JSON.stringify(configs));
    }
  }, [configs, projectId, isDataChanged]);

  useEffect(() => {
    if (projectId) {
      const savedDraft = localStorage.getItem(`draft_configs_project_${projectId}`);
      if (savedDraft) {
        setIsDataChanged(true);
      }
    }
  }, [projectId, setIsDataChanged]);

  useEffect(() => {
    if (!chapterId || chapterId === "mock-initial" || chapterId.length < 30) return; 
    if (configs[chapterId]) return; 

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
  }, [chapterId, projectId, configs]);

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
      return { ...prev, [chapterId]: { ...oldConfig, ...updates } };
    });

    if (setIsDataChanged) {
      setIsDataChanged(true);
    }
  };

  return { 
    config: currentConfig, 
    allConfigs: configs, 
    loading, 
    updateConfig,
  };
};