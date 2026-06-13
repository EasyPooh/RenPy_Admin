// src/components/WorkspaceContainer/WorkspaceContainer.jsx
import React, { useState } from "react";
import StartSection from "./StartSection";
import WorkspaceToolbar from "./WorkspaceToolbar"; // 👈 1. เช็คว่ามีอิมพอร์ตอันนี้อยู่ด้านบนไหม
import DialogueSection from "./DialogueSection";
import SceneSection from "./SceneSection";
import SpriteSection from "./SpriteSection";
import AudioSection from "./AudioSection";
import ChoiceSection from "./ChoiceSection";
import ChapterManagementPage from "../../pages/ChapterManagementPage";

// 2. รับ Props ทั้งหมดที่ส่งมาจากไฟล์แม่ใหญ่ (ChapterManagementPage)
const WorkspaceContainer = ({
  currentChapter,
  blocks = [],
  onAddBlock,
  handleUpdateBlock,
  handleDeleteBlock,
  focusedBlockId,
  setFocusedBlockId,
  inputRef,
  allChapters,
  assets,
  setIsDataChanged,
}) => {
  console.log("รายชื่อบทที่เดินทางมาถึง Workspace:", allChapters);
  const [characterList, setCharacterList] = useState(["เนวี่", "ผู้เล่น"]);

  const dialogueBlocks = blocks.filter((b) => b.type === "dialogue");
  const mappedDialogueOptions = dialogueBlocks.map((block, index) => {
    // ตัดข้อความบทสนทนาสั้น ๆ เพื่อเอาไปโชว์ใน Dropdown (ไม่ให้ยาวล้นจอ)
    const shortText = block.text
      ? block.text.length > 20
        ? block.text.substring(0, 20) + "..."
        : block.text
      : "(บล็อกว่างเปล่า)";

    return {
      id: block.id,
      // รูปแบบการแสดงผล: "บล็อกที่ 1: [ชื่อตัวละคร] ข้อความ..."
      displayName: `บล็อกที่ ${index + 1}: [${block.character || "ไม่มีชื่อ"}] ${shortText}`,
      pureText: block.text || "",
    };
  });

  const [startBg, setStartBg] = useState("");
  const [startMusic, setStartMusic] = useState("");
  const [startChar, setStartChar] = useState("");

  return (
    <div className="flex-1 flex flex-col h-full bg-white font-mono text-sm border-l border-gray-200 overflow-hidden">
      {/* ส่วนกระดานเนื้อหาไทม์ไลน์ (ที่เลื่อน Scrollbar ได้) */}
      <div className="flex-1 px-6 py-4 overflow-y-auto min-h-0 pb-6 bg-gray-50/30 w-full">
        {/* ส่วน Header */}
        <div className="mb-4 text-gray-500 font-semibold flex items-center justify-between select-none w-full">
          {currentChapter ? (
            <span>[ 📝 WORKSPACE AREA ] : {currentChapter.name}</span>
          ) : (
            <span>[ 📝 WORKSPACE AREA ] : กรุณาเลือกบททางซ้าย</span>
          )}
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
            startChar={startChar}
            setStartChar={setStartChar}
            characterList={characterList}
            setCharacterList={setCharacterList}
            assets={assets}
          />
        </div>

        <div className="border-t border-dashed border-gray-200 my-5"></div>

        {/* 2. พื้นที่กระดานแสดงบล็อกคำสั่ง */}
        <div className="w-full space-y-4">
          {blocks.length === 0 ? (
            /* กล่องแสดงสถานะเมื่อยังไม่มีบล็อก */
            <div className="border border-dashed border-purple-200 bg-purple-50/10 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 text-xs py-20 w-full">
              <p className="font-semibold text-purple-950 mb-1">
                {currentChapter
                  ? `กำลังทำงาน: บท "${currentChapter.name}"`
                  : "กรุณาเลือกบทเพื่อเริ่มทำงาน..."}
              </p>
              <p className="text-gray-400">
                พื้นที่ตรงนี้ว่างอยู่
                กดปุ่มแถบเครื่องมือด้านล่างเพื่อเพิ่มบทพูดเพื่อออกแบบเนื้อเรื่องได้ทันทีครับ
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
                      id={block.id}
                      character={block.character}
                      expression={block.expression}
                      text={block.text}
                      characterList={characterList}
                      block={block}
                      index={index}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกบทพูดด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                    />
                  );
                }
                if (block.type === "scene") {
                  return (
                    <SceneSection
                      key={block.id}
                      id={block.id}
                      background={block.background}
                      backgroundEffect={block.backgroundEffect}
                      backgroundEffectSpeed={block.backgroundEffectSpeed}
                      block={block}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      assets={assets}
                    />
                  );
                }

                if (block.type === "sprite") {
                  return (
                    <SpriteSection
                      key={block.id}
                      id={block.id}
                      sprite={block.sprite}
                      spritecommand={block.spritecommand}
                      spriteposition={block.spriteposition}
                      spriteSpeed={block.spriteSpeed}
                      block={block}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      assets={assets}
                    />
                  );
                }

                if (block.type === "audio") {
                  return (
                    <AudioSection
                      key={block.id}
                      id={block.id}
                      audio={block.audio}
                      audiocommand={block.audiocommand}
                      audiotype={block.audiotype}
                      block={block}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      assets={assets}
                    />
                  );
                }

                if (block.type === "choice") {
                  return (
                    <ChoiceSection
                      key={block.id}
                      id={block.id}
                      choice={block.choice}
                      block={block}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      allchapter={allChapters}
                      currentChapterBlocks={mappedDialogueOptions}
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
      <div className="p-5  w-full flex-none -mt-10 ">
        {/* ส่งฟังก์ชัน onAddBlock ที่ได้มาจากไฟล์แม่ ลงไปให้ปุ่มกดทำงาน */}
        <WorkspaceToolbar onAddBlock={onAddBlock} />
      </div>
    </div>
  );
};

export default WorkspaceContainer;
