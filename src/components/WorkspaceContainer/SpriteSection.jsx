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
  isGhosted,
  blockNumber,
  assets,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id, isGhosted]);

  const spriteAssets = assets.filter((asset) => asset.file_type === "sprite");
  return (
    <div
      className={`relative flex flex-col gap-3 p-4 border rounded-xl mb-3 transition-all ${
        isGhosted
          ? "opacity-40 pointer-events-none select-none bg-gray-100 border-gray-300"
          : "bg-lime-50 text-lime-800 border-lime-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-black-400 tracking-wider">
            #{blockNumber} 🧑‍🤝‍🧑 ช่องจัดการภาพตัวละคร
          </label>
          {/* 🚨 1. แสดงข้อความเตือนเมื่อโดน Ghosted */}
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

      {/* ส่วนเนื้อหา Dropdown ที่จัดเรียงใหม่ */}
      <div className="flex gap-3 w-full">
        {/* [ช่องที่ 1] คำสั่งภาพตัวละคร (ย้ายมาไว้หน้าสุดเพื่อให้สอดคล้องกับบล็อกเสียง) */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            คำสั่งภาพตัวละคร
          </label>
          <select
            value={spritecommand}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "spritecommand", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="show">show (แสดงตัวละคร)</option>
            <option value="hide">hide (ซ่อนตัวละคร)</option>
          </select>
        </div>

        {/* [ช่องที่ 2] ภาพตัวละคร (Sprite) */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ภาพตัวละคร (Sprite)
          </label>
          <select
            value={sprite}
            disabled={isGhosted}
            onChange={(e) => handleUpdateBlock(id, "sprite", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            {/* 🎯 จัดการ Placeholder ตามจำนวนภาพตัวละครจริงในระบบ */}
            {spriteAssets.length === 0 ? (
              <option value="">
                ❌ ยังไม่มีภาพตัวละครใน asset library
                (กรุณาอัปโหลดไฟล์ภาพตัวละครก่อน)
              </option>
            ) : (
              <option value="">[ เลือกภาพพื้นหลังเริ่มต้น ]</option>
            )}
            {spriteAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.file_name}
              </option>
            ))}
          </select>
        </div>

        {/* [ช่องที่ 3] ตำแหน่งภาพตัวละคร (จะซ่อนตัวเมื่อคำสั่งเป็น hide และเหลือพื้นที่จองไว้คงรูปเด็กลงกลุ่มเดิม) */}
        {spritecommand !== "hide" && (
          <div className="w-1/4 min-w-30">
            <label className="text-xs font-bold text-gray-400 tracking-wider">
              ตำแหน่งภาพตัวละคร
            </label>
            <select
              value={spriteposition}
              disabled={isGhosted}
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
        )}

        {/* [ช่องที่ 4] ความเร็วภาพตัวละคร */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ความเร็วภาพตัวละคร
          </label>
          <select
            value={spriteSpeed}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "spriteSpeed", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="none">none</option>
            <option value="fast">fast (0.2)</option>
            <option value="normal">normal (0.5)</option>
            <option value="slow">slow (1.5)</option>
          </select>
        </div>
      </div>
      <div ref={inputRef} tabIndex="0"></div>
    </div>
  );
};

export default SpriteSection;
