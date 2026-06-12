// src/components/ChapterList/ChapterItem.jsx
import React, { useState, useRef, forwardRef } from "react";
import TagPopover from "./TagPopover";

const ChapterItem = React.forwardRef(
  (
    {
      id,
      name,
      status,
      tags,
      isActive,
      isDragging,
      onClick,
      onNameChange,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd,
      index,
      handleDeleteChapter,
      suggestedTags, // รับชุดแท็กตัวเลือกส่วนกลางจากหน้าหลัก
      onAddTagToChapter, // ฟังก์ชันเพิ่มแท็กที่สร้างไว้ในหน้าหลัก
      onRemoveTagFromChapter, // ฟังก์ชันลบแท็กที่สร้างไว้ในหน้าหลัก
    },
    ref,
  ) => {
    // ฉากที่ 1 (เริ่มเกม) ไม่สามารถลากได้อยู่แล้วตามกฎหลัก
    const isBaseDraggable = id !== 1;

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // 🌟 เพิ่ม State ภายในไอเท็มเพื่อสลับโหมดการลากย้ายวัตถุ
    // ถ้าพิมพ์อยู่จะเซตเป็น false เพื่อคืนสิทธิ์ให้เมาส์ทำหน้าที่เลือกข้อความ (Text Selection)
    const [isInputFocusing, setIsInputFocusing] = useState(false);

    return (
      <div
        onClick={onClick}
        // 🌟 ควบคุมสิทธิ์การลากแบบไดนามิก: หากช่อง input ทำงานอยู่ จะห้ามลากกล่องเด็ดขาด
        draggable={isBaseDraggable && !isInputFocusing}
        onDragStart={(e) =>
          isBaseDraggable && !isInputFocusing && onDragStart(e, index, id)
        }
        onDragOver={(e) => isBaseDraggable && onDragOver(e)}
        onDrop={(e) => isBaseDraggable && onDrop(e, index)}
        onDragEnd={onDragEnd}
        className={`p-3.5 rounded-xl border text-left relative select-none transition-all duration-150 ${
          isDragging
            ? "opacity-100 bg-purple-100 border-purple-500 ring-2 ring-purple-400/50 scale-[1.02] shadow-md z-50"
            : isActive
              ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
              : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
        } ${isBaseDraggable && !isInputFocusing ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
      >
        {isBaseDraggable && (
          <div className="absolute right-3 top-3 text-[10px] text-gray-300 font-bold">
            ⋮⋮
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-purple-600" : "bg-gray-300"}`}
            ></span>
            <span className="text-xs font-bold text-gray-400 select-none">
              {id}.
            </span>

            {isActive && id !== 1 ? (
              <input
                ref={ref}
                type="text"
                value={name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onNameChange?.(id, e.target.value)}
                // 🌟 จังหวะเด็ด: เมื่อเมาส์กดลงในช่อง หรือคลิกโฟกัส ให้ปิดโหมดลากกล่องทันที
                onMouseDown={() => setIsInputFocusing(true)}
                onFocus={() => setIsInputFocusing(true)}
                // เมื่อปล่อยเมาส์ หรือคลิกไปที่อื่น (Blur) ให้คืนสิทธิ์การลากให้ตัวกล่องนอก
                onMouseUp={() => {
                  // ใช้ setTimeout เล็กน้อยเพื่อให้เบราว์เซอร์ลากคลุมดำข้อความเสร็จสิ้นก่อนคืนสถานะ
                  setTimeout(() => setIsInputFocusing(false), 100);
                }}
                onBlur={() => setIsInputFocusing(false)}
                className="bg-white border border-purple-300 rounded px-1.5 py-0.5 text-xs text-purple-950 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400 flex-none max-w-xs select-text"
                placeholder="ตั้งชื่อฉาก..."
              />
            ) : (
              <span
                className={`text-xs font-bold transition-colors ${isActive ? "text-purple-950" : "text-gray-700"}`}
              >
                {name}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation(); // สำคัญมาก! ป้องกันการเกิด Event ซ้อนทับกัน
                handleDeleteChapter(id);
              }}
              className="absolute right-3 top-3 text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
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

          <div className="flex flex-wrap items-center gap-1.5 mt-2 relative">
            {/* 1. แสดงรายการแท็กที่มีอยู่เดิมของบทนี้ */}
            {tags.map((tag, tagIdx) => (
              <span
                key={tagIdx}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded"
              >
                {tag}
                {/* ปุ่มกากบาทจิ๋วสำหรับกดเอาแท็กออก */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTagFromChapter(id, tag);
                  }}
                  className="hover:text-amber-900 font-bold ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}

            {/* 2. ปุ่มเพิ่มแท็ก หรือแสดงสถานะระบุชนิดประเภทตามรูป */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPopoverOpen(!isPopoverOpen);
              }}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-0.5 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200"
            >
              {isPopoverOpen ? "ปิดหน้าต่าง" : "+ เพิ่มแท็ก"}
            </button>

            {/* 3. เรียกใช้ Popover แบบวางเงื่อนไข Absolute ลอยเหนือ Layout ด้านล่าง */}
            {isPopoverOpen && (
              <div className="absolute left-0 top-full mt-1 w-full z-50">
                <TagPopover
                  suggestedTags={suggestedTags}
                  onSelectTag={(tagName) => {
                    onAddTagToChapter(id, tagName);
                    setIsPopoverOpen(false); // เลือกเสร็จให้ปิดหน้าต่างอัตโนมัติ
                  }}
                  onAddCustomTag={(tagName) => {
                    onAddTagToChapter(id, tagName);
                    setIsPopoverOpen(false); // พิมพ์เพิ่มเสร็จให้ปิดหน้าต่างอัตโนมัติ
                  }}
                  onClose={() => setIsPopoverOpen(false)}
                />
              </div>
            )}

            {status === "done" ? (
              <span className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                [ ✓ done ]
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-600 text-[10px] px-1.5 py-0.5 rounded font-medium">
                [ draft ]
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ChapterItem.displayName = "ChapterItem";
export default ChapterItem;
