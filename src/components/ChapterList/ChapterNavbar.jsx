// src/components/ChapterList/ChapterNavbar.jsx
import React, { useState, useRef, useEffect } from "react";
import GlobalSaveButton from "../WorkspaceContainer/GlobalSaveButton";

const ChapterNavbar = ({
  currentChapter,
  tempStatus,
  onStatusChange,
  onSave,
  isDataChanged,
  onSaveAll,
  handleStatusChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentChapter) {
    return (
      <div className="h-16 border-b border-gray-100 bg-white flex items-center px-6 text-sm text-gray-400">
        กรุณาเลือกฉากเพื่อเริ่มทำงาน...
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center space-x-3 text-sm">
        <span className="text-gray-400 font-medium">ตำแหน่งในเรื่อง:</span>
        <span className="font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {currentChapter.name}
        </span>
        <span className="text-gray-300 font-bold">&rarr;</span>
        <span className="bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-lg border border-purple-100">
          เริ่มเกม (Start)
        </span>
        <span className="text-gray-300 font-bold">&rarr;</span>
        <span className="text-gray-500 font-medium">การตื่นนอนครั้งแรก...</span>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
          [ ID: {currentChapter.id.toString().padStart(3, "0")} ]
        </span>

        {/* Dropdown แสดงค่าสถานะที่แมปตามตัวแปรผันผวนชั่วคราว tempStatus */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
              currentChapter.chapter_status === "done"
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100/70"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70"
            }`}
          >
            <span>
              {currentChapter.chapter_status === "done" ? "✓ Done" : "⚙ Draft"}
            </span>
            <span className="text-[10px] opacity-60">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  onStatusChange("draft"); // เปลี่ยนค่าสถานะบนหน้าจอชั่วคราว
                  setIsDropdownOpen(false);
                  handleStatusChange(currentChapter.id, "draft");
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center space-x-2 hover:bg-gray-50 ${
                  currentChapter.chapter_status === "draft"
                    ? "text-amber-600 bg-amber-50/40"
                    : "text-gray-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Draft</span>
              </button>

              <button
                onClick={() => {
                  onStatusChange("done"); // เปลี่ยนค่าสถานะบนหน้าจอชั่วคราว
                  setIsDropdownOpen(false);
                  handleStatusChange(currentChapter.id, "done");
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center space-x-2 hover:bg-gray-50 ${
                  currentChapter.chapter_status === "done"
                    ? "text-green-600 bg-green-50/40"
                    : "text-gray-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Done</span>
              </button>
            </div>
          )}
        </div>

        <GlobalSaveButton isDataChanged={isDataChanged} onSaveAll={onSaveAll} />

        {/* 🌟 เชื่อมปุ่มบันทึกใหญ่เข้าฟังก์ชัน Commit ข้อมูลลงแถบรายชื่อด้านซ้าย 
        <button
          onClick={onSave}
          className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <span>💾</span>
          <span>Save</span>
        </button>*/}
      </div>
    </div>
  );
};

export default ChapterNavbar;
