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
import { useAssets } from "../hooks/useAssets";
import { useWorkspace } from "../hooks/useWorkspace";
import { useSaveManager } from "../hooks/useSaveManager";
import { useChapters } from "../hooks/useChapters";
import { WorkspaceProvider } from "../contexts/WorkspaceContext.jsx";

const ChapterManagementPage = () => {
  const { id } = useParams();

  return (
    // ครอบ Provider ไว้ที่ระดับบนสุด
    <WorkspaceProvider initialId={null}>
      <ChapterContent projectId={id} />
    </WorkspaceProvider>
  );
};
const ChapterContent = ({ projectId: id }) => {
  // hook useAsset
  const { assetsList, isAssetsLoading } = useAssets(id);
  // hook useSaveManager ปุ่มเซฟ
  const { handleSaveAll, isSaving } = useSaveManager();
  // hook useChapter
  const {
    Chapters,
    setChapters,
    activeChapterId,
    setActiveChapterId,
    searchQuery,
    setSearchQuery,
    tempStatus,
    setTempStatus,
    currentActiveChapter,
    filteredChapters,
    isLoading,
    handleSaveChapterChanges,
    handleUpdateChapterName,
    handleAddChapter,
    handleAddTagToChapter,
    handleRemoveTagFromChapter,
    isDataChanged,
    setIsDataChanged,
    handleStatusChange,
    handleDeleteChapter,
  } = useChapters(id);

  const {
    blocks,
    workspace,
    allWorkspaces,
    updateConfig,
    loading,
    // ส่งฟังก์ชันชื่อเดิมออกไปให้ UI ใช้งาน
    //handleAddBlock,
    // handleUpdateBlock,
    // handleDeleteBlock,
  } = useWorkspace(id, activeChapterId, setIsDataChanged);

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

  // 🌟 2. ดึงสถานะตั้งต้นมาลงฟอร์มชั่วคราว ทุกครั้งที่ผู้ใช้สลับเปลี่ยนคลิกเลือกฉากฝั่งซ้าย
  useEffect(() => {
    if (currentActiveChapter) {
      setTempStatus(currentActiveChapter.status);
    }
  }, [activeChapterId, Chapters]);

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

  const [focusedBlockId, setFocusedBlockId] = useState(null);

  const currentBlocks = blocks[activeChapterId] || [];

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

  /*useEffect(() => {
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
  }, [id]);*/

  useEffect(() => {}, [isDataChanged]);

  // --- ฟังก์ชัน บล็อกไอเท็มต่างๆ (คงเดิมตามสูตรของคุณ) ---
  const handleAddBlock = (type, activeChapterId, setFocusedBlockId) => {
    const newId = Date.now();
    let newBlock = {
      id: newId,
      type: type || "default",
      content: `บล็อกใหม่ที่ #${(blocks[activeChapterId] || []).length + 1}`,
      createdAt: new Date().toLocaleTimeString(),
    };

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
        newBlock = { ...newBlock, choice: "" };
        break;
    }

    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [activeChapterId]: [...(prevBlocks[activeChapterId] || []), newBlock],
    }));
    setFocusedBlockId(newId);
  };

  const handleUpdateBlock = (blockId, field, value, activeChapterId) => {
    if (!activeChapterId) return;
    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [activeChapterId]: (prevBlocks[activeChapterId] || []).map((block) =>
        block.id === blockId ? { ...block, [field]: value } : block,
      ),
    }));
  };

  const handleDeleteBlock = (blockId, activeChapterId) => {
    if (
      window.confirm(
        "คุณแน่ใจหรือไม่ที่จะลบบล็อกนี้? ข้อมูลนี้ไม่สามารถกู้คืนได้",
      )
    ) {
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
          onSaveAll={() => {
            handleSaveAll(id, Chapters, allWorkspaces, setIsDataChanged);
          }}
          isSaving={isSaving}
          handleStatusChange={handleStatusChange}
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
              isDataChanged={isDataChanged}
              setIsDataChanged={setIsDataChanged}
            />
          </div>
        </div>

        {/* [จุดแก้ที่ 3] ฝั่งขวา: ส่งสเตทและฟังก์ชันจัดการบล็อกเข้าไปในคอมโพเนนต์ Workspace ตัวหลักตัวเดียว 
        ไม่ต้องมีแท็กซ้ำซ้อน และไม่ต้องมีกล่อง absolute bottom มาเบียดบังด้านล่าง
      */}
        <WorkspaceContainer
          currentChapter={Chapters.find((s) => s.id === activeChapterId)}
          blocks={blocks}
          onAddBlock={handleAddBlock}
          handleUpdateBlock={handleUpdateBlock}
          handleDeleteBlock={handleDeleteBlock}
          focusedBlockId={focusedBlockId}
          setFocusedBlockId={setFocusedBlockId}
          inputRef={inputRef}
          allChapters={Chapters}
          assets={assetsList}
          isDataChanged={isDataChanged}
          setIsDataChanged={setIsDataChanged}
          activeChapterId={activeChapterId}
          workspace={workspace}
          handleSaveAll={handleSaveAll}
          isSaving={isSaving}
          updateConfig={updateConfig}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ChapterManagementPage;
