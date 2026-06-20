import React, { useState, useEffect, useRef } from "react";

const DialogueSection = ({
  id,
  character,
  characterList,
  expression,
  text,
  handleUpdateBlock,
  handleDeleteBlock,
  onAddBlock,
  focusedBlockId,
  setFocusedBlockId,
  isGhosted,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id, isGhosted]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // 2. ถ้ามี onAddBlock ส่งมา ให้เรียกใช้ฟังก์ชันนั้น
      if (isGhosted) return;
      if (onAddBlock) {
        onAddBlock("dialogue"); // ส่งประเภท 'dialogue' กลับไปเพื่อสร้างบล็อกบทพูดใหม่
      }
    }
  };

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 border rounded-xl mb-3 transition-all ${
        isGhosted
          ? "opacity-40 pointer-events-none select-none bg-gray-100 border-gray-300"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ช่องบทสนทนา
          </label>
          {isGhosted && (
            <span className="text-xs text-red-500 font-bold animate-pulse">
              🚨 บล็อกนี้จะไม่ทำงานในเกม (อยู่หลังจุดสิ้นสุดเนื้อเรื่อง)
            </span>
          )}
        </div>
        {!isGhosted && (
          <button
            onClick={() => handleDeleteBlock(id)}
            className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            ลบ
          </button>
        )}
      </div>

      <div className="flex gap-3">
        {/* 1. Dropdown เลือกชื่อตัวละคร */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ตัวละคร
          </label>
          <select
            value={character}
            disabled={isGhosted}
            onChange={(e) => handleUpdateBlock(id, "character", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="">(ไม่มีตัวละครพูด)</option>
            {/* ดึงข้อมูลแคปซูลด้านบนมาวนลูปสร้างเป็น Option ตัวเลือกแบบอัตโนมัติ */}
            {characterList &&
              characterList.map((char, index) => (
                <option key={index} value={char}>
                  {char}
                </option>
              ))}
          </select>
        </div>

        {/* 3. Dropdown เลือกการแสดงออก */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            สีหน้าตัวละคร
          </label>
          <select
            value={expression}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "expression", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="normal">ปกติ</option>
            <option value="happy">ยินดี</option>
            <option value="sad">เศร้า</option>
            <option value="angry">โกรธ</option>
          </select>
        </div>
      </div>

      {/* 2. ช่องกรอกบทพูด */}
      <div className="flex-1">
        <input
          ref={inputRef}
          type="text"
          value={text}
          disabled={isGhosted}
          onChange={(e) => handleUpdateBlock(id, "text", e.target.value)}
          onKeyDown={handleKeyDown} // 🌟 สั่งรันชุดดักการกด Enter
          placeholder="พิมพ์บทสนทนาตรงนี้ กดEnter เพื่อเพิ่มบล็อกบทสนทนาใหม่ทันที"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm"
        />
      </div>
    </div>
  );
};

export default DialogueSection;
