import React from "react";
import DialogueSection from "./DialogueSection";
import SceneSection from "./SceneSection";
import SpriteSection from "./SpriteSection";
import { useBlocks } from "../../hooks/useBlocks.js";

const WorkspaceToolbar = ({ onAddBlock }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 select-none ">
      {/* ส่วนหัวข้อบอกใบ้การกระทำ */}
      <div className="flex items-center space-x-1.5 text-purple-600 font-semibold text-xs mb-3">
        <span>➕ เพิ่มบล็อกใหม่ต่อท้าย </span>
      </div>

      {/* แผงปุ่มกดสร้าง Action */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
        {/* ผูกปุ่มบทพูดให้ส่งประเภท 'dialogue' */}
        <button
          onClick={() => onAddBlock("dialogue")}
          className="flex items-center space-x-1 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <span>💬 บทพูด</span>
        </button>

        <button
          onClick={() => onAddBlock("scene")}
          className="flex items-center space-x-1 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <span>🖼️ ภาพพื้นหลัง </span>
        </button>
        <button
          onClick={() => onAddBlock("sprite")}
          className="flex items-center space-x-1 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <span>🧑‍🤝‍🧑ตัวละคร</span>
        </button>
        <button
          onClick={() => onAddBlock("audio")}
          className="flex items-center space-x-1 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <span>🔊 เสียงพื้นหลัง/sfx </span>
        </button>
        <button
          onClick={() => onAddBlock("choice")}
          className="flex items-center space-x-1 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <span>🔀 ช้อยส์ตัวเลือก</span>
        </button>
      </div>
    </div>
  );
};

export default WorkspaceToolbar;
