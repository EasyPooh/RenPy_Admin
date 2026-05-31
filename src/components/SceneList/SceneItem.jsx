// src/components/SceneList/SceneItem.jsx
import React, { useState } from "react";

const SceneItem = ({
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
}) => {
  // ฉากที่ 1 (เริ่มเกม) ไม่สามารถลากได้อยู่แล้วตามกฎหลัก
  const isBaseDraggable = id !== 1;

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
              className="bg-white border border-purple-300 rounded px-1.5 py-0.5 text-xs text-purple-950 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400 flex-1 select-text"
              placeholder="ตั้งชื่อฉาก..."
            />
          ) : (
            <span
              className={`text-xs font-bold transition-colors ${isActive ? "text-purple-950" : "text-gray-700"}`}
            >
              {name}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 items-center pl-3.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}

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
};

export default SceneItem;
