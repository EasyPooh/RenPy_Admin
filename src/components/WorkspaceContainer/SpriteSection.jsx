import React, { useState, useEffect, useRef, forwardRef } from "react";

const SpriteSection = ({
  id,
  sprite,
  spritecommand,
  spriteposition,
  spriteSpeed,
  handleUpdateBlock,
  handleDeleteBlock,
  onAddBlock,
  focusedBlockId,
  setFocusedBlockId,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id]);
  return (
    <div className="relative flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-gray-400 tracking-wider">
          ช่องเลือกภาพตัวละคร
        </label>
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
      </div>
      <div className="flex gap-3">
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ภาพตัวละคร (Sprite)
          </label>
          <select
            value={sprite}
            onChange={(e) => handleUpdateBlock(id, "sprite", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="sprite_character1">Nevi01.jpg</option>
            <option value="sprite_character2">Chris01.png</option>
          </select>
        </div>
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            คำสั่งภาพตัวละคร
          </label>
          <select
            value={spritecommand}
            onChange={(e) =>
              handleUpdateBlock(id, "spritecommand", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="show">show (แสดงตัวละคร)</option>
            <option value="hide">hide (ซ่อนตัวละคร)</option>
          </select>
        </div>
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ตำแหน่งภาพตัวละคร
          </label>
          <select
            value={spriteposition}
            onChange={(e) =>
              handleUpdateBlock(id, "spriteposition", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </div>
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ความเร็วภาพตัวละคร
          </label>
          <select
            value={spriteSpeed}
            onChange={(e) =>
              handleUpdateBlock(id, "spriteSpeed", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="none">none</option>
            <option value="slow">slow (0.2)</option>
            <option value="normal">normal (0.5)</option>
            <option value="fast">fast (1.0)</option>
          </select>
        </div>
      </div>
      <div ref={inputRef} tabIndex="0"></div>
    </div>
  );
};

export default SpriteSection;
