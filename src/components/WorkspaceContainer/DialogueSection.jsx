import React, { useState, useEffect, useRef } from "react";

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
  assets = [],
  // 🌟 เพิ่ม Props ใหม่ 2 ตัวเพื่อเก็บความสัมพันธ์ของรูปภาพที่เลือกอย่างแม่นยำ
  selected_asset_id,
  sprite_tag,
}) => {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔄 State สำหรับควบคุมการเปิด-ปิดกล่องเลือกรูปภาพพรีวิว
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id, isGhosted]);

  // 🖱️ ดักจับการคลิกข้างนอกกล่องเพื่อปิด Dropdown อัตโนมัติ
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // 🗺️ กรองหาเฉพาะ Asset ที่เป็นภาพตัวละคร (Sprite) ทั้งหมดที่มีในคลังมารอไว้
  const spriteAssets = assets.filter((asset) => asset.file_type === "sprite");

  // 🎯 ค้นหาตัว Asset ปัจจุบันที่บล็อกนี้กำลังเลือกอยู่ (หาจาก ID หรือจับคู่ชื่อ+สีหน้าเดิม)
  const currentAsset = spriteAssets.find((asset) => {
    if (selected_asset_id)
      return String(asset.id) === String(selected_asset_id);
    return asset.main_tag === sprite_tag && asset.expression_tag === expression;
  });

  // ⚡ ฟังก์ชันจัดการเมื่อผู้ใช้คลิกเลือกรูปภาพตัวละคร
  const handleSelectAsset = (asset) => {
    handleUpdateBlock(id, {
      expression: asset.expression_tag || "",
      selected_asset_id: asset.id,
      sprite_tag: asset.main_tag || "",
    });

    setIsDropdownOpen(false);
  };

  // ❌ ฟังก์ชันสำหรับล้างค่ารูปภาพออก (กรณีบทพูดนี้ไม่อยากให้มีตัวละครเปลี่ยนสีหน้าหรือโผล่มาใหม่)
  const handleClearAsset = () => {
    handleUpdateBlock(id, {
      expression: "",
      selected_asset_id: null,
      sprite_tag: "",
    });
    setIsDropdownOpen(false);
  };

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
        {/* 1. Dropdown เลือกชื่อคนพูด */}
        <div className="w-1/4 min-w-30">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            ชื่อคนพูด (บนกล่องข้อความ)
          </label>
          <select
            value={character}
            disabled={isGhosted}
            onChange={(e) => handleUpdateBlock(id, "character", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer"
          >
            <option value="">(ไม่มีตัวละครพูด)</option>
            {characterList &&
              characterList.map((char, index) => (
                <option key={index} value={char}>
                  {char}
                </option>
              ))}
          </select>
        </div>

        {/* 🖼️ 2. Custom Dropdown เลือกรูปภาพตัวละคร + สีหน้าอารมณ์ (มีพรีวิวรูป) */}
        <div className="w-2/5 min-w-44 relative" ref={dropdownRef}>
          <label className="text-xs font-bold text-gray-400 tracking-wider block mb-1">
            รูปภาพและสีหน้าตัวละครที่ต้องการแสดง
          </label>

          {/* ปุ่มกดเปิดรายการ Dropdown */}
          <button
            type="button"
            disabled={isGhosted}
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setSearchTerm(""); // ล้างคำค้นหาทุกครั้งที่ปิด/เปิดใหม่
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm text-left h-9.5"
          >
            {currentAsset ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate font-medium text-gray-700">
                  {currentAsset.main_tag}{" "}
                  <span className="text-gray-400 text-xs">
                    ({currentAsset.expression_tag || "ไม่มีแท็กสีหน้า"})
                  </span>
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">
                ❌ ไม่แสดงรูปภาพ / ซ่อนภาพ
              </span>
            )}
            <svg
              className="w-4 h-4 text-gray-400 shrink-0 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* รายการรูปภาพสไปรต์ที่จะงอกลงมาเมื่อกดเปิด */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 p-1">
              {/* 🌟 ส่วนที่เพิ่มเข้ามาใหม่: Sticky Search Bar */}
              <div className="sticky top-0 bg-white pb-1 z-10">
                <input
                  type="text"
                  placeholder="พิมพ์ค้นหาชื่อตัวละคร หรือ สีหน้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-purple-400 bg-gray-50/50"
                />
              </div>

              {/* ตัวเลือกพิเศษสำหรับล้างค่า/ซ่อนภาพ */}
              <div
                onClick={handleClearAsset}
                className="flex items-center px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
              >
                ❌ ไม่แสดงรูปภาพ / ซ่อนภาพตัวละครในประโยคนี้
              </div>
              <hr className="my-1 border-gray-100" />

              {/* 🌟 กรองข้อมูล spriteAssets ตาม searchTerm ก่อนนำไปแสดงผล */}
              {(() => {
                const filteredAssets = spriteAssets.filter((asset) => {
                  const mainTag = (asset.main_tag || "").toLowerCase();
                  const expTag = (
                    asset.expression_tag || "ทั่วไป"
                  ).toLowerCase();
                  const query = searchTerm.toLowerCase().trim();
                  return mainTag.includes(query) || expTag.includes(query);
                });

                if (filteredAssets.length === 0) {
                  return (
                    <div className="px-3 py-4 text-xs text-gray-400 text-center">
                      {spriteAssets.length === 0
                        ? "ไม่มีรูปภาพตัวละครในคลัง Asset"
                        : "🔍 ไม่พบตัวละครหรือสีหน้าที่ค้นหา"}
                    </div>
                  );
                }

                return filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      handleSelectAsset(asset);
                      setIsDropdownOpen(false); // ปรับให้ปิด dropdown เมื่อเลือก
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 hover:bg-purple-50 rounded-md cursor-pointer transition-colors text-sm ${
                      selected_asset_id === asset.id
                        ? "bg-purple-50 font-semibold text-purple-700"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{asset.main_tag}</span>
                      <span className="text-xs text-gray-400 truncate">
                        สีหน้า: {asset.expression_tag || "ทั่วไป"}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
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
