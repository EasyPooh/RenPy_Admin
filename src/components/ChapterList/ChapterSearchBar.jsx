// src/components/ChapterList/ChapterSearchBar.jsx
import React from "react";

const ChapterSearchBar = ({ onAddChapter, onSearchChange, searchQuery }) => {
  return (
    <div className="w-full flex flex-col space-y-2.5">
      {/* 1. ปุ่มสำหรับสร้าง Chapter ใหม่ */}
      <button
        onClick={onAddChapter}
        className="w-full text-left py-2 px-3 text-xs bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100/80 active:bg-purple-200/60 transition-colors font-semibold tracking-wide"
      >
        + New Chapter
      </button>

      {/* 2. ช่องสำหรับพิมพ์ค้นหาฉาก */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
        />
      </div>
    </div>
  );
};

export default ChapterSearchBar;
