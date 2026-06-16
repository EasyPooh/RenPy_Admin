// src/components/GlobalSaveButton.jsx
import React, { useState, useEffect } from "react";
import { useSaveManager } from "../../hooks/useSaveManager";

function GlobalSaveButton({ isDataChanged, onSaveAll }) {
  const [saveState, setSaveState] = useState("saved"); // 'saved' | 'unsaved' | 'saving' | 'success'

  // คอยจับตาดูว่าถ้าข้อมูลในหน้าใหญ่เปลี่ยน ให้ปลุกปุ่มเซฟขึ้นมา
  useEffect(() => {
    console.log(
      "⚙️ [ปุ่มเซฟ] useEffect กำลังทำงาน, isDataChanged คือ:",
      isDataChanged,
    );
    if (isDataChanged) {
      setSaveState("unsaved");
    } else {
      setSaveState("saved");
    }
  }, [isDataChanged]);

  useEffect(() => {}, [saveState]);

  const handlePressSave = async () => {
    if (saveState !== "unsaved") return; // ป้องกันการกดเบิ้ล

    setSaveState("saving"); // เปลี่ยนสถานะเป็นกำลังเซฟ (ปุ่มจะล็อคทันที)

    try {
      if (onSaveAll) {
        await onSaveAll(); // สั่งให้ฟังก์ชันเซฟที่ส่งมาจากหน้าหลักทำงาน
      }

      setSaveState("success"); // เซฟสำเร็จ!

      setTimeout(() => {
        setSaveState("saved"); // ผ่านไป 2 วิ กลับไปสถานะเซฟแล้วนิ่งๆ
      }, 2000);
    } catch (error) {
      console.error(error);
      setSaveState("unsaved"); // ถ้าพัง ให้เปิดให้กดเซฟใหม่ได้
    }
  };

  // ปุ่มสไตล์ Tailwind CSS ตามสถานะต่างๆ
  const buttonStyles = {
    saved:
      "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50 border border-gray-600",
    unsaved:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold transform hover:scale-[1.01] active:scale-[0.99]",
    saving: "bg-yellow-600 text-white cursor-wait",
    success: "bg-green-600 text-white font-bold",
  };

  return (
    <div className="flex items-center gap-3">
      {/* ข้อความสถานะข้างปุ่ม */}
      <span className="text-xs text-gray-400 font-light">
        {saveState === "unsaved" && "⚠️ มีข้อมูลยังไม่ได้บันทึก"}
        {saveState === "saving" && "⏳ กำลังบันทึกข้อมูล..."}
        {saveState === "success" && "✨ บันทึกเรียบร้อย!"}
        {saveState === "saved" && "✓ งานเป็นปัจจุบันแล้ว"}
      </span>

      {/* ตัวปุ่มเซฟแปลงร่าง */}
      <button
        onClick={handlePressSave}
        disabled={saveState !== "unsaved"}
        className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${buttonStyles[saveState]}`}
      >
        {saveState === "unsaved" && (
          <>
            <span>💾</span> Save All Changes
          </>
        )}
        {saveState === "saving" && (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Saving...
          </>
        )}
        {saveState === "success" && (
          <>
            <span>🎉</span> Saved!
          </>
        )}
        {saveState === "saved" && (
          <>
            <span>✓</span> Saved
          </>
        )}
      </button>
    </div>
  );
}

export default GlobalSaveButton;
