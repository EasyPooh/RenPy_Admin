// src/components/WorkspaceContainer/WorkspaceContainer.jsx
import React, { useState } from "react";
import StartSection from "./StartSection";
import WorkspaceToolbar from "./WorkspaceToolbar"; // 👈 1. เช็คว่ามีอิมพอร์ตอันนี้อยู่ด้านบนไหม
import DialogueSection from "./DialogueSection";
import SceneSection from "./SceneSection";
import SpriteSection from "./SpriteSection";
import AudioSection from "./AudioSection";
import ChoiceSection from "./ChoiceSection";
import JumpSection from "./JumpSection";
import ChapterManagementPage from "../../pages/ChapterManagementPage";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useSaveManager } from "../../hooks/useSaveManager";

// 2. รับ Props ทั้งหมดที่ส่งมาจากไฟล์แม่ใหญ่ (ChapterManagementPage)
const WorkspaceContainer = ({
  currentChapter,
  blocks,
  onAddBlock,
  handleUpdateBlock,
  handleDeleteBlock,
  handleMoveBlock,
  focusedBlockId,
  setFocusedBlockId,
  inputRef,
  allChapters,
  assets,
  setIsDataChanged,
  activeChapterId,
  workspace,
  handleSaveAll,
  isSaving,
  updateConfig,
}) => {
  const characterList = workspace?.start_characters || [];

  const currentBlocks = blocks || [];

  const dialogueBlocks = currentBlocks.filter((b) => b.type === "dialogue");
  const mappedDialogueOptions = dialogueBlocks.map((block, index) => {
    // ตัดข้อความบทสนทนาสั้น ๆ เพื่อเอาไปโชว์ใน Dropdown (ไม่ให้ยาวล้นจอ)
    const currentContent = block.content || block.text;
    const shortText = currentContent
      ? currentContent.length > 20
        ? currentContent.substring(0, 20) + "..."
        : currentContent
      : "(บล็อกว่างเปล่า)";

    return {
      id: block.id,
      // รูปแบบการแสดงผล: "บล็อกที่ 1: [ชื่อตัวละคร] ข้อความ..."
      displayName: `บล็อกที่ ${index + 1}: [${block.character_name || block.character || "ไม่มีชื่อ"}] ${shortText}`,
      pureText: currentContent || "",
    };
  });

  const returnBlockIndex = blocks.findIndex(
    (b) =>
      b.type === "jump" &&
      (b.action_type === "return" || b.jumpType === "return"),
  );

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
            startBg={workspace?.start_bg_asset_id || ""}
            setStartBg={(newBgId) =>
              updateConfig({ start_bg_asset_id: newBgId })
            }
            startMusic={workspace?.start_music_asset_id || ""}
            setStartMusic={(newMusicId) =>
              updateConfig({ start_music_asset_id: newMusicId })
            }
            startChar={workspace?.start_characters || []}
            setStartChar={(newCharsArray) =>
              updateConfig({ start_characters: newCharsArray })
            }
            characterList={workspace?.start_characters || []}
            onCharacterListChange={(updatedList) =>
              updateConfig({ start_characters: updatedList })
            }
            assets={assets}
          />
        </div>

        <div className="border-t border-dashed border-gray-300 my-5"></div>

        {/* 2. พื้นที่กระดานแสดงบล็อกคำสั่ง */}
        <div className="w-full space-y-4 bg-violet-50/30 border border-gray-200  rounded-xl">
          {blocks.length === 0 ? (
            /* กล่องแสดงสถานะเมื่อยังไม่มีบล็อก */
            <div className="border border-dashed border-purple-200 bg-purple-50/30 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 text-xs py-20 w-full">
              <p className="font-semibold text-purple-950 mb-2.5">
                {currentChapter
                  ? `กำลังทำงาน: บท "${currentChapter.name}"`
                  : "กรุณาเลือกบทเพื่อเริ่มทำงาน..."}
              </p>
              <p className="text-xs text-gray-600 tracking-wider mb-5">
                พื้นที่ตรงนี้ว่างอยู่
                เลือกประเภทบล็อกด้านล่างเพื่อเริ่มต้นสร้างเนื้อเรื่องได้ทันทีครับ
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => onAddBlock("dialogue")}
                  className="flex items-center space-x-1.5 bg-white text-slate-700 font-medium border border-slate-200 shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <span>💬 บทพูด</span>
                </button>
                <button
                  onClick={() => onAddBlock("sprite")}
                  className="flex items-center space-x-1.5 bg-white text-slate-700 font-medium border border-slate-200 shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <span>🧑‍🤝‍🧑ตัวละคร</span>
                </button>
              </div>
            </div>
          ) : (
            /* วนลูปโชว์บล็อกบทพูด */
            <div className="w-full space-y-3">
              {currentBlocks.map((block, index) => {
                const isGhosted =
                  returnBlockIndex !== -1 && index > returnBlockIndex;
                const currentBlockNumber = index + 1;
                if (block.type === "dialogue") {
                  return (
                    <DialogueSection
                      key={block.id}
                      id={block.id}
                      character={block.character}
                      expression={block.expression}
                      text={block.text}
                      characterList={workspace?.start_characters || []}
                      block={block}
                      index={index}
                      onMoveUp={() => handleMoveBlock(index, "up")}
                      onMoveDown={() => handleMoveBlock(index, "down")}
                      isFirst={index === 0}
                      isLast={index === currentBlocks.length - 1}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกบทพูดด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      isGhosted={isGhosted}
                      assets={assets}
                      selected_asset_id={block.selected_asset_id}
                      sprite_tag={block.sprite_tag}
                      blockNumber={currentBlockNumber}
                      spriteposition={block.spriteposition}
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
                      index={index}
                      onMoveUp={() => handleMoveBlock(index, "up")}
                      onMoveDown={() => handleMoveBlock(index, "down")}
                      isFirst={index === 0}
                      isLast={index === currentBlocks.length - 1}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      assets={assets}
                      isGhosted={isGhosted}
                      blockNumber={currentBlockNumber}
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
                      index={index}
                      onMoveUp={() => handleMoveBlock(index, "up")}
                      onMoveDown={() => handleMoveBlock(index, "down")}
                      isFirst={index === 0}
                      isLast={index === currentBlocks.length - 1}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      assets={assets}
                      isGhosted={isGhosted}
                      blockNumber={currentBlockNumber}
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
                      index={index}
                      onMoveUp={() => handleMoveBlock(index, "up")}
                      onMoveDown={() => handleMoveBlock(index, "down")}
                      isFirst={index === 0}
                      isLast={index === currentBlocks.length - 1}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      focusedBlockId={focusedBlockId}
                      setFocusedBlockId={setFocusedBlockId}
                      assets={assets}
                      isGhosted={isGhosted}
                      blockNumber={currentBlockNumber}
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
                      index={index}
                      onMoveUp={() => handleMoveBlock(index, "up")}
                      onMoveDown={() => handleMoveBlock(index, "down")}
                      isFirst={index === 0}
                      isLast={index === currentBlocks.length - 1}
                      handleDeleteBlock={handleDeleteBlock}
                      onAddBlock={onAddBlock} // ส่งฟังก์ชันเพิ่มบล็อกลงไปที่แต่ละบล็อกฉากด้วย
                      handleUpdateBlock={handleUpdateBlock}
                      allchapter={allChapters}
                      currentChapterBlocks={mappedDialogueOptions}
                      isGhosted={isGhosted}
                      characterList={workspace?.start_characters || []}
                      blockNumber={currentBlockNumber}
                    />
                  );
                }

                if (block.type === "jump") {
                  return (
                    <JumpSection
                      key={block.id}
                      id={block.id}
                      index={index}
                      onMoveUp={() => handleMoveBlock(index, "up")}
                      onMoveDown={() => handleMoveBlock(index, "down")}
                      isFirst={index === 0}
                      isLast={index === currentBlocks.length - 1}
                      target_chapter_id={block.target_chapter_id}
                      action_type={block.action_type} // ดึงค่า Flatten State จากตัวบล็อกตรง ๆ
                      chapterList={allChapters} // ส่งรายชื่อ Chapter ทั้งหมดเข้าไปตามที่คุณใช้ใน Choice
                      handleUpdateBlock={handleUpdateBlock}
                      handleDeleteBlock={handleDeleteBlock}
                      isGhosted={isGhosted}
                      blockNumber={currentBlockNumber}
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

      <div className="p-5 w-full flex-none -mt-10">
        {returnBlockIndex === -1 ? (
          // สถานะปกติ: แสดง Toolbar ปุ่มกดเพิ่มบล็อก
          <WorkspaceToolbar onAddBlock={onAddBlock} />
        ) : (
          // สถานะติด Return: พ่นแถบแจ้งเตือนสีแดงล็อกการกดเพิ่มเนื้อเรื่องต่อท้าย
          <div className="text-red-500 font-sans text-sm p-3 bg-red-50 border border-red-200 rounded-xl text-center flex items-center justify-center gap-2 select-none font-bold shadow-sm animate-pulse">
            🚨
            ไม่สามารถเพิ่มบล็อกเนื้อเรื่องต่อได้เนื่องจากการสิ้นสุดเนื้อเรื่องด้านบนแล้ว
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceContainer;
