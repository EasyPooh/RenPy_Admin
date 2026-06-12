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
  assets,
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
          ช่องเลือกเสียง
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
            คำสั่งเสียง
          </label>
          <select
            value={audiocommand}
            onChange={(e) =>
              handleUpdateBlock(id, "audiocommand", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
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
              onChange={(e) => handleUpdateBlock(id, "audio", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
            >
              {assets
                ?.filter((asset) => {
                  if (audiotype === "bgm") {
                    return asset.file_type === "music";
                  } else if (audiotype === "sfx") {
                    return asset.file_type === "sound_effect";
                  }
                  return false;
                })
                .map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.file_name} {/* แสดงชื่อไฟล์ที่ผู้ใช้ตั้งไว้ */}
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
