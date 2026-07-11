import React, { useState, useEffect, useRef, forwardRef } from "react";
// 1. ดึง Select เข้ามาใช้งานสำหรับช่องค้นหาตัวละคร
import Select from "react-select";

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
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  assets = [], // ใส่ default ป้องกันกรณีเลเยอร์บนไม่ได้ส่งค่ามา
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id, isGhosted]);

  const spriteAssets = assets.filter((asset) => asset.file_type === "sprite");

  // 2. ชุดสไตล์สีม่วงแบบพรีเมียม ป้องกันเมนูดรอปดาวน์มุดทะลุขอบ
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#a855f7" : "#e5e7eb",
      boxShadow: "none",
      "&:hover": {
        borderColor: state.isFocused ? "#a855f7" : "#d1d5db",
      },
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      fontFamily: "sans-serif",
      paddingTop: "1px",
      paddingBottom: "1px",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
      zIndex: 50,
    }),
    menuPortal: (baseStyles) => ({
      ...baseStyles,
      zIndex: 9999,
    }),
  };

  // 3. แปลงข้อมูลคลังภาพตัวละครให้อยู่ในฟอร์แมต { value, label } ของ react-select
  const spriteOptions = spriteAssets.map((asset) => ({
    value: String(asset.id),
    label: asset.file_name || `ตัวละคร #${asset.id}`,
  }));

  // ตรวจหา Object ตัวเลือกที่เลือกอยู่ในปัจจุบัน
  const currentSpriteOption = sprite
    ? spriteOptions.find((opt) => opt.value === String(sprite))
    : null;

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
          {isGhosted && (
            <span className="text-xs text-red-500 font-bold animate-pulse">
              🚨 บล็อกนี้จะไม่ทำงานในเกม (อยู่หลังจุดสิ้นสุดเนื้อเรื่อง)
            </span>
          )}
        </div>
        {!isGhosted && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-black-400 tracking-wider">
              เลื่อนบล็อก
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={isFirst}
                title="เลื่อนบล็อกขึ้น"
                className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-200" />
              <button
                type="button"
                onClick={onMoveDown}
                disabled={isLast}
                title="เลื่อนบล็อกลง"
                className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={() => handleDeleteBlock(id)}
              className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              ลบ
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full">
        {/* [ช่องที่ 1] คำสั่งภาพตัวละคร */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            คำสั่งภาพตัวละคร
          </label>
          <select
            value={spritecommand}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "spritecommand", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer h-[38px]"
          >
            <option value="show">show (แสดงตัวละคร)</option>
            <option value="hide">hide (ซ่อนตัวละคร)</option>
          </select>
        </div>

        {/* 🎯 [ช่องที่ 2] ภาพตัวละคร (Sprite) - เปลี่ยนเป็น React-Select แบบค้นหาได้ */}
        <div className="w-1/4 min-w-44">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            ภาพตัวละคร (Sprite)
          </label>
          <Select
            options={spriteOptions}
            value={currentSpriteOption}
            isDisabled={isGhosted}
            onChange={(selectedOption) => {
              handleUpdateBlock(
                id,
                "sprite",
                selectedOption ? selectedOption.value : "",
              );
            }}
            placeholder={
              spriteAssets.length === 0
                ? "❌ ยังไม่มีภาพตัวละครใน asset library (กรุณาอัปโหลดก่อน)"
                : "[ เลือกภาพตัวละครเริ่มต้น ]"
            }
            isClearable={true}
            isSearchable={true}
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            }
            filterOption={(option, rawInput) => {
              const labelText = option.label
                ? String(option.label).toLowerCase()
                : "";
              const searchInput = rawInput
                ? String(rawInput).toLowerCase()
                : "";
              return labelText.includes(searchInput);
            }}
            styles={selectStyles}
          />
        </div>

        {/* [ช่องที่ 3] ตำแหน่งภาพตัวละคร */}
        {spritecommand !== "hide" && (
          <div className="w-1/4 min-w-30">
            <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
              ตำแหน่งภาพตัวละคร
            </label>
            <select
              value={spriteposition}
              disabled={isGhosted}
              onChange={(e) =>
                handleUpdateBlock(id, "spriteposition", e.target.value)
              }
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer h-[38px]"
            >
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
            </select>
          </div>
        )}

        {/* [ช่องที่ 4] ความเร็วภาพตัวละคร */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            ความเร็วภาพตัวละคร
          </label>
          <select
            value={spriteSpeed}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "spriteSpeed", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer h-[38px]"
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
