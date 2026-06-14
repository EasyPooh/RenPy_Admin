import { useState, useEffect } from 'react';
import { getWorkspaceByChapterId } from "../lib/workspaceService";

export const useWorkspace = (chapterId) => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getWorkspaceByChapterId(chapterId);
        setWorkspace(data);
      } catch (error) {
        console.error("Error fetching workspace:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterId]);

  return { workspace, loading }; // คืนค่าสิ่งที่ UI ต้องใช้
};