import React, { useEffect, useRef } from "react";
import Select from "react-select";

const DialogueSection = ({
  id,
  character,
  characterList,
  expression,
  text,
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
  selected_asset_id,
  sprite_tag,
  spriteposition,
}) => {
  // ✅ เก็บไว้สำหรับ Focus กล่องข้อความอัตโนมัติ
  const inputRef = useRef(null);

  // เอฟเฟกต์สำหรับ Auto Focus เมื่อเพิ่มบล็อกใหม่
  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id, isGhosted]);

  // จัดการปุ่ม Enter เพื่อเพิ่มบล็อกบทสนทนาใหม่
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isGhosted) return;

      if (onAddBlock) {
        onAddBlock("dialogue", {
          character: character || "",
          expression: expression || "",
          selected_asset_id: selected_asset_id || null,
          sprite_tag: sprite_tag || "",
        });
      }
    }
  };

  const spriteAssets = assets.filter((asset) => asset.file_type === "sprite");

  const currentAsset = spriteAssets.find((asset) => {
    if (selected_asset_id)
      return String(asset.id) === String(selected_asset_id);
    return asset.main_tag === sprite_tag && asset.expression_tag === expression;
  });

  const handleSelectAsset = (asset) => {
    handleUpdateBlock(id, {
      expression: asset.expression_tag || "",
      selected_asset_id: asset.id,
      sprite_tag: asset.main_tag || "",
    });
  };

  const handleClearAsset = () => {
    handleUpdateBlock(id, {
      expression: "",
      selected_asset_id: null,
      sprite_tag: "",
      spriteposition: null,
    });
  };

  // 1. แปลงรายชื่อตัวละครสำหรับตู้เลือกที่ 1
  const characterOptions = (characterList || []).map((char) => ({
    value: char,
    label: char,
  }));

  const currentCharacterOption = character
    ? { value: character, label: character }
    : null;

  // 2. แปลงคลังรูปภาพ/สีหน้าตัวละครสำหรับตู้เลือกที่ 2
  const assetOptions = (spriteAssets || []).map((asset) => ({
    value: asset.id,
    label: `${asset.main_tag} (${asset.expression_tag || "ไม่มีแท็กสีหน้า"})`,
    rawAsset: asset,
  }));

  const currentAssetOption = currentAsset
    ? {
        value: currentAsset.id,
        label: `${currentAsset.main_tag} (${currentAsset.expression_tag || "ไม่มีแท็กสีหน้า"})`,
        rawAsset: currentAsset,
      }
    : null;

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 border rounded-xl mb-3 transition-all ${
        isGhosted
          ? "opacity-40 pointer-events-none select-none bg-gray-100 border-gray-300"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-black-400 tracking-wider">
            #{blockNumber} 💬 ช่องบทสนทนา
          </label>
          {isGhosted && (
            <span className="text-xs text-red-500 font-bold animate-pulse">
              🚨 บล็อกนี้จะไม่ทำงานในเกม (อยู่หลังจุดสิ้นสุดเนื้อเรื่อง)
            </span>
          )}
        </div>

        {/* 🛠️ โซนปุ่มจัดการมุมขวาบน (สลับตำแหน่ง + ลบ) */}
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

      <div className="flex gap-3">
        {/* 1. ตู้เลือกชื่อคนพูด (react-select) */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            ชื่อคนพูด (บนกล่องข้อความ)
          </label>
          <Select
            options={characterOptions}
            value={currentCharacterOption}
            isDisabled={isGhosted}
            onChange={(selectedOption) => {
              handleUpdateBlock(
                id,
                "character",
                selectedOption ? selectedOption.value : "",
              );
            }}
            placeholder="(ไม่มีตัวละครพูด)"
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
            styles={{
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
            }}
          />
        </div>

        {/* 🖼️ 2. ตู้เลือกรูปภาพและสีหน้าตัวละคร (react-select) */}
        <div className="w-2/5 min-w-44">
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            รูปภาพและสีหน้าตัวละครที่ต้องการแสดง
          </label>
          <Select
            options={assetOptions}
            value={currentAssetOption}
            isDisabled={isGhosted}
            onChange={(selectedOption) => {
              if (selectedOption) {
                handleSelectAsset(selectedOption.rawAsset);
              } else {
                handleClearAsset();
              }
            }}
            placeholder="ไม่แสดงรูปภาพ / ซ่อนภาพ"
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
            styles={{
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
            }}
          />
        </div>
        {expression && expression !== "" && (
          <div className="w-1/4 min-w-30">
            <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
              ตำแหน่งภาพตัวละคร
            </label>
            <select
              value={spriteposition || ""}
              disabled={isGhosted}
              onChange={(e) => {
                const newValue = e.target.value === "" ? null : e.target.value;
                // ยิงค่าเดี่ยวรูปแบบเดียวกันกับช่องพิมพ์ 'character' และ 'text'
                handleUpdateBlock(id, "spriteposition", newValue);
              }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer h-9.5"
            >
              <option value="">ไม่เปลี่ยนตำแหน่ง</option>
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. ช่องกรอกบทพูด */}
      <div className="flex-1 mt-1">
        <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
          บทพูดตัวละคร (ไทย/อังกฤษ)
        </label>
        <input
          ref={inputRef}
          type="text"
          value={text}
          disabled={isGhosted}
          onChange={(e) => handleUpdateBlock(id, "text", e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์บทสนทนาตรงนี้ กด Enter เพื่อเพิ่มบล็อกบทสนทนาใหม่ทันที"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm"
        />
      </div>
    </div>
  );
};

export default DialogueSection;
