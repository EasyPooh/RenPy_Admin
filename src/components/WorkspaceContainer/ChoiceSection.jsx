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
  isGhosted,
  blockNumber,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
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
      blockNumber: index + 1,
    }));

  // Auto-focus เมื่อ Block นี้ถูกเลือก
  useEffect(() => {
    if (id === focusedBlockId) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [focusedBlockId, id, isGhosted]);

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
      setLastAddedDialogueId(null);
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

  const handleDestinationChange = (choiceId, field, value) => {
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceId) {
        const currentDest = c.target_destination || {
          type: "SAME_CHAPTER",
          chapter_id: "",
          block_id: "",
        };
        let updatedDest = { ...currentDest, [field]: value };

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

  // Logic จัดการบทสนทนาย่อยภายในช้อยส์
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
        // 🟢 ดึงข้อมูลชุดปัจจุบันมาตั้งต้นก่อนลบ
        const currentDialogues =
          c.dialoguesList && c.dialoguesList.length > 0
            ? c.dialoguesList
            : [{ id: `${choiceId}_d1`, text: "", character: "" }];

        return {
          ...c,
          dialoguesList: currentDialogues.filter((d) => d.id !== dialogueId),
        };
      }
      return c;
    });
    handleUpdateBlock(id, "choice", updatedChoices);
  };

  const handleDialogueTextChange = (choiceId, dialogueId, value) => {
    const updatedChoices = choicesList.map((c) => {
      if (c.id === choiceId) {
        // 🟢 ดึงข้อมูลชุดปัจจุบัน ถ้ายังไม่มี ให้ใช้อาร์เรย์เริ่มต้นก่อน
        const currentDialogues =
          c.dialoguesList && c.dialoguesList.length > 0
            ? c.dialoguesList
            : [{ id: `${choiceId}_d1`, text: "", character: "" }];

        return {
          ...c,
          dialoguesList: currentDialogues.map((d) =>
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
        // 🟢 เช็กว่าถ้า dialoguesList ยังไม่มี หรือเป็นอาร์เรย์ว่าง ให้สร้างตัวเริ่มต้นไว้ก่อน (ID ต้องตรงกับใน UI)
        const currentDialogues =
          c.dialoguesList && c.dialoguesList.length > 0
            ? c.dialoguesList
            : [{ id: `${choiceItemId}_d1`, text: "", character: "" }];

        return {
          ...c,
          dialoguesList: currentDialogues.map((d) => {
            if (d.id !== dialogueId) return d;
            return { ...d, [key]: value };
          }),
        };
      }
      return c;
    });

    handleUpdateBlock(id, "choice", updatedChoices);
  };

  // 🎨 1. ชุดแต่งสไตล์ของช่องค้นหาตัวละคร (คุมธีมขอบม่วง ความสูงเท่าช่องพิมพ์)
  const characterSelectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#a855f7" : "#e5e7eb",
      boxShadow: "none",
      "&:hover": {
        borderColor: state.isFocused ? "#a855f7" : "#d1d5db",
      },
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      fontFamily: "sans-serif",
      height: "38px",
      minHeight: "38px",
    }),
    valueContainer: (baseStyles) => ({
      ...baseStyles,
      padding: "0 8px",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
      zIndex: 50,
    }),
    menuPortal: (baseStyles) => ({
      ...baseStyles,
      zIndex: 9999,
    }),
  };

  // 👥 2. แปลงรายชื่อตัวละครเป็นโครงสร้าง Option ของ react-select โดยมีช้อยส์ว่างรองรับไว้ตัวแรกเสมอ
  const characterOptions = [
    { value: "", label: "(ไม่มีตัวละครพูด)" },
    ...(characterList || []).map((char) => ({
      value: char,
      label: char,
    })),
  ];

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 border rounded-xl mb-3 transition-all ${
        isGhosted
          ? "opacity-40 pointer-events-none select-none bg-gray-100 border-gray-300"
          : "bg-cyan-50 text-cyan-700 border-cyan-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-black-400 tracking-wider">
            #{blockNumber} 🔀 ช่องช้อยส์ตัวเลือก
          </label>
          {isGhosted && (
            <span className="text-xs text-red-500 font-bold animate-pulse">
              🚨 บล็อกนี้จะไม่ทำงานในเกม (อยู่หลังจุดสิ้นสุดเนื้อเรื่อง)
            </span>
          )}
        </div>

        {!isGhosted && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-black-400 tracking-wider">
              เลื่อนบล็อก
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={isFirst}
                title="เลื่อนบล็อกขึ้น"
                className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-200" />
              <button
                type="button"
                onClick={onMoveDown}
                disabled={isLast}
                title="เลื่อนบล็อกลง"
                className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={() => handleDeleteBlock(id)}
              className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              ลบ
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {choicesList.map((item, index) => {
          return (
            <div key={item.id} className="flex flex-col gap-2">
              {/* บรรทัดที่ 1: พิมพ์ข้อความตัวเลือก */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 tracking-wider w-25 shrink-0">
                  ตัวเลือก {index + 1}
                </span>
                <input
                  ref={index === 0 ? inputRef : null}
                  type="text"
                  value={item.text || ""}
                  disabled={isGhosted}
                  onChange={(e) =>
                    handleChoiceChange(item.id, "text", e.target.value)
                  }
                  placeholder="[ พิมพ์ข้อความตัวเลือกตรงนี้... ]"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans h-9.5"
                />

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

              {/* บรรทัดย่อย: จัดการบทสนทนาภายในช้อยส์ */}
              <div className="flex flex-col gap-2 mt-2 w-full">
                {/* 🟢 ปรับตรงนี้: ถ้าลบจนเหลือ [] ก็ให้วนลูป 0 รอบ (ไม่แสดงแถบเลย) */}
                {(item.dialoguesList || []).map((dialogueItem, dIndex) => {
                  // 🎯 ค้นหาตัวเลือกตัวละครในปัจจุบันเพื่อผูกค่าเข้ากับ react-select
                  const currentCharacterOption = characterOptions.find(
                    (opt) => opt.value === (dialogueItem.character || ""),
                  ) || { value: "", label: "(ไม่มีตัวละครพูด)" };

                  return (
                    <div
                      key={dialogueItem.id}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs font-bold text-gray-400 tracking-wider w-25 shrink-0">
                        คำพูดตอบรับ {index + 1}.{dIndex + 1}
                      </span>

                      {/* 🎯 Dropdown เลือกตัวละคร */}
                      <div className="min-w-44 text-gray-700 font-sans">
                        <Select
                          options={characterOptions}
                          value={currentCharacterOption}
                          isDisabled={isGhosted}
                          onChange={(selectedOption) => {
                            handleUpdateChoiceDialogue(
                              item.id,
                              dialogueItem.id,
                              "character",
                              selectedOption ? selectedOption.value : "",
                            );
                          }}
                          placeholder="(เลือกตัวละคร)"
                          isSearchable={true}
                          isClearable={false}
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          styles={characterSelectStyles}
                        />
                      </div>

                      {/* Input พิมพ์บทสนทนา */}
                      <input
                        ref={(el) => {
                          if (el)
                            dialogueInputsRef.current[dialogueItem.id] = el;
                        }}
                        type="text"
                        placeholder="พิมพ์คำพูดที่จะแสดงทันทีหลังผู้เล่นกดช้อยส์นี้ (เช่น อ๋อ เรื่องนั้นเองเหรอ...)"
                        value={dialogueItem.text || ""}
                        disabled={isGhosted}
                        onChange={(e) =>
                          handleDialogueTextChange(
                            item.id,
                            dialogueItem.id,
                            e.target.value, // 🟢 แก้ไข: ตัดเงื่อนไข String "e.target.value" ออก ให้ส่ง e.target.value ได้เลย
                          )
                        }
                        className="w-full bg-white text-gray-700 placeholder-gray-300 text-xs md:text-sm border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400 h-9.5"
                      />

                      <button
                        onClick={() =>
                          handleRemoveDialogueItem(item.id, dialogueItem.id)
                        }
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all shrink-0"
                        title="ลบตัวเลือกนี้"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}

                {/* ปรับ wrapper: เพิ่ม mt-3 mb-4 เพื่อเว้นบรรทัดให้หายใจโล่งขึ้น 
    และใช้ pl-56 หรือปรับตัวเลข px ให้ตรงกับขอบกล่องข้อความด้านบน */}
                <div className="flex justify-start pl-27 mt-2.5 mb-3.5">
                  <button
                    onClick={() => handleAddDialogueItem(item.id)}
                    disabled={isGhosted}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50/50 hover:bg-purple-100/70 border border-purple-100 rounded-lg py-1.5 px-3 transition-all shadow-sm disabled:opacity-40"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    เพิ่มคำพูดตอบรับหลังกดช้อยส์นี้
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
                  <select
                    value={item.target_destination?.type || "SAME_CHAPTER"}
                    disabled={isGhosted}
                    onChange={(e) =>
                      handleDestinationChange(item.id, "type", e.target.value)
                    }
                    className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer text-gray-600 h-9.5"
                  >
                    <option value="SAME_CHAPTER">
                      🔄 ไม่เปลี่ยน chapter (อยู่ chapter เดิม)
                    </option>
                    <option value="NEW_CHAPTER">
                      ⏩ เปลี่ยน Chapter (Jump ข้ามบท)
                    </option>
                  </select>

                  {item.target_destination?.type === "NEW_CHAPTER" ? (
                    <div className="w-1/2">
                      <Select
                        options={allchapter.map((ch) => ({
                          value: ch.id,
                          label: ch.name,
                        }))}
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
                        onChange={(selectedOption) => {
                          handleDestinationChange(
                            item.id,
                            "chapter_id",
                            selectedOption ? selectedOption.value : "",
                          );
                        }}
                        placeholder="-- เลือกบทปลายทาง --"
                        isClearable={true}
                        isSearchable={true}
                        filterOption={(option, rawInput) => {
                          const labelText = option.label
                            ? String(option.label).toLowerCase()
                            : "";
                          const searchInput = rawInput
                            ? String(rawInput).toLowerCase()
                            : "";
                          return labelText.includes(searchInput);
                        }}
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: state.isFocused
                              ? "#a855f7"
                              : "#e5e7eb",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: state.isFocused
                                ? "#a855f7"
                                : "#d1d5db",
                            },
                            borderRadius: "0.5rem",
                            height: "38px",
                            minHeight: "38px",
                          }),
                          valueContainer: (baseStyles) => ({
                            ...baseStyles,
                            padding: "0 8px",
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

      <div className="pt-2 pl-1">
        <button
          onClick={handleAddChoice}
          className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-2"
        >
          [ + เพิ่มตัวเลือกใหม่ ]
        </button>
      </div>
      <div ref={inputRef} tabIndex="0"></div>
    </div>
  );
};

export default ChoiceSection;
