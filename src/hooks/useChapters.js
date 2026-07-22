  import { useState, useEffect } from "react";
  import { chapterService } from "../lib/chapterService";
  import { supabase } from "../lib/supabaseClient";
  import { useWorkspaceContext } from "../contexts/WorkspaceContext.jsx";

  export const convertToRenPyLabel = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  export const useChapters = (id) => {
    
   // const [isDataChanged, setIsDataChanged] = useState(false);
    
    const { activeChapterId, setActiveChapterId, isDataChanged, setIsDataChanged} = useWorkspaceContext();  
    
   /* const [Chapters, setChapters] = useState([
      { id: "", name: "เริ่มเกม (Start)", label_name: "start", status: "draft", tags: ["จุดเริ่มต้น"] },
    ]);*/
    const [Chapters, setChapters] = useState([]);
    //const [activeChapterId, setActiveChapterId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [tempStatus, setTempStatus] = useState("draft");
    const [isLoading, setIsLoading] = useState(false);

    const currentActiveChapter = Chapters.find((c) => c.id === activeChapterId);

    // 1. โหลดข้อมูลและแปรสภาพคีย์ (Mapping) ให้ถูกต้อง
    useEffect(() => {
    const fetchChapters = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        const data = await chapterService.getChapters(id);
        
        if (data && data.length > 0) {
          const mappedData = data.map((ch) => ({
            id: ch.id,
            name: ch.chapter_titles,    
            label_name: ch.label_name,
            status: ch.chapter_status,  
            tags: ch.chapter_tags || [], 
            project_id: ch.project_id,  
            sort_order: ch.sort_order   
          }));
          
          setChapters(mappedData);
          
          // ✅ ปรับให้ใช้งาน setActiveChapterId จาก Context ได้เลย
          if (!activeChapterId) {
            setActiveChapterId(mappedData[0].id);
          }
          
        } else {
          try {
            const startChapterData = await chapterService.createChapter(
              id, "เริ่มเกม (Start)", 0, ["จุดเริ่มต้น"], "draft"
            );

            if (startChapterData) {
              const mappedStart = {
                id: startChapterData.id, 
                name: startChapterData.chapter_titles,
                label_name: startChapterData.label_name || "start",
                status: startChapterData.chapter_status,
                tags: startChapterData.chapter_tags || [],
              };
              setChapters([mappedStart]);
              setActiveChapterId(startChapterData.id);
            }
          } catch (createError) {
            console.error("สร้างบทเริ่มต้นอัตโนมัติล้มเหลว:", createError);
            setChapters([]);
          }
        }
      } catch (error) {
        console.error("โหลดข้อมูลบทเรียนไม่สำเร็จ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChapters();
  }, [id]); 

    useEffect(() => {
      if (currentActiveChapter) setTempStatus(currentActiveChapter.status);
    }, [activeChapterId, Chapters]);

    const handleSaveChapterChanges = () => {
      if (!activeChapterId) return;
      setChapters((prev) =>
        prev.map((c) => (c.id === activeChapterId ? { ...c, status: tempStatus } : c))
      );
      setIsDataChanged(true);
    };

    // 2. พิมพ์ชื่อบทเรียน
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
      setIsDataChanged(true); // ✅ เปิดปุ่มเซฟทันทีเมื่อมีการพิมพ์แก้ไขชื่อ
    };

    // 3. กดเพิ่มบทเรียนใหม่
    const handleAddChapter = async () => {
      try {
        const newChapterData = await chapterService.createChapter(
          id, 
          `บทใหม่`, 
          Chapters.length, 
          [], 
          "draft"
        );

        if (newChapterData) {
          const mappedNewChapter = {
            id: newChapterData.id,
            name: newChapterData.chapter_titles,
            label_name: newChapterData.label_name,
            status: newChapterData.chapter_status,
            tags: newChapterData.chapter_tags || [],
          };

          setChapters((prev) => [...prev, mappedNewChapter]);
          setActiveChapterId(mappedNewChapter.id);
          setIsDataChanged(true);
        }
      } catch (error) {
        console.error("สร้าง Chapter ใหม่ไม่สำเร็จ:", error);
        alert("ไม่สามารถสร้างบทเรียนใหม่ได้");
      }
    };

    // 4. ลบบทเรียน
    const handleDeleteChapter = async (chapterId) => {
      const chapterToDelete = Chapters.find((c) => c.id === chapterId);

      if (chapterToDelete && chapterToDelete.label_name === "start") {
        alert("ไม่สามารถลบบทเริ่มต้นเกม (Start) ได้ครับ");
        return;
      }

      const isConfirmed = window.confirm("คุณแน่ใจหรือไม่ที่จะลบบทนี้? ข้อมูลภายในจะหายไปทั้งหมด");
      if (!isConfirmed) return;

      const isNewChapter = typeof chapterId === "string" && chapterId.startsWith("temp_");

      if (!isNewChapter) {
        try {
          const { error } = await supabase
            .from("chapters")
            .delete()
            .eq("id", chapterId);

          if (error) throw error;
        } catch (err) {
          console.error("Database Error:", err);
          alert("ไม่สามารถลบข้อมูลจากฐานข้อมูลได้");
          return;
        }
      }

      const currentIndex = Chapters.findIndex((chapter) => chapter.id === chapterId);

      if (activeChapterId === chapterId) {
        if (currentIndex > 0) {
          setActiveChapterId(Chapters[currentIndex - 1].id);
        } else {
          setActiveChapterId(null);
        }
      }

      const updatedChapters = Chapters.filter((chapter) => chapter.id !== chapterId);
      setChapters(updatedChapters);
      
      // ✅ นำโค้ด setBlocks ที่ทำแอปพังออกเรียบร้อยแล้ว
      alert("ลบบทสำเร็จแล้ว!");
    };

    // 5. จัดการแท็ก
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
      if (tagName === "จุดเริ่มต้น") return;
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

    const handleStatusChange = (id, newStatus) => {
      const updatedChapters = Chapters.map((ch) =>
        ch.id === id ? { ...ch, status: newStatus } : ch
      );
      setChapters(updatedChapters);
      setIsDataChanged(true);
    };

    const filteredChapters = Chapters.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return c.name?.toLowerCase().includes(query) || c.tags?.some((t) => t.toLowerCase().includes(query));
    });

    return {
      Chapters, setChapters, activeChapterId, setActiveChapterId, searchQuery, setSearchQuery,
      tempStatus, setTempStatus, currentActiveChapter, filteredChapters, isLoading, 
      handleSaveChapterChanges, handleUpdateChapterName, handleAddChapter,
      handleAddTagToChapter, handleRemoveTagFromChapter, isDataChanged, setIsDataChanged, handleStatusChange, handleDeleteChapter
    };
  };