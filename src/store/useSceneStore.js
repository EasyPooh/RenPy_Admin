import { create } from 'zustand';
import { chapterService } from '../lib/chapterService';

export const useSceneStore = create((set, get) => ({
  chapters: [],
  blocks: {},
  activeChapterId: null,
  searchQuery: "",
  saveState: "saved", // 'saved' | 'unsaved' | 'saving' | 'success'
  isDataChanged: false,

  setChapters: (chapters) => set({ chapters }),
  setActiveChapterId: (id) => set({ activeChapterId: id }),
  setSearchQuery: (text) => set({ searchQuery: text }),
  
  // ปลุกปุ่มเซฟเมื่อข้อมูลเปลี่ยน
  setIsDataChanged: (status) => set({ 
    isDataChanged: status, 
    saveState: status ? "unsaved" : "saved" 
  }),

  addNewChapter: () => {
    const { chapters } = get();
    const newChapter = {
       id: `temp_${Date.now()}`, 
       chapter_titles: "บทใหม่",
       chapter_status: "draft",
       chapter_tags: []
    };
    set({ 
       chapters: [...chapters, newChapter],
       isDataChanged: true, 
       saveState: "unsaved" 
    });
  },

  // 🌟 ฟังก์ชันเซฟข้อมูลทั้งหมด
  saveAllData: async (projectId) => {
    const { chapters, blocks, activeChapterId } = get();
    if (!activeChapterId) return;

    set({ saveState: "saving" });

    const currentChapter = chapters.find(c => c.id === activeChapterId);
    const currentBlocks = blocks[activeChapterId] || [];

    // เรียกใช้ Service ตัวเดียวจบ
    const result = await chapterService.syncSceneData(projectId, activeChapterId, {
      chapterData: currentChapter,
      blocksData: currentBlocks
    });

    if (result.success) {
      set({ isDataChanged: false, saveState: "success" });
      setTimeout(() => set({ saveState: "saved" }), 3000);
    } else {
      set({ saveState: "unsaved" });
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + result.error.message);
    }
  }
}));