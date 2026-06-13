import { useState, useEffect } from "react";
import { chapterService } from "../lib/chapterService";

export const convertToRenPyLabel = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export const useChapters = (id, setIsDataChanged) => {
  const [Chapters, setChapters] = useState([
    { id: 1, name: "เริ่มเกม (Start)", label_name: "start", status: "draft", tags: ["จุดเริ่มต้น"] },
  ]);
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempStatus, setTempStatus] = useState("draft");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentActiveChapter = Chapters.find((c) => c.id === activeChapterId);

  // ดึงข้อมูลบทเรียนจาก API
  useEffect(() => {
    const fetchChapters = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await chapterService.getChapters(id);
        setChapters(data);
        if (data && data.length > 0) setActiveChapterId(data[0].id);
      } catch (error) {
        console.error("โหลดข้อมูลบทเรียนไม่สำเร็จ:", error);
        alert("ไม่สามารถโหลดข้อมูล Chapter ได้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChapters();
  }, [id]);

  // อัปเดตสถานะชั่วคราวเมื่อเปลี่ยนบท
  useEffect(() => {
    if (currentActiveChapter) setTempStatus(currentActiveChapter.status);
  }, [activeChapterId, Chapters]);

  const handleSaveChapterChanges = () => {
    if (!activeChapterId) return;
    setChapters((prev) =>
      prev.map((c) => (c.id === activeChapterId ? { ...c, status: tempStatus } : c))
    );
    console.log(`บันทึกบท ID: ${activeChapterId} สู่สถานะ: ${tempStatus} สำเร็จ`);
  };

  const handleUpdateChapterName = (chapterId, newName) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          const rawLabel = convertToRenPyLabel(newName);
          return {
            ...c,
            name: newName,
            label_name: rawLabel.length > 0 ? rawLabel : `ch${chapterId}`,
          };
        }
        return c;
      })
    );
  };

  const handleAddChapter = () => {
    const nextId = Chapters.length > 0 ? Math.max(...Chapters.map((s) => s.id)) + 1 : 1;
    const newChapter = { id: nextId, name: `บทใหม่ที่ ${nextId}`, label_name: `ch${nextId}`, status: "draft", tags: [] };
    setChapters([...Chapters, newChapter]);
    setActiveChapterId(nextId);
  };

  const handleAddTagToChapter = (chapterId, tagName) => {
    const cleanTagName = tagName.trim();
    if (!cleanTagName) return;
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          const currentTags = c.tags || [];
          if (currentTags.includes(cleanTagName)) return c;
          setIsDataChanged(true);
          return { ...c, tags: [...currentTags, cleanTagName] };
        }
        return c;
      })
    );
  };

  const handleRemoveTagFromChapter = (chapterId, tagName) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          setIsDataChanged(true);
          return { ...c, tags: (c.tags || []).filter((t) => t !== tagName) };
        }
        return c;
      })
    );
  };

  const handleSaveAllTags = async () => {
    setIsSaving(true);
    try {
      const savePromises = Chapters.map((c) => chapterService.updateChapterTags(c.id, c.tags || []));
      await Promise.all(savePromises);
      setIsDataChanged(false);
    } catch (error) {
      console.error("Save failed:", error, Chapters);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredChapters = Chapters.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return c.name?.toLowerCase().includes(query) || c.tags?.some((t) => t.toLowerCase().includes(query));
  });

  return {
    Chapters, setChapters, activeChapterId, setActiveChapterId, searchQuery, setSearchQuery,
    tempStatus, setTempStatus, currentActiveChapter, filteredChapters, isLoading, isSaving,
    handleSaveChapterChanges, handleUpdateChapterName, handleAddChapter,
    handleAddTagToChapter, handleRemoveTagFromChapter, handleSaveAllTags
  };
};