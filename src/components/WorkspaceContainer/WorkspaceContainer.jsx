// src/components/WorkspaceContainer/WorkspaceContainer.jsx
import React, { useState } from "react";
import StartSection from "./StartSection";
import WorkspaceToolbar from "./WorkspaceToolbar"; // 👈 1. เช็คว่ามีอิมพอร์ตอันนี้อยู่ด้านบนไหม
import DialogueSection from "./DialogueSection";

// 2. รับ Props ทั้งหมดที่ส่งมาจากไฟล์แม่ใหญ่ (SceneManagementPage)
const WorkspaceContainer = ({ currentScene, blocks = [], onAddBlock }) => {
  const [startBg, setStartBg] = useState("");
  const [startMusic, setStartMusic] = useState("");

  const handleDeleteBlock = (id) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white font-mono text-sm border-l border-gray-200 overflow-hidden">
      {/* ส่วนกระดานเนื้อหาไทม์ไลน์ (ที่เลื่อน Scrollbar ได้) */}
      <div className="flex-1 px-6 py-4 overflow-y-auto min-h-0 pb-6 bg-gray-50/30 w-full">
        {/* ส่วน Header */}
        <div className="mb-4 text-gray-500 font-semibold flex items-center justify-between select-none w-full">
          <span>[ 📝 WORKSPACE AREA ]</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-sans">
            จำนวนบล็อก: {blocks.length}
          </span>
        </div>

        {/* 1. ส่วน StartSection */}
        <div className="w-full">
          <StartSection
            startBg={startBg}
            setStartBg={setStartBg}
            startMusic={startMusic}
            setStartMusic={setStartMusic}
          />
        </div>

        <div className="border-t border-dashed border-gray-200 my-5"></div>

        {/* 2. พื้นที่กระดานแสดงบล็อกคำสั่ง */}
        <div className="w-full space-y-4">
          {blocks.length === 0 ? (
            /* กล่องแสดงสถานะเมื่อยังไม่มีบล็อก */
            <div className="border border-dashed border-purple-200 bg-purple-50/10 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 text-xs py-20 w-full">
              <p className="font-semibold text-purple-950 mb-1">
                {currentScene
                  ? `กำลังทำงาน: ฉาก "${currentScene.name}"`
                  : "กรุณาเลือกฉาก"}
              </p>
              <p className="text-gray-400">
                พื้นที่ตรงนี้ว่างอยู่
                กดปุ่มแถบเครื่องมือด้านล่างเพื่อเพิ่มบทพูดเพื่อออกแบบเส้นเรื่องได้ทันทีครับ
              </p>
            </div>
          ) : (
            /* วนลูปโชว์บล็อกบทพูด */
            <div className="w-full space-y-3">
              {blocks.map((block, index) => {
                if (block.type === "dialogue") {
                  return (
                    <DialogueSection
                      key={block.id}
                      block={block}
                      index={index}
                      onDelete={() => handleDeleteBlock(block.id)}
                    />
                  );
                }
                return (
                  <div
                    key={block.id}
                    className="p-3 border rounded-lg w-full bg-white"
                  >
                    บล็อกประเภท: {block.type}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------
          [ 🌟 เติมจุดนี้ ] แถบเครื่องมือปุ่มกดที่หายไป เอามาล็อกไว้ตรงนี้แทนครับ
          ---------------------------------------------------- */}
      <div className="p-5 border-t border-gray-100 bg-white w-full flex-none">
        {/* ส่งฟังก์ชัน onAddBlock ที่ได้มาจากไฟล์แม่ ลงไปให้ปุ่มกดทำงาน */}
        <WorkspaceToolbar onAddBlock={onAddBlock} />
      </div>
    </div>
  );
};

export default WorkspaceContainer;
