// src/pages/ChapterManagementPage.jsx
import React, { useState, useEffect, useRef } from "react";

import MainLayout from "../components/ChapterList/MainLayout";
import ChapterNavbar from "../components/ChapterList/ChapterNavbar";
import ChapterSidebar from "../components/ChapterList/ChapterSidebar";
import WorkspaceContainer from "../components/WorkspaceContainer/WorkspaceContainer";
import Navbar from "../components/Navbar";
import TopNavbar from "../components/ChapterList/TopNavbar";
import WorkspaceToolbar from "../components/WorkspaceContainer/WorkspaceToolbar";
import DialogueSection from "../components/WorkspaceContainer/DialogueSection";
import TextareaField from "../components/TextareaField";
import StartSection from "../components/WorkspaceContainer/StartSection";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { chapterService } from "../lib/chapterService";

const ChapterManagementPage = () => {
  const { id } = useParams();
  const [Chapters, setChapters] = useState([]);

  const [activeChapterId, setActiveChapterId] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  // ซ่อน/แสดงหน้าต่างเลือกแท็ก
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  // รายการแท็กที่มีให้เลือกในระบบ (สามารถเพิ่มหรือดึงมาจากฐานข้อมูลในอนาคตได้)
  const [suggestedTags, setSuggestedTags] = useState([
    "เนื้อเรื่องหลัก",
    "เนื้อเรื่องรอง",
    "ฉากต่อสู้",
    "ฉากดราม่า",
    "ย้อนอดีต",
    "ห้องเรียน",
  ]);
  const [tagInput, setTagInput] = useState("");
  const [tempTags, setTempTags] = useState([]);

  // 🌟 1. เพิ่ม State บัฟเฟอร์สำหรับจำค่าสลับบนฟอร์มชั่วคราวก่อนกดเซฟ
  const [tempStatus, setTempStatus] = useState("draft");

  const currentActiveChapter = Chapters.find(
    (Chapter) => Chapter.id === activeChapterId,
  );

  // 🌟 2. ดึงสถานะตั้งต้นมาลงฟอร์มชั่วคราว ทุกครั้งที่ผู้ใช้สลับเปลี่ยนคลิกเลือกฉากฝั่งซ้าย
  useEffect(() => {
    if (currentActiveChapter) {
      setTempStatus(currentActiveChapter.status);
    }
  }, [activeChapterId, Chapters]);

  // 🌟 3. ฟังก์ชันเซฟใหญ่ (เมื่อกดปุ่ม Save ใน Navbar)
  const handleSaveChapterChanges = () => {
    if (!activeChapterId) return;

    setChapters((prevChapters) =>
      prevChapters.map((Chapter) => {
        if (Chapter.id === activeChapterId) {
          return {
            ...Chapter,
            status: tempStatus, // นำค่าที่เลือกค้างไว้มาบันทึกจริงลงฝั่งซ้ายตัว Chapter List
          };
        }
        return Chapter;
      }),
    );

    // TODO: จุดนี้สามารถใส่ฟังก์ชันเขียนคำสั่งอัปเดตลงฐานข้อมูล Supabase ต่อไปได้เลยครับ!
    console.log(
      `บันทึกบท ID: ${activeChapterId} สู่สถานะ: ${tempStatus} สำเร็จ`,
    );
  };

  const handleDragStart = (e, index, id) => {
    setDraggedIndex(index);
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === 0 || targetIndex === 0 || draggedIndex === null) {
      handleDragEnd();
      return;
    }
    const updatedChapters = [...Chapters];
    const draggedItem = updatedChapters[draggedIndex];
    updatedChapters.splice(draggedIndex, 1);
    updatedChapters.splice(targetIndex, 0, draggedItem);
    setChapters(updatedChapters);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggingId(null);
  };

  const convertToRenPyLabel = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleUpdateChapterName = (chapterId, newTitle) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, chapter_titles: newTitle }
          : chapter,
      ),
    );
    setIsDataChanged(true);
  };

  const handleAddChapter = () => {
    const nextId = `temp-${Date.now()}`; // ใช้ไอดีชั่วคราวขึ้นต้นด้วย temp-
    const shortId = Chapters.length; // ลำดับจำนวนบทปัจจุบัน

    const newChapter = {
      id: nextId,
      project_id: id, // id โปรเจกต์จาก useParams()
      chapter_titles: `บทใหม่ ${shortId + 1}`, // ใช้ chapter_titles แทน name
      label_name: `ch_${shortId + 1}`,
      chapter_status: "draft",
      chapter_tags: ["จุดเริ่มต้น"], // 🌟 ข้อ 2: บังคับให้มีแท็กนี้ตั้งแต่เริ่มสร้าง
    };

    setChapters([...Chapters, newChapter]);
    setActiveChapterId(nextId);
    setIsDataChanged(true); // ปลุกปุ่มเซฟให้ทำงาน
  };

  const filteredChapters = Chapters.filter((chapter) => {
    // 1. ทำคำค้นหาให้เป็นพิมพ์เล็กเพื่อป้องกัน Case-sensitive
    const query = searchQuery.toLowerCase().trim();

    // ถ้าไม่ได้พิมพ์อะไรในช่องค้นหา ให้ผ่านเงื่อนไขแสดงผลทั้งหมดทันที
    if (!query) return true;

    // 2. ตรวจสอบว่าตรงกับชื่อ Chapter ไหม
    const matchesName = chapter.name?.toLowerCase().includes(query);

    // 3. ตรวจสอบว่าตรงกับ Tags ด้านในไหม (ป้องกันกรณี tags เป็น undefined ด้วยการใช้ || [])
    const matchesTags =
      chapter.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;

    // คืนค่ากลับไปถ้าตรงกับ "ชื่อบท" หรือ ตรงกับ "แท็กใดแท็กหนึ่งในบทนั้น"
    return matchesName || matchesTags;
  });
  // 1. สร้าง State สำหรับเก็บรายการ Block ทั้งหมด (เริ่มต้นเป็นอาเรย์ว่าง)
  const [blocks, setBlocks] = useState([]);
  const [focusedBlockId, setFocusedBlockId] = useState(null);

  const currentBlocks = blocks[activeChapterId] || [];

  // 2. ฟังก์ชัน Logic สำหรับเพิ่ม Block ใหม่
  const handleAddBlock = (type) => {
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

  // 3. ฟังก์ชันสำหรับอัปเดต Block properties
  const handleUpdateBlock = (blockId, field, value) => {
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

  const handleDeleteBlock = (blockId) => {
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

  const handleDeleteChapter = (chapterId) => {
    // ค้นหาบทเรียนที่จะลบก่อน
    const chapterToDelete = Chapters.find((c) => c.id === chapterId);

    // ดักห้ามลบ Chapter แรก (จุดเริ่มเกม) โดยเช็กจาก label_name
    if (chapterToDelete && chapterToDelete.label_name === "start") {
      alert("ไม่สามารถลบบทเริ่มต้นเกม (Start) ได้ครับ");
      return;
    }

    // 2. แจ้งเตือนยืนยันการลบ
    const isConfirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะลบบทนี้? ข้อมูลภายในจะหายไปทั้งหมด",
    );
    if (!isConfirmed) return;

    // 3. หาตำแหน่ง Index ปัจจุบันของบทที่กำลังจะลบ
    const currentIndex = Chapters.findIndex(
      (chapter) => chapter.id === chapterId,
    );

    // 4. คำนวณหา Chapter ก่อนหน้าเพื่อสลับโฟกัส (ถ้าบทที่ลบคือบทที่กำลังเปิดดูอยู่)
    if (activeChapterId === chapterId) {
      // ถ้ามีบทก่อนหน้า ให้เอา ID ของบทก่อนหน้ามาใช้
      if (currentIndex > 0) {
        const previousChapterId = Chapters[currentIndex - 1].id;
        setActiveChapterId(previousChapterId);
      } else {
        // Safe-case เผื่อกรณีฉุกเฉิน ให้กลับไปที่ ID 1
        setActiveChapterId(1);
      }
    }

    // 5. ลบ Chapter ออกจาก State หลัก
    const updatedChapters = Chapters.filter(
      (chapter) => chapter.id !== chapterId,
    );
    setChapters(updatedChapters);

    // 6. ล้างข้อมูล Blocks ของบทที่ถูกลบทิ้ง เพื่อคืนพื้นที่หน่วยความจำ
    setBlocks((prevBlocks) => {
      const newBlocks = { ...prevBlocks };
      delete newBlocks[chapterId];
      return newBlocks;
    });
    alert("ลบบทและข้อมูลภายในทั้งหมดสำเร็จแล้ว!");
  };

  const inputRef = React.useRef(null);

  // 2. ใช้ useEffect ดักจับจังหวะที่มีการสร้าง Chapter ใหม่ขึ้นมา
  useEffect(() => {
    // เมื่อมีไอเท็มผูกกับ inputRef สำเร็จ ให้สั่ง Focus ไปที่กล่องนั้นทันที
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [Chapters.length, activeChapterId]);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id]);

  const [assetsList, setAssetsList] = useState([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);

  // --- เพิ่มฟังก์ชันนี้ลงไปในตัว ChapterManagementPage ---
  const fetchProjectAssets = async () => {
    try {
      setIsAssetsLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("project_id", id); // id ตัวนี้มาจาก useParams() ที่มีอยู่แล้วด้านบน

      if (error) throw error;
      if (data) {
        setAssetsList(data);
      }
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาดในการดึงข้อมูล Asset ไปยัง Dropdown:",
        error.message,
      );
    } finally {
      setIsAssetsLoading(false);
    }
  };

  // เรียกใช้งานฟังก์ชันดึงข้อมูลเมื่อโปรเจกต์ id มีการเปลี่ยนแปลง
  useEffect(() => {
    if (id) {
      fetchProjectAssets();
    }
  }, [id]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!id) return;

      try {
        const data = await chapterService.getChapters(id);

        if (data && data.length > 0) {
          // กรณีมีข้อมูลใน Database อยู่แล้ว
          setChapters(data);
          setActiveChapterId(data[0].id);
        } else {
          // กรณีโปรเจกต์ใหม่เอี่ยม ไม่มีข้อมูลเลย -> สร้างฉาก Start จำลองขึ้นมาทันที!
          const startId = crypto.randomUUID(); // ใช้ UUID แทนเลข 1
          const initialStartChapter = {
            id: startId,
            name: "เริ่มเกม (Start)",
            labelName: "start", // เราจะใช้คำนี้เป็นตัวล็อคห้ามลบ
            status: "draft",
            tags: ["จุดเริ่มต้น"],
          };

          setChapters([initialStartChapter]);
          setActiveChapterId(startId);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    fetchChapters();
  }, [id]);

  const [isDataChanged, setIsDataChanged] = useState(false);
  useEffect(() => {
    console.log("🔄 [หน้าหลัก] ค่า isDataChanged เปลี่ยนเป็น:", isDataChanged);
  }, [isDataChanged]);

  const handleAddTagToChapter = (chapterId, tagName) => {
    const cleanTagName = tagName.trim();
    if (!cleanTagName) return;

    setChapters((prevChapters) =>
      prevChapters.map((chapter) => {
        if (chapter.id === chapterId) {
          const currentTags = chapter.chapter_tags || [];
          // ป้องกันการใส่แท็กซ้ำ
          if (currentTags.includes(cleanTagName)) return chapter;

          setIsDataChanged(true);
          return {
            ...chapter,
            chapter_tags: [...currentTags, cleanTagName], // ใช้ chapter_tags
          };
        }
        return chapter;
      }),
    );
  };

  const handleRemoveTagFromChapter = (chapterId, tagName) => {
    // 🌟 ข้อ 2: บังคับไม่ให้ผู้ใช้ลบแท็ก "จุดเริ่มต้น" เด็ดขาด!
    if (tagName === "จุดเริ่มต้น") {
      alert("ไม่สามารถลบแท็ก 'จุดเริ่มต้น' ได้ เนื่องจากเป็นแท็กบังคับของระบบ");
      return;
    }

    setChapters((prevChapters) =>
      prevChapters.map((chapter) => {
        if (chapter.id === chapterId) {
          const currentTags = chapter.chapter_tags || [];
          setIsDataChanged(true);
          return {
            ...chapter,
            chapter_tags: currentTags.filter((t) => t !== tagName), // ใช้ chapter_tags
          };
        }
        return chapter;
      }),
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async () => {
    console.log("กำลังสั่งเซฟข้อมูลทั้งหมดลง Supabase...");
    setIsSaving(true);
    try {
      for (let i = 0; i < Chapters.length; i++) {
        const chapter = Chapters[i];

        // ดึงแท็กปัจจุบันขึ้นมา ตรวจสอบเพื่อความปลอดภัยอีกชั้นว่าต้องมี "จุดเริ่มต้น"
        let tags = chapter.chapter_tags || [];
        if (!tags.includes("จุดเริ่มต้น")) {
          tags = ["จุดเริ่มต้น", ...tags];
        }

        if (String(chapter.id).startsWith("temp-")) {
          // ➕ กรณีเป็นบทเรียนใหม่ (ID ชั่วคราว) ให้ใช้คำสั่งสร้าง (Insert)
          await chapterService.createChapter(
            id, // project_id
            chapter.chapter_titles,
            i, // sort_order ตามตำแหน่งในแถวปัจจุบัน
            tags,
            chapter.chapter_status,
          );
        } else {
          // 🔄 กรณีเป็นบทเรียนเดิมที่มีในฐานข้อมูลอยู่แล้ว ให้ใช้คำสั่งอัปเดต (Update)
          await chapterService.updateExistingChapter(
            chapter.id,
            chapter.chapter_titles,
            i, // sort_order อัปเดตเรียงตามการลากวาง
            tags,
            chapter.chapter_status,
          );
        }
      }

      // 🌟 ข้อ 3: ดึงข้อมูลล่าสุดที่พึ่งเซฟจาก Supabase มาอัปเดตลง State หน้าเว็บอีกครั้ง
      // เพื่อเปลี่ยนไอดีชั่วคราว (temp-xxx) ให้กลายเป็นไอดีจริงจากฐานข้อมูล
      const freshChapters = await chapterService.getChapters(id);
      if (freshChapters) {
        setChapters(freshChapters);
      }

      setIsDataChanged(false); // ปิดสวิตช์ปุ่มเซฟ (กลับเป็นสถานะเซฟแล้ว)
      alert("บันทึกข้อมูลและอัปเดตสถานะฉากเรียบร้อยแล้วครับ! 🎉");
    } catch (catchError) {
      console.error("เกิดข้อผิดพลาดในการเซฟข้อมูล:", catchError);
      alert("เกิดข้อผิดพลาดในการเซฟข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    /* [จุดแก้ที่ 1] บังคับครอบด้วยกล่อง flex-col สูงเต็มหน้าจอ h-screen 
    และห้ามเลื่อนหน้าจอรวม overflow-hidden เพื่อให้สัดส่วนตกลงมาใต้ Navbar พอดี
  */
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* ส่วนของแผงเมนูด้านบนทั้งหมด (รวมกลุ่มอยู่ด้วยกันไม่ให้ไปดันหรือเบียดใคร) */}
      <div className="flex-none bg-white">
        <Navbar />
        <TopNavbar title="Chapter Management" id={id} />
        {/* 🌟 ส่ง State ชั่วคราว และฟังก์ชันจัดการเซฟไปที่ Navbar */}
        <ChapterNavbar
          currentChapter={currentActiveChapter}
          tempStatus={tempStatus}
          onStatusChange={setTempStatus}
          onSave={handleSaveChapterChanges}
          isDataChanged={isDataChanged}
          setIsDataChanged={setIsDataChanged}
          onSaveAll={handleSaveAll}
          isSaving={isSaving}
        />
      </div>

      {/* [จุดแก้ที่ 2] พื้นที่ทำงานด้านล่างทั้งหมดใต้ Navbar ลงมา 
      กินพื้นที่ความสูงที่เหลือ (flex-1) และเรียงซ้ายไปขวา (flex flex-row) 
    */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* ฝั่งซ้าย: เมนูรายชื่อฉาก (Chapter LIST) ล็อกความสูงพอดีจอฝั่งซ้าย */}
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 p-4 overflow-y-auto">
          <div className="pb-1 flex items-center space-x-2 text-gray-500 font-semibold text-sm select-none mb-3">
            <span>📁</span>
            <span className="tracking-wider">CHAPTER LIST</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChapterSidebar
              Chapters={filteredChapters}
              activeChapterId={activeChapterId}
              draggingId={draggingId}
              onSelectChapter={setActiveChapterId}
              onAddChapter={handleAddChapter}
              onSearchChange={setSearchQuery}
              searchQuery={searchQuery}
              onChapterNameChange={handleUpdateChapterName}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              handleDeleteChapter={handleDeleteChapter} // ส่งฟังก์ชันลบบทลงไปที่ Sidebar ด้วย
              inputRef={inputRef}
              suggestedTags={suggestedTags}
              onAddTagToChapter={handleAddTagToChapter}
              onRemoveTagFromChapter={handleRemoveTagFromChapter}
              setIsDataChanged={setIsDataChanged}
            />
          </div>
        </div>

        {/* [จุดแก้ที่ 3] ฝั่งขวา: ส่งสเตทและฟังก์ชันจัดการบล็อกเข้าไปในคอมโพเนนต์ Workspace ตัวหลักตัวเดียว 
        ไม่ต้องมีแท็กซ้ำซ้อน และไม่ต้องมีกล่อง absolute bottom มาเบียดบังด้านล่าง
      */}
        <WorkspaceContainer
          currentChapter={Chapters.find((s) => s.id === activeChapterId)}
          blocks={currentBlocks}
          onAddBlock={handleAddBlock}
          handleUpdateBlock={handleUpdateBlock}
          handleDeleteBlock={handleDeleteBlock}
          focusedBlockId={focusedBlockId}
          setFocusedBlockId={setFocusedBlockId}
          inputRef={inputRef}
          allChapters={Chapters}
          assets={assetsList}
          setIsDataChanged={setIsDataChanged}
        />
      </div>
    </div>
  );
};

export default ChapterManagementPage;
