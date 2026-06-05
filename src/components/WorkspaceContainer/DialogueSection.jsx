import React, { useState } from "react";
import WorkspaceContainer from "./WorkspaceContainer";
import StartSection from "./StartSection";
import WorkspaceToolbar from "./WorkspaceToolbar";
import SceneManagementPage from "../../pages/SceneManagementPage";

const DialogueSection = ({
  id,
  character,
  characterList,
  expression,
  text,
  onUpdate,
  onAddBlock,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-3">
      <label className="text-xs font-bold text-gray-400 tracking-wider">
        ช่องบทสนทนา
      </label>
      <div className="flex gap-3">
        {/* 1. Dropdown เลือกชื่อตัวละคร */}
        <div className="w-1/4 min-w-30">
          <select
            value={character}
            onChange={(e) => onUpdate(id, "character", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="">-- เลือกตัวละคร --</option>
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
          <select
            value={expression}
            onChange={(e) => onUpdate(id, "expression", e.target.value)}
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
          type="text"
          value={text}
          onChange={(e) => onUpdate(id, "text", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // 2. ถ้ามี onAddBlock ส่งมา ให้เรียกใช้ฟังก์ชันนั้น
              if (onAddBlock) {
                onAddBlock();
              }
            }
          }}
          placeholder="พิมพ์บทสนทนาตรงนี้..."
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm"
        />
      </div>
    </div>
  );
};

export default DialogueSection;
