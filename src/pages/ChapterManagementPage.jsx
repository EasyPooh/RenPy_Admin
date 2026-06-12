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
  const [Chapters, setChapters] = useState([
    {
      id: 1,
      name: "เริ่มเกม (Start)",
      labelName: "start",
      status: "draft",
      tags: ["จุดเริ่มต้น"],
    },
  ]);

  const [activeChapterId, setActiveChapterId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

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

  const handleUpdateChapterName = (id, newName) => {
    setChapters((prevChapters) =>
      prevChapters.map((Chapter) => {
        if (Chapter.id === id) {
          const rawLabel = convertToRenPyLabel(newName);
          return {
            ...Chapter,
            name: newName,
            labelName: rawLabel.length > 0 ? rawLabel : `ch${id}`,
          };
        }
        return Chapter;
      }),
    );
  };

  const handleAddChapter = () => {
    const nextId =
      Chapters.length > 0 ? Math.max(...Chapters.map((s) => s.id)) + 1 : 1;
    const newChapter = {
      id: nextId,
      name: `บทใหม่ที่ ${nextId}`,
      labelName: `ch${nextId}`,
      status: "draft",
      tags: [],
    }; // Default ตอนสร้างบทใหม่คือ draft
    setChapters([...Chapters, newChapter]);
    setActiveChapterId(nextId);
  };

  const filteredChapters = Chapters.filter(
    (Chapter) =>
      Chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Chapter.id.toString().includes(searchQuery),
  );
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
    // 1. บล็อกห้ามลบ Chapter แรก (id: 1) เพราะเป็นจุดเริ่มเกม
    if (chapterId === 1) {
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
      setIsLoading(true);
      try {
        const data = await chapterService.getChapters(id);
        setChapters(data);

        // ถ้ามีบทเรียนอยู่แล้ว ให้เลือกบทแรกเป็น Active อัตโนมัติ
        if (data && data.length > 0) {
          setActiveChapterId(data[0].id);
        }
      } catch (error) {
        console.error("โหลดข้อมูลบทเรียนไม่สำเร็จ:", error);
        alert("ไม่สามารถโหลดข้อมูล Chapter ได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, [id]);

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
        />
      </div>
    </div>
  );
};

export default ChapterManagementPage;
