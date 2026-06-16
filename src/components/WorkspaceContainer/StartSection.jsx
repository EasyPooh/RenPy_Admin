// src/components/WorkspaceContainer/StartSection.jsx
import React from "react";
import { useState } from "react";

const StartSection = ({
  startBg,
  setStartBg,
  startMusic,
  setStartMusic,
  characterList, // 🌟 รับอาร์เรย์ตัวละครจากฐานข้อมูลโดยตรง
  onCharacterListChange, // 🌟 ฟังก์ชันอัปเดตอาร์เรย์เพื่อเปิดปุ่มเซฟ
  assets,
}) => {
  // สเตทสำหรับเก็บข้อความที่กำลังพิมพ์อยู่ในช่อง Input (Local State)
  const [inputChar, setInputChar] = useState("");

  // ฟังก์ชันสำหรับตรวจจับการกด Enter เพื่อบันทึกชื่อตัวละครลงแคปซูล
  const handleKeyDown = (e) => {
    // 💡 เปลี่ยนมาเช็กตัวแปร inputChar ที่เก็บค่าจากการพิมพ์จริง
    if (e.key === "Enter" && inputChar && inputChar.trim() !== "") {
      e.preventDefault();

      const trimmedName = inputChar.trim();

      // ถ้าในลิสต์ของฐานข้อมูลยังไม่มีชื่อนี้
      if (!characterList.includes(trimmedName)) {
        const updatedList = [...characterList, trimmedName];
        // 🌟 ยิงลิสต์ก้อนใหม่กลับไปหาพ่อ พ่อจะสั่ง updateConfig ทำให้ปุ่มเซฟสว่าง!
        onCharacterListChange(updatedList);
      }

      // เคลียร์ช่องพิมพ์ให้ว่างพร้อมพิมพ์ชื่อถัดไป
      setInputChar("");
    }
  };

  // ฟังก์ชันสำหรับลบชื่อตัวละครออกจากแคปซูล
  const handleDeleteCharacter = (e, charToDelete) => {
    e.stopPropagation(); // ป้องกันบัคอีเวนต์ซ้อนคัน

    // กรองเอาเฉพาะตัวละครที่ชื่อไม่ตรงกับตัวที่ต้องการลบ
    const updatedList = characterList.filter((char) => char !== charToDelete);

    // 🌟 ส่งลิสต์หลังลบกลับไปให้พ่อเซฟด้วย
    onCharacterListChange(updatedList);

    // ถ้าตัวที่ลบ ดันตรงกับคำที่ค้างอยู่ในช่องกรอก ให้ล้างช่องกรอกด้วย
    if (inputChar === charToDelete) {
      setInputChar("");
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
            {backgroundAssets.length === 0 ? (
              <option value="">
                ❌ ยังไม่มีภาพพื้นหลังใน asset library
                (กรุณาอัปโหลดไฟล์ภาพพื้นหลังก่อน)
              </option>
            ) : (
              <option value="">[ เลือกภาพพื้นหลังเริ่มต้น ]</option>
            )}
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
            {musicAssets.length === 0 ? (
              <option value="">
                ❌ ยังไม่มีเพลงใน asset library (กรุณาอัปโหลดไฟล์เสียงก่อน)
              </option>
            ) : (
              <option value="">[ เลือกเพลงพื้นหลังเริ่มต้น ]</option>
            )}
            {musicAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.file_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Start Character */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className="w-28 text-gray-600 text-xs font-medium">
            start character
          </span>
          <input
            type="text"
            placeholder="+ เพิ่มตัวละคร (กด Enter เพื่อบันทึก)"
            value={inputChar} // 🌟 เปลี่ยนมาผูกกับสเตทภายในเครื่อง พิมพ์ได้ลื่นไหลไม่หน่วงหน้าจอ
            onChange={(e) => setInputChar(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-108 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
          />
          <div className="flex items-center space-x-2 gap-4">
            <span className="whitespace-nowrap text-gray-600 text-xs font-medium">
              {
                "<--- เพิ่มตัวละครและบันทึกไว้ในส่วนนี้ แล้วจะปรากฏให้เลือกได้ในบล็อกบทสนทนา"
              }
            </span>
          </div>
        </div>

        {/* ส่วนแสดงแคปซูลตัวละครที่ดึงมาจากฐานข้อมูลจริง */}
        <div className="flex flex-wrap gap-2" style={{ paddingLeft: "7rem" }}>
          {characterList.map((char, index) => {
            // ไฮไลต์สีม่วงจะทำงานเมื่อพิมพ์ชื่อในช่องค้นหา/กรอก ตรงกับตัวแคปซูล
            const isSelected = inputChar === char;
            return (
              <div
                key={index}
                onClick={() => setInputChar(char)} // คลิกเพื่อเอาชื่อไปใส่ในช่องกรอกข้อมูล
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-purple-100 text-purple-700 border-purple-300 font-medium"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>{char}</span>

                <button
                  type="button"
                  onClick={(e) => handleDeleteCharacter(e, char)}
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
