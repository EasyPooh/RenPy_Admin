import React, { useState, useEffect, useRef, forwardRef } from "react";
import Select from "react-select";

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
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  assets = [],
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id, isGhosted]);

  // กรองไฟล์เสียงแยกตามประเภทแบบปลอดภัย
  const filteredAudioAssets = (assets || []).filter((asset) => {
    if (audiotype === "bgm") {
      return asset.file_type === "music";
    } else if (audiotype === "sfx") {
      return asset.file_type === "sound_effect";
    }
    return false;
  });

  // ชุดแต่งสไตล์สีม่วงพรีเมียม
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

  // แปลงชุดข้อมูลเสียงให้เข้าฟอร์แมต { value, label } ของ react-select
  const audioOptions = filteredAudioAssets.map((asset) => ({
    value: String(asset.id),
    label: asset.file_name || `ไฟล์เสียง #${asset.id}`,
  }));

  // ค้นหา Object ตัวเลือกเสียงที่ตรงกับค่าปัจจุบันในระบบ
  const currentAudioOption = audio
    ? audioOptions.find((opt) => opt.value === String(audio))
    : null;

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
        {/* [ช่องที่ 1] คำสั่งเสียง */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            คำสั่งเสียง
          </label>
          <select
            value={audiocommand}
            disabled={isGhosted}
            onChange={(e) =>
              handleUpdateBlock(id, "audiocommand", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer h-[38px]"
          >
            <option value="" disabled>
              [ เลือกคำสั่งเสียง ]
            </option>
            <option value="stop">stop</option>
            <option value="play">play</option>
          </select>
        </div>

        {/* 🛠️ [ช่องที่ 2] ประเภทเสียง - เพิ่มฟังก์ชันเคลียร์ค่าเก่าอัตโนมัติ */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            ประเภทเสียง
          </label>
          <select
            value={audiotype}
            disabled={isGhosted}
            onChange={(e) => {
              handleUpdateBlock(id, "audiotype", e.target.value);
              handleUpdateBlock(id, "audio", ""); // ✨ ล้างค่า ID เสียงเก่าออกทันทีเมื่อสลับประเภทเสียง
            }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer h-[38px]"
          >
            <option value="bgm">background music</option>
            <option value="sfx">sound effects</option>
          </select>
        </div>

        {/* [ช่องที่ 3] เลือกไฟล์เสียง */}
        {audiocommand === "play" && (
          <div className="w-1/4 min-w-44">
            <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
              เลือกไฟล์เสียง
            </label>
            <Select
              options={audioOptions}
              value={currentAudioOption}
              isDisabled={isGhosted}
              onChange={(selectedOption) => {
                handleUpdateBlock(
                  id,
                  "audio",
                  selectedOption ? selectedOption.value : "",
                );
              }}
              placeholder={
                filteredAudioAssets.length === 0
                  ? `❌ ไม่มีไฟล์ ${audiotype === "bgm" ? "เพลงประกอบ" : "เอฟเฟกต์เสียง"} ในระบบ`
                  : "[ เลือกเสียงที่ต้องการ ]"
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
        )}
      </div>

      <div ref={inputRef} tabIndex="0"></div>
    </div>
  );
};

export default AudioSection;
