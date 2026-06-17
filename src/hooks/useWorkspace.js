// src/hooks/useWorkspace.js
import { useState, useEffect } from 'react';
import { getWorkspaceByChapterId, upsertWorkspaceConfig } from "../lib/workspaceService";

export const useWorkspace = (projectId, chapterId, setIsDataChanged) => {
  const [workspaces, setWorkspaces] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chapterId || chapterId === "mock-initial" || chapterId.length < 30) return; 
    
    if (workspaces[chapterId]) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getWorkspaceByChapterId(chapterId);
        
        if (data) {
          setWorkspaces(prev => ({ ...prev, [chapterId]: data }));
        } else {
          console.log("ไม่พบข้อมูลเดิม เตรียมโครงสร้างรอไว้ใน Memory...");
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

  const currentWorkspace = workspaces[chapterId] || null;

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
      
      return {
        ...prev,
        [chapterId]: { ...oldWs, ...updates }
      };
    });

    if (setIsDataChanged) {
      setIsDataChanged(true);
    }
  };

  return { 
    workspace: currentWorkspace, 
    allWorkspaces: workspaces,   
    loading, 
    updateConfig, 
  };
};