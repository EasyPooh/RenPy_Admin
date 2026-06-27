import { audio } from "framer-motion/client";
import React, { useState, useEffect, useRef, forwardRef } from "react";

const AudioSection = ({
  id,
  audio,
  audiocommand,
  audiotype,
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

  // 🎯 1. กรองไฟล์เสียงแยกตามประเภทแบบปลอดภัย (สวม || [] ครอบไว้เสมอ)
  const filteredAudioAssets = (assets || []).filter((asset) => {
    if (audiotype === "bgm") {
      return asset.file_type === "music";
    } else if (audiotype === "sfx") {
      return asset.file_type === "sound_effect";
    }
    return false;
  });

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 border rounded-xl mb-3 transition-all ${
        isGhosted
          ? "opacity-40 pointer-events-none select-none bg-gray-100 border-gray-300"
          : "bg-purple-50 text-purple-700 border-purple-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-black-400 tracking-wider">
            #{blockNumber} 🔊 ช่องจัดการเสียง
          </label>
          {/* 🚨 1. แสดงข้อความเตือนสีแดงเมื่อบล็อกถูก Ghosted */}
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
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            คำสั่งเสียง
          </label>
          <select
            value={audiocommand}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "audiocommand", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="" disabled>
              [ เลือกคำสั่งเสียง ]
            </option>
            <option value="stop">stop</option>
            <option value="play">play</option>
          </select>
        </div>
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ประเภทเสียง
          </label>
          <select
            value={audiotype}
            disabled={isGhosted}
            onChange={(e) => handleUpdateBlock(id, "audiotype", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="bgm">background music</option>
            <option value="sfx">sound effects</option>
          </select>
        </div>
        {audiocommand === "play" && (
          <div className="w-1/4 min-w-30">
            <label className="text-xs font-bold text-gray-400 tracking-wider">
              เลือกไฟล์เสียง
            </label>

            <select
              value={audio}
              disabled={isGhosted}
              onChange={(e) => handleUpdateBlock(id, "audio", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
            >
              {/* 🎯 2. แสดง Placeholder ตามสถานะเพลงในคลังจริง */}
              {filteredAudioAssets.length === 0 ? (
                <option value="">
                  ❌ ไม่มีไฟล์{" "}
                  {audiotype === "bgm" ? "เพลงประกอบ" : "เอฟเฟกต์เสียง"} ในระบบ
                  (กรุณาอัปโหลดไฟล์ใน asset library ก่อน)
                </option>
              ) : (
                <option value="">[ เลือกเสียงที่ต้องการ ]</option>
              )}

              {filteredAudioAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.file_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div ref={inputRef} tabIndex="0"></div>
    </div>
  );
};

export default AudioSection;
