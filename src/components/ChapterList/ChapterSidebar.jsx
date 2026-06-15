// src/components/ChapterList/ChapterSidebar.jsx
import React from "react";
import ChapterSearchBar from "./ChapterSearchBar";
import ChapterItem from "./ChapterItem";

const ChapterSidebar = ({
  Chapters,
  activeChapterId,
  draggingId,
  onSelectChapter,
  onAddChapter,
  onSearchChange,
  searchQuery,
  onChapterNameChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  handleDeleteChapter,
  inputRef,
  suggestedTags,
  onAddTagToChapter,
  onRemoveTagFromChapter,
  setIsDataChanged,
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      <ChapterSearchBar
        onAddChapter={onAddChapter}
        onSearchChange={onSearchChange}
        searchQuery={searchQuery}
      />
      <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-0.5">
        {Chapters.map((chapter, index) => (
          <ChapterItem
            key={chapter.id}
            id={chapter.id}
            index={index}
            // ✅ เปลี่ยนมาดึงค่าจากสเตทหน้าบ้านที่แมพเรียบร้อยแล้ว
            name={chapter.name}
            status={chapter.status}
            tags={chapter.tags}
            isActive={chapter.id === activeChapterId}
            isDragging={chapter.id === draggingId}
            onClick={() => onSelectChapter(chapter.id)}
            onNameChange={onChapterNameChange}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            handleDeleteChapter={handleDeleteChapter}
            ref={chapter.id === activeChapterId ? inputRef : null}
            suggestedTags={suggestedTags}
            onAddTagToChapter={onAddTagToChapter}
            onRemoveTagFromChapter={onRemoveTagFromChapter}
            setIsDataChanged={setIsDataChanged}
          />
        ))}
      </div>
    </div>
  );
};

export default ChapterSidebar;
