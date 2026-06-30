// src/contexts/WorkspaceContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // 🟢 1. [เพิ่ม] ดึง useParams มาใช้คู่กับโปรเจกต์

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children, initialId }) => {
  const { id: projectId } = useParams(); // 🟢 2. [เพิ่ม] หาไอดีโปรเจกต์

  // 🟢 3. [แก้ไข] เช็คว่าเคยเปิดบทไหนค้างไว้ล่าสุดในโปรเจกต์นี้ไหม ถ้ามีให้ดึงกลับมาใช้งาน
  const [activeChapterId, setActiveChapterId] = useState(() => {
    if (projectId) {
      const savedActiveChapter = localStorage.getItem(
        `last_active_chapter_project_${projectId}`,
      );
      if (savedActiveChapter) return savedActiveChapter;
    }
    return initialId || null;
  });

  // 🟢 4. [เพิ่ม] ทุกครั้งที่เปลี่ยนบทที่กำลังแอดมิน ให้บันทึกความจำลง LocalStorage ทันที
  useEffect(() => {
    if (projectId && activeChapterId) {
      localStorage.setItem(
        `last_active_chapter_project_${projectId}`,
        activeChapterId,
      );
    }
  }, [activeChapterId, projectId]);

  return (
    <WorkspaceContext.Provider value={{ activeChapterId, setActiveChapterId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => useContext(WorkspaceContext);
