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
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { chapterService } from "../lib/chapterService";
import { useAssets } from "../hooks/useAssets";
import { useChapterConfig } from "../hooks/useChapterConfig";
import { useSaveManager } from "../hooks/useSaveManager";
import { useChapters } from "../hooks/useChapters";
import { WorkspaceProvider } from "../contexts/WorkspaceContext.jsx";
import { useBlocks } from "../hooks/useBlocks.js";

const ChapterManagementPage = () => {
  const { id } = useParams();

  return (
    <WorkspaceProvider initialId={null}>
      <ChapterContent projectId={id} />
    </WorkspaceProvider>
  );
};

const ChapterContent = ({ projectId: id }) => {
  const { assetsList, isAssetsLoading } = useAssets(id);
  const { handleSaveAll, isSaving } = useSaveManager();

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
    config,
    allConfigs,
    updateConfig,
    loading: configLoading,
  } = useChapterConfig(id, activeChapterId, setIsDataChanged);

  const {
    blocks,
    allBlocks,
    pendingDeletions,
    focusedBlockId,
    setFocusedBlockId,
    handleAddBlock,
    handleUpdateBlock,
    handleMoveBlock,
    handleDeleteBlock,
    clearPendingDeletions,
    loading: blocksLoading,
  } = useBlocks(activeChapterId, setIsDataChanged);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
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

  const currentBlocks = blocks[activeChapterId] || [];
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [Chapters.length, activeChapterId]);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      <div className="flex-none bg-white">
        <Navbar />
        <TopNavbar title="Chapter Management" id={id} />
        <ChapterNavbar
          currentChapter={currentActiveChapter}
          tempStatus={tempStatus}
          onStatusChange={setTempStatus}
          onSave={handleSaveChapterChanges}
          isDataChanged={isDataChanged}
          setIsDataChanged={setIsDataChanged}
          onSaveAll={() => {
            handleSaveAll(
              id,
              Chapters,
              allConfigs,
              allBlocks,
              pendingDeletions,
              clearPendingDeletions,
              setIsDataChanged,
            );
          }}
          isSaving={isSaving}
          handleStatusChange={handleStatusChange}
        />
      </div>

      <div className="flex flex-1 overflow-hidden w-full">
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
              handleDeleteChapter={handleDeleteChapter}
              inputRef={inputRef}
              suggestedTags={suggestedTags}
              onAddTagToChapter={handleAddTagToChapter}
              onRemoveTagFromChapter={handleRemoveTagFromChapter}
              isDataChanged={isDataChanged}
              setIsDataChanged={setIsDataChanged}
            />
          </div>
        </div>

        <WorkspaceContainer
          currentChapter={Chapters.find((s) => s.id === activeChapterId)}
          blocks={blocks}
          onAddBlock={handleAddBlock}
          handleUpdateBlock={handleUpdateBlock}
          handleDeleteBlock={handleDeleteBlock}
          handleMoveBlock={handleMoveBlock}
          focusedBlockId={focusedBlockId}
          setFocusedBlockId={setFocusedBlockId}
          inputRef={inputRef}
          allChapters={Chapters}
          assets={assetsList}
          isDataChanged={isDataChanged}
          setIsDataChanged={setIsDataChanged}
          activeChapterId={activeChapterId}
          workspace={config} // ยิงพรอพชื่อเดิม แต่เปลี่ยนไส้ในเป็นข้อมูล config บทเรียน
          handleSaveAll={handleSaveAll}
          isSaving={isSaving}
          updateConfig={updateConfig}
          loading={configLoading}
        />
      </div>
    </div>
  );
};

export default ChapterManagementPage;
