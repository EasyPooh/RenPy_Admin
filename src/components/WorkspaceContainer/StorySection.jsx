// src/components/WorkspaceContainer/StorySection.jsx
import React, { useState } from "react";

const StorySection = ({ onDataChange }) => {
  // State ภายในสำหรับจัดการคำสั่งบทพูดเบื้องต้น
  const [character, setCharacter] = useState("nevi");
  const [dialogue, setDialogue] = useState("");

  // ฟังก์ชันช่วยจัดการเมื่อมีการเปลี่ยนค่าภายในบล็อก
  const handleCharacterChange = (e) => {
    const value = e.target.value;
    setCharacter(value);
    onDataChange?.({ character: value, text: dialogue });
  };

  const handleDialogueChange = (e) => {
    const value = e.target.value;
    setDialogue(value);
    onDataChange?.({ character, text: value });
  };

  return (
    <div className="w-full flex items-start space-x-3 bg-white p-2 rounded-lg hover:bg-purple-50/20 transition-colors group">
      {/* 1. ฝั่งซ้าย: ตัวเลือกตัวละคร / โหมดบรรยาย */}
      <div className="flex items-center space-x-1 shrink-0">
        <span className="text-gray-400 text-xs select-none">[</span>
        <select
          value={character}
          onChange={handleCharacterChange}
          className={`bg-transparent font-medium text-xs py-0.5 px-1 rounded cursor-pointer focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-300 ${
            character === "narrator" ? "text-amber-700" : "text-purple-700"
          }`}
        >
          <option value="nevi">nevi ▾</option>
          <option value="main">main ▾</option>
          <option value="narrator">บรรยาย ▾</option>
        </select>
        <span className="text-gray-400 text-xs select-none">]</span>
        <span className="text-gray-400 text-xs font-bold select-none">:</span>
      </div>

      {/* 2. ฝั่งขวา: ช่องสำหรับกรอกบทพูดหรือคำบรรยาย */}
      <div className="flex-1">
        <input
          type="text"
          value={dialogue}
          onChange={handleDialogueChange}
          placeholder={
            character === "narrator"
              ? "พิมพ์คำบรรยายฉากที่นี่..."
              : "พิมพ์บทสนทนาที่นี่..."
          }
          className={`w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-purple-400 focus:outline-none text-xs text-gray-800 py-0.5 transition-all ${
            character === "narrator" ? "italic text-gray-600" : ""
          }`}
        />
      </div>

      {/* ปุ่มลบสำหรับจัดการบล็อกในอนาคต (จะแสดงเมื่อเอาเมาส์มา hover กลุ่ม) */}
      <button className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-xs px-1 transition-all select-none">
        &times;
      </button>
    </div>
  );
};

export default StorySection;
