import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";

const ChoiceSection = ({
  id,
  choice, // คาดหวังให้เป็น Array เช่น [{ id: 1, text: "", target: "" }]
  handleUpdateBlock,
  handleDeleteBlock,
  focusedBlockId,
  allchapter,
  currentChapterBlocks = [],
  // เพิ่ม Mock Data สำหรับค้นหาฉากย่อย (สามารถส่งผ่าน Props เข้ามาแทนได้)
  /*allScenes = [
    { id: "scene-0", name: "chapter นี้" },
    { id: "scene-1", name: "Chapter 10" },
    { id: "scene-2", name: "Chapter 5000" },
    { id: "scene-3", name: "Chapter 20 - Scene 1" },
    { id: "scene-4", name: "Chapter 30 - Scene 2" },
  ],*/
  isGhosted,
  characterList,
}) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const dialogueInputsRef = useRef({});
  const [lastAddedDialogueId, setLastAddedDialogueId] = useState(null);
  // กรองบล็อกพูด พร้อมใส่เลขลำดับกำกับแบบคนเขียน Ren'Py
  const dialogueBlocks = currentChapterBlocks
    .filter((b) => b.type === "dialogue")
    .map((b, index) => ({
      ...b,
      blockNumber: index + 1, // เก็บเลขลำดับไว้ (เช่น บล็อกที่ 1, บล็อกที่ 2)
    }));

  // Auto-focus เมื่อ Block นี้ถูกเลือก
  // เปลี่ยนจากของเดิมที่เคยมี เป็นอันนี้ครับ
  useEffect(() => {
    if (id === focusedBlockId) {
      // ใช้ setTimeout เพื่อดีเลย์ให้ DOM โหลดเสร็จก่อน
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50); // 50ms เพียงพอที่จะทำให้ React วาด Component เสร็จและ Cursor เด้งไปที่ช่องพิมพ์ครับ

      return () => clearTimeout(timer);
    }
  }, [focusedBlockId, id]);

  // ปิด Dropdown เมื่อคลิกพื้นที่อื่นข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (lastAddedDialogueId && dialogueInputsRef.current[lastAddedDialogueId]) {
      dialogueInputsRef.current[lastAddedDialogueId].focus();
      setLastAddedDialogueId(null); // โฟกัสแล้วล้างค่ารอรอบถัดไป
    }
  }, [lastAddedDialogueId]);

  // State สำหรับควบคุมการเปิด/ปิด Dropdown ค้นหา และคำค้นหาของแต่ละ Choice
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // ตรวจสอบข้อมูล choice หากยังไม่มีให้สร้างตัวเลือกที่ 1 เป็นค่าเริ่มต้น
  const choicesList =
    Array.isArray(choice) && choice.length > 0
      ? choice
      : [{ id: Date.now().toString(), text: "", target: "" }];

  // ฟังก์ชันเพิ่มตัวเลือกใหม่
  const handleAddChoice = () => {
    const newChoice = {
      id: Date.now().toString(),
      text: "",
      dialoguesList: [{ id: Date.now() + 1, text: "" }],
      target_destination: {
        // 🌟 เปลี่ยนโครงสร้างเป้าหมายให้เป็น Object
        type: "SAME_CHAPTER",
        chapter_id: "",
        block_id: "",
      },
    };
    handleUpdateBlock(id, "choice", [...choicesList, newChoice]);
  };

  // ฟังก์ชันอัปเดตข้อความหรือเส้นทางของแต่ละตัวเลือก
  const handleChoiceChange = (choiceId, field, value) => {
    const updatedChoices = choicesList.map((c) =>
      c.id === choiceId ? { ...c, [field]: value } : c,
    );
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  // 2. ซ่อมฟังก์ชันที่พัง: ปิดปีกกาและ Return ค่าให้เรียบร้อย (ตามรูปภาพที่ 2)
  const handleDestinationChange = (choiceId, field, value) => {
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceId) {
        const currentDest = c.target_destination || {
          type: "SAME_CHAPTER",
          chapter_id: "",
          block_id: "",
        };
        let updatedDest = { ...currentDest, [field]: value };

        // Logic เคลียร์ค่า
        if (field === "type" && value === "NEW_CHAPTER") {
          updatedDest.block_id = "";
        } else if (field === "type" && value === "SAME_CHAPTER") {
          updatedDest.chapter_id = "";
        }

        return { ...c, target_destination: updatedDest };
      }
      return c;
    });
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  // ฟังก์ชันลบตัวเลือกย่อย
  const handleRemoveChoice = (choiceId) => {
    const updatedChoices = choicesList.filter((c) => c.id !== choiceId);
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  // Logic กรองรายชื่อฉากตามคำค้นหาที่พิมพ์เข้าไป
  const filteredScenes = allchapter.filter((scene) =>
    scene.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ฟังก์ชันจัดการบทสนทนาย่อยภายในช้อยส์
  const handleAddDialogueItem = (choiceId) => {
    const newDialogueId = Date.now();
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceId) {
        const currentDialogues = c.dialoguesList || [];
        return {
          ...c,
          dialoguesList: [...currentDialogues, { id: newDialogueId, text: "" }],
        };
      }
      return c;
    });
    setLastAddedDialogueId(newDialogueId);
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  const handleRemoveDialogueItem = (choiceId, dialogueId) => {
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceId) {
        return {
          ...c,
          dialoguesList: (c.dialoguesList || []).filter(
            (d) => d.id !== dialogueId,
          ),
        };
      }
      return c;
    });
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  const handleDialogueTextChange = (choiceId, dialogueId, value) => {
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceId) {
        return {
          ...c,
          dialoguesList: (c.dialoguesList || []).map((d) =>
            d.id === dialogueId ? { ...d, text: value } : d,
          ),
        };
      }
      return c;
    });
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  const handleUpdateChoiceDialogue = (choiceItemId, dialogueId, key, value) => {
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceItemId) {
        return {
          ...c,
          dialoguesList: (c.dialoguesList || []).map((d) => {
            if (d.id !== dialogueId) return d;
            return { ...d, [key]: value }; // อัปเดตตัวแปรตาม key (เช่น "character")
          }),
        };
      }
      return c;
    });

    // ใช้ฟังก์ชันส่วนกลางของบล็อกในการบันทึกข้อมูลกลับไปที่ Parent Component
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  return (
    <div className="relative flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-gray-400 tracking-wider">
          ช่องช้อยส์ตัวเลือก
        </label>

        {/* ปุ่มลบ Block (อ้างอิงไอคอนและสไตล์จาก AudioSection) */}
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
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          ลบ
        </button>
      </div>

      {/* ส่วนแสดงรายการตัวเลือก */}
      <div className="flex flex-col gap-6">
        {choicesList.map((item, index) => {
          // ดึงข้อมูลชื่อฉากที่ตรงกับ id ใน item.target มาแสดงผล
          const currentScene = allchapter.find((s) => s.id === item.target);
          const displayLabel =
            item.target === "same-chapter"
              ? "ไม่เปลี่ยน chapter (อยู่ chapter เดิม)"
              : currentScene
                ? currentScene.name
                : "";

          return (
            <div key={item.id} className="flex flex-col gap-2">
              {/* บรรทัดที่ 1: พิมพ์ข้อความตัวเลือก */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 tracking-wider w-25">
                  ตัวเลือกที่ {index + 1}:
                </span>
                <input
                  ref={index === 0 ? inputRef : null}
                  type="text"
                  value={item.text || ""}
                  onChange={(e) =>
                    handleChoiceChange(item.id, "text", e.target.value)
                  }
                  placeholder="[ พิมพ์ข้อความตัวเลือกตรงนี้... ]"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans"
                />

                {/* ปุ่มลบตัวเลือกย่อย (แสดงเมื่อมีมากกว่า 1 ตัวเลือก) */}
                {choicesList.length > 1 && (
                  <button
                    onClick={() => handleRemoveChoice(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    title="ลบตัวเลือกนี้"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-2 w-full">
                {(
                  item.dialoguesList || [{ id: item.id + "_d1", text: "" }]
                ).map((dialogueItem, dIndex) => (
                  <div
                    key={dialogueItem.id}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm font-medium text-gray-400 min-w-17.5 whitespace-nowrap text-right pr-1">
                      บทสนทนา {dIndex + 1} :
                    </span>
                    <select
                      value={dialogueItem.character || ""} // ผูกค่า character ของบทสนทนานั้นๆ
                      onChange={(e) =>
                        handleUpdateChoiceDialogue(
                          item.id,
                          dialogueItem.id,
                          "character",
                          e.target.value,
                        )
                      }
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm min-w-35"
                    >
                      <option value="">(ไม่มีตัวละครพูด)</option>
                      {characterList &&
                        characterList.map((char, index) => (
                          <option key={index} value={char}>
                            {char}
                          </option>
                        ))}
                    </select>
                    <input
                      ref={(el) => {
                        if (el) dialogueInputsRef.current[dialogueItem.id] = el;
                      }}
                      type="text"
                      placeholder="พิมพ์บทสนทนาที่คำตอบจะต่างไป..."
                      value={dialogueItem.text || ""}
                      onChange={(e) =>
                        handleDialogueTextChange(
                          item.id,
                          dialogueItem.id,
                          e.target.value,
                        )
                      }
                      className="w-full bg-white text-gray-700 placeholder-gray-300 text-xs md:text-sm border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={() =>
                        handleRemoveDialogueItem(item.id, dialogueItem.id)
                      }
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      title="ลบตัวเลือกนี้"
                    >
                      {/* ไอคอนกากบาท (X) เรียบง่าย */}
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {/* ปุ่มสำหรับกดเพิ่มช่องบทสนทนาในตัวเลือกนี้โดยเฉพาะ */}
                <div className="flex justify-start pl-18">
                  <button
                    onClick={() => handleAddDialogueItem(item.id)}
                    className="flex items-center gap-1 text-xs font-medium text-purple-500 hover:text-purple-600 transition-colors py-1 px-2 rounded border border-dashed border-purple-200 bg-purple-50/30"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    เพิ่มบทสนทนาเฉพาะช้อยส์นี้
                  </button>
                </div>
              </div>

              {/* บรรทัดที่ 2: เลือกเส้นทางฉากย่อย */}
              <div
                className="flex items-center gap-3 pl-4 sm:pl-23 relative"
                ref={openDropdownId === item.id ? dropdownRef : null}
              >
                <span className="text-gray-400 font-bold">↳</span>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  เส้นทางเนื้อเรื่องที่จะไป:
                </span>
                <div className="flex-1 flex gap-2">
                  {/* Dropdown 1: เลือกรูปแบบการกระโดด */}
                  <select
                    value={item.target_destination?.type || "SAME_CHAPTER"}
                    onChange={(e) =>
                      handleDestinationChange(item.id, "type", e.target.value)
                    }
                    className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer text-gray-600"
                  >
                    <option value="SAME_CHAPTER">
                      🔄 ไม่เปลี่ยน chapter (อยู่ chapter เดิม)
                    </option>
                    <option value="NEW_CHAPTER">
                      ⏩ เปลี่ยน Chapter (Jump ข้ามบท)
                    </option>
                  </select>

                  {/* Dropdown 2: เด้งเปลี่ยนไปตามเงื่อนไขของ Dropdown 1 */}
                  {item.target_destination?.type === "NEW_CHAPTER" ? (
                    <div className="w-1/2">
                      <Select
                        // 1. แปลงข้อมูลจาก allchapter ให้เป็นรูปแบบ { value, label }
                        options={allchapter.map((ch) => ({
                          value: ch.id,
                          label: ch.name,
                        }))}
                        // 2. กำหนดค่าปัจจุบันที่ถูกเลือก
                        value={
                          item.target_destination?.chapter_id
                            ? {
                                value: item.target_destination.chapter_id,
                                label:
                                  allchapter.find(
                                    (ch) =>
                                      ch.id ===
                                      item.target_destination.chapter_id,
                                  )?.name || "",
                              }
                            : null
                        }
                        // 3. จัดการตอนเปลี่ยนค่า (ล้อตามโครงสร้าง handleDestinationChange เดิม)
                        onChange={(selectedOption) => {
                          handleDestinationChange(
                            item.id,
                            "chapter_id",
                            selectedOption ? selectedOption.value : "",
                          );
                        }}
                        // 4. การตั้งค่าเพิ่มเติมอื่นๆ
                        placeholder="-- เลือกบทปลายทาง --"
                        isClearable={true} // เพิ่มปุ่มกากบาทเพื่อล้างค่าได้ (ถ้าต้องการ)
                        isSearchable={true} // เปิดใช้งานการค้นหา
                        // 5. ปรับแต่งสไตล์ให้ใกล้เคียงกับ Tailwind ของเดิม
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: state.isFocused
                              ? "#a855f7"
                              : "#e5e7eb", // focus:border-purple-500 และ border-gray-200
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: state.isFocused
                                ? "#a855f7"
                                : "#d1d5db",
                            },
                            borderRadius: "0.5rem", // rounded-lg
                            paddingTop: "2px", // ปรับระดับความสูง px-3 py-2 ให้ใกล้เคียงของเดิม
                            paddingBottom: "2px",
                          }),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 gap-4">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {" <--- เนื้อเรื่องจะเชื่อมกับบล้อกถัดไปในบทนี้ "}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ส่วนปุ่มเพิ่มตัวเลือกใหม่ */}
      <div className="pt-2 pl-1">
        <button
          onClick={handleAddChoice}
          className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-2"
        >
          [ + เพิ่มตัวเลือกใหม่ ]
        </button>
      </div>
      <div ref={inputRef}></div>
      <div ref={inputRef} tabIndex="0"></div>
    </div>
  );
};

export default ChoiceSection;
