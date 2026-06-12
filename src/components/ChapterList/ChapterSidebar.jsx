// src/components/ChapterList/ChapterSidebar.jsx
import React, { useState, useRef, forwardRef } from "react";
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
  handleDeleteChapter, // รับฟังก์ชันลบบทจากไฟล์แม่ใหญ่ (ChapterManagementPage)
  inputRef,
  handleAddTagAction,
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      <ChapterSearchBar
        onAddChapter={onAddChapter}
        onSearchChange={onSearchChange}
        searchQuery={searchQuery}
      />
      <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-0.5">
        {Chapters.map((Chapter, index) => (
          <ChapterItem
            key={Chapter.id}
            id={Chapter.id}
            index={index}
            name={Chapter.name}
            status={Chapter.status}
            tags={Chapter.tags}
            isActive={Chapter.id === activeChapterId}
            isDragging={Chapter.id === draggingId} // ตรวจสอบสถานะการลากทึบ
            onClick={() => onSelectChapter(Chapter.id)}
            onNameChange={onChapterNameChange}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            handleDeleteChapter={handleDeleteChapter} // ส่งฟังก์ชันลบบทลงไปที่แต่ละไอเท็มด้วย
            ref={Chapter.id === activeChapterId ? inputRef : null}
            handleAddTagAction={handleAddTagAction}
          />
        ))}
      </div>
    </div>
  );
};

export default ChapterSidebar;
