import React, { useState } from "react";

const DialogueSection = ({ id, character, text, onUpdate }) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-3">
      {/* 1. Dropdown เลือกชื่อตัวละคร */}
      <div className="w-1/4 min-w-30">
        <select
          value={character}
          onChange={(e) => onUpdate(id, "character", e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
        >
          <option value="">-- เลือกตัวละคร --</option>
          <option value="nevi">เนวี่</option>
          <option value="main">ผู้เล่น</option>
          <option value="mom">แม่</option>
          <option value="secret">???</option>
        </select>
      </div>

      {/* 2. ช่องกรอกบทพูด */}
      <div className="flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => onUpdate(id, "text", e.target.value)}
          placeholder="พิมพ์บทสนทนาตรงนี้..."
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm"
        />
      </div>
    </div>
  );
};

export default DialogueSection;
