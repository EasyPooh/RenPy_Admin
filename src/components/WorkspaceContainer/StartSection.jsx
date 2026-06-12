// src/components/WorkspaceContainer/StartSection.jsx
import React from "react";
import { useState } from "react";

const StartSection = ({
  startBg,
  setStartBg,
  startMusic,
  setStartMusic,
  startChar,
  setStartChar,
  characterList,
  setCharacterList,
  assets,
}) => {
  // 2. เพิ่ม State นี้เข้าไปเพื่อเก็บอาร์เรย์ของตัวละครทั้งหมดที่เคยบันทึก
  // สามารถใส่ค่าเริ่มต้นไว้ก่อนได้

  // ฟังก์ชันสำหรับตรวจจับการกด Enter เพื่อบันทึกชื่อตัวละครลงแคปซูล
  const handleKeyDown = (e) => {
    // เพิ่มตัวเช็ก && startChar เข้าไปข้างหน้า เพื่อป้องกัน undefined
    if (e.key === "Enter" && startChar && startChar.trim() !== "") {
      e.preventDefault();
      if (!characterList.includes(startChar.trim())) {
        setCharacterList([...characterList, startChar.trim()]);
      }
      setStartChar("");
    }
  };
  // ฟังก์ชันสำหรับลบชื่อตัวละครออกจากแคปซูล
  const handleDeleteCharacter = (e, charToDelete) => {
    e.stopPropagation(); // 💡 สำคัญมาก: ป้องกันไม่ให้จิ้มโดนปุ่มลบแล้วมันไปสั่งให้ input เลือกตัวละครนั้นซ้ำ

    // กรองเอาเฉพาะตัวละครที่ชื่อไม่ตรงกับตัวที่ต้องการลบ
    const updatedList = characterList.filter((char) => char !== charToDelete);
    setCharacterList(updatedList);

    // (Option) ถ้าตัวที่กำลังลบอยู่ ดันตรงกับค่าในช่อง input หลัก ให้ล้างค่าในช่อง input ด้วย
    if (startChar === charToDelete) {
      setStartChar("");
    }
  };

  const musicAssets = assets.filter((asset) => asset.file_type === "music");
  const backgroundAssets = assets.filter(
    (asset) => asset.file_type === "background",
  );

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 select-none">
      <div className="text-xs font-bold text-gray-400 tracking-wider">
        🎬 CONFIG ฉากเริ่มต้น
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Background */}
        <div className="flex items-center space-x-2">
          <span className="w-28 text-gray-600 text-xs font-medium">
            start background
          </span>
          <select
            value={startBg}
            disabled={backgroundAssets.length === 0}
            onChange={(e) => setStartBg(e.target.value)}
            className="flex-1 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
          >
            {/* 🎯 จัดการ Placeholder ตามจำนวนภาพพื้นหลังจริงในระบบ */}
            {backgroundAssets.length === 0 ? (
              <option value="">
                ❌ ยังไม่มีภาพพื้นหลังใน asset library
                (กรุณาอัปโหลดไฟล์ภาพพื้นหลังก่อน)
              </option>
            ) : (
              <option value="">[ เลือกภาพพื้นหลังเริ่มต้น ]</option>
            )}
            {/* วนลูปเฉพาะเพลงที่มีอยู่จริงเข้ามาแสดงผล */}
            {backgroundAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.file_name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Music */}
        <div className="flex items-center space-x-2">
          <span className="w-28 text-gray-600 text-xs font-medium">
            start music
          </span>
          <select
            value={startMusic}
            disabled={musicAssets.length === 0}
            onChange={(e) => setStartMusic(e.target.value)}
            className="flex-1 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
          >
            {/* 🎯 จัดการ Placeholder ตามจำนวนเพลงจริงในระบบ */}
            {musicAssets.length === 0 ? (
              <option value="">
                ❌ ยังไม่มีเพลงใน asset library (กรุณาอัปโหลดไฟล์เสียงก่อน)
              </option>
            ) : (
              <option value="">[ เลือกเพลงพื้นหลังเริ่มต้น ]</option>
            )}
            {/* วนลูปเฉพาะเพลงที่มีอยู่จริงเข้ามาแสดงผล */}
            {musicAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.file_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Start Character */}
      <div className="flex flex-col space-y-2 ">
        {/* ส่วนช่องกรอกข้อมูลเดิม */}
        <div className="flex items-center space-x-2 ">
          <span className="w-28 text-gray-600 text-xs font-medium">
            start character
          </span>
          <input
            type="text"
            placeholder="+ เพิ่มตัวละคร (กด Enter เพื่อบันทึก)"
            value={startChar}
            onChange={(e) => setStartChar(e.target.value)}
            onKeyDown={handleKeyDown} // เพิ่ม Event ตรวจจับการกด Enter
            className="w-108 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
          />
          <div className="flex items-center space-x-2 gap-4">
            <span className="whitespace-nowrap text-gray-600 text-xs font-medium ">
              {
                "<--- เพิ่มตัวละครและบันทึกไว้ในส่วนนี้ แล้วจะปรากฏให้เลือกได้ในบล็อกบทสนทนา"
              }
            </span>
          </div>
        </div>

        {/* ส่วนแสดงแคปซูลตัวละครที่เคยบันทึกไว้ */}
        <div
          className="flex flex-wrap gap-2 pl-30"
          style={{ paddingLeft: "7rem" }}
        >
          {characterList.map((char, index) => {
            const isSelected = startChar === char;
            return (
              <div
                key={index}
                onClick={() => setStartChar(char)} // คลิกที่ตัวแคปซูลเพื่อเลือก
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-purple-100 text-purple-700 border-purple-300 font-medium"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {/* ชื่อตัวละคร */}
                <span>{char}</span>

                {/* ปุ่มกากบาทสำหรับลบ */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteCharacter(e, char)} // เรียกฟังก์ชันลบเมื่อกด (x)
                  className={`flex items-center justify-center w-3.5 h-3.5 rounded-full text-[10px] font-bold transition-colors ${
                    isSelected
                      ? "text-purple-500 hover:bg-purple-200 hover:text-purple-800"
                      : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  }`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StartSection;
