import React, { useState, useRef, useEffect } from "react";

// ========================================================
// RECURSIVE TIMELINE NODE (Component ย่อยสำหรับรองรับมิติความลึกซ้อนชั้น)
// ========================================================
function TimelineNode({
  node,
  index,
  path,
  characters,
  onUpdateNode,
  onDeleteNode,
  onInsertNodeAfter,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // สั่ง Auto-Focus อัตโนมัติเมื่อ Node ตัวนี้เพิ่งถูกสร้างขึ้นมาใหม่ในระบบ
  useEffect(() => {
    if (node.isNew && textareaRef.current) {
      textareaRef.current.focus();
      // ลบ flag ออกเพื่อไม่ให้สับสนตอน Re-render รอบถัดไป
      onUpdateNode(path, { ...node, isNew: false });
    }
  }, [node.isNew]);

  // จัดการกดปุ่มทางลัด Keyboard Shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // ป้องกันการขึ้นบรรทัดใหม่ในกล่องเดิม
      onInsertNodeAfter(path);
    }
  };

  if (node.type === "dialogue") {
    // เช็กสถานะการใช้งานคิวเอฟเฟกต์ต่าง ๆ เพื่อทำเป็นป้าย Active Status จางๆ
    const hasBG = !!node.actions?.bg;
    const hasBGM = !!node.actions?.bgm;
    const hasSFX = !!node.actions?.sfx;

    return (
      <div
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
        className={`border-2 rounded-2xl p-4 bg-white transition-all duration-200 relative group
          ${isFocused ? "border-slate-800 shadow-md" : "border-slate-200 shadow-2xs"}
        `}
      >
        {/* ปุ่มกากบาทลบ Node บทพูดออกจากแถวไทม์ไลน์ */}
        <button
          onClick={() => onDeleteNode(path)}
          className="absolute top-3 right-3 text-slate-300 hover:text-red-500 text-xs transition-colors"
        >
          ✕
        </button>

        {/* 🛠️ INLINE TOOLBAR (จะ Slide / Fade ออกมาเมื่อ Hover หรือ Focus อยู่เท่านั้น) */}
        <div
          className={`absolute -top-3.5 right-10 flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm px-2 py-0.5 rounded-xl transition-all duration-200 z-10
          ${isFocused || node.actions?.bg || node.actions?.bgm || node.actions?.sfx ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
        >
          {/* ปุ่มเครื่องมือฉากหลัง */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => {
                const img = prompt(
                  "กรอกชื่อไฟล์รูปพื้นหลัง (เช่น bg_park.jpg):",
                  node.actions?.bg || "",
                );
                if (img !== null)
                  onUpdateNode(path, {
                    ...node,
                    actions: { ...node.actions, bg: img },
                  });
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${hasBG ? "bg-amber-100 text-amber-700" : "bg-slate-50 hover:bg-slate-100 text-slate-400"}`}
            >
              +🌅 BG
            </button>
            {hasBG && (
              <span className="text-[10px] text-amber-600 font-mono max-w-[80px] truncate">
                {node.actions.bg}
              </span>
            )}
          </div>

          <div className="w-px h-3 bg-slate-200" />

          {/* ปุ่มเครื่องมือเพลงคลอ */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => {
                const track = prompt(
                  "กรอกชื่อไฟล์เพลง BGM:",
                  node.actions?.bgm || "",
                );
                if (track !== null)
                  onUpdateNode(path, {
                    ...node,
                    actions: { ...node.actions, bgm: track },
                  });
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${hasBGM ? "bg-blue-100 text-blue-700" : "bg-slate-50 hover:bg-slate-100 text-slate-400"}`}
            >
              +🎵 BGM
            </button>
            {hasBGM && (
              <span className="text-[10px] text-blue-600 font-mono max-w-[80px] truncate">
                {node.actions.bgm}
              </span>
            )}
          </div>

          <div className="w-px h-3 bg-slate-200" />

          {/* ปุ่มเครื่องมือเอฟเฟกต์เสียง */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => {
                const sound = prompt(
                  "กรอกชื่อไฟล์เสียง SFX:",
                  node.actions?.sfx || "",
                );
                if (sound !== null)
                  onUpdateNode(path, {
                    ...node,
                    actions: { ...node.actions, sfx: sound },
                  });
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${hasSFX ? "bg-purple-100 text-purple-700" : "bg-slate-50 hover:bg-slate-100 text-slate-400"}`}
            >
              +⚡ SFX
            </button>
            {hasSFX && (
              <span className="text-[10px] text-purple-600 font-mono max-w-[80px] truncate">
                {node.actions.sfx}
              </span>
            )}
          </div>

          <div className="w-px h-3 bg-slate-200" />

          {/* ปุ่มกางระเบิดปุ่มชอยส์ในโน้ตตัวนี้ */}
          <button
            onClick={() => {
              onUpdateNode(path, {
                id: node.id,
                type: "choice_block",
                choices: [
                  {
                    id: String(Date.now()),
                    text: "ตัวเลือกที่ 1",
                    mode: "inline",
                    targetChapterId: "",
                    isCollapsed: false,
                    subTimeline: [],
                  },
                ],
              });
            }}
            className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md text-[11px] font-bold"
          >
            +🟢 Choice
          </button>
        </div>

        {/* แถวข้อมูลผู้พูดและส่วนประกอบหน้าตา */}
        <div className="flex items-center gap-2 mb-2">
          <select
            value={node.speaker || ""}
            onChange={(e) =>
              onUpdateNode(path, { ...node, speaker: e.target.value })
            }
            className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none min-w-[90px] text-center cursor-pointer"
          >
            <option value="">(ตัวละครบรรยาย)</option>
            {characters.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={node.expression || ""}
            onChange={(e) =>
              onUpdateNode(path, { ...node, expression: e.target.value })
            }
            placeholder="อารมณ์: ยิ้ม, โกรธ..."
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-500 focus:outline-none focus:border-slate-400 w-32"
          />
        </div>

        {/* ช่องพิมพ์กล่องบทละครหลัก */}
        <textarea
          ref={textareaRef}
          rows="2"
          value={node.text || ""}
          onChange={(e) =>
            onUpdateNode(path, { ...node, text: e.target.value })
          }
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="พิมพ์บทพูดตรงนี้... [กด Enter เพื่อขึ้นบรรทัดใหม่ทันที / กด Shift+Enter เพื่อขึ้นบรรทัดย่อยด้านใน]"
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed font-normal"
        />
      </div>
    );
  }

  // ========================================================
  // CHOICE BLOCK TYPE COMPONENT (สำหรับเรนเดอร์ชอยส์และ Sub-timeline แตกกิ่ง)
  // ========================================================
  if (node.type === "choice_block") {
    return (
      <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4 relative">
        <button
          onClick={() => onDeleteNode(path)}
          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xs font-bold"
        >
          ✕
        </button>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> 🌿
            เส้นแบ่งทางเลือก (Choice Branches)
          </span>
        </div>

        <div className="space-y-4">
          {node.choices?.map((choice, cIdx) => {
            const isEven = cIdx % 2 === 0;
            return (
              <div key={choice.id} className="space-y-2">
                {/* แถวตั้งค่าตัวเลือกเดี่ยวๆ */}
                <div
                  className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border text-xs shadow-2xs bg-white ${isEven ? "border-emerald-200" : "border-rose-200"}`}
                >
                  {/* ปุ่มพับเปิด/ปิดกล่องชุดเนื้อเรื่องย่อย */}
                  <button
                    onClick={() => {
                      const updatedChoices = node.choices.map((c) =>
                        c.id === choice.id
                          ? { ...c, isCollapsed: !c.isCollapsed }
                          : c,
                      );
                      onUpdateNode(path, { ...node, choices: updatedChoices });
                    }}
                    className="w-5 h-5 flex items-center justify-center font-bold text-slate-400 hover:text-slate-700"
                  >
                    {choice.isCollapsed ? "▶" : "▼"}
                  </button>

                  <span
                    className={`w-2 h-2 rounded-full ${isEven ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  <span className="font-bold text-slate-500">
                    ทางเลือก {cIdx + 1}:
                  </span>

                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => {
                      const updatedChoices = node.choices.map((c) =>
                        c.id === choice.id ? { ...c, text: e.target.value } : c,
                      );
                      onUpdateNode(path, { ...node, choices: updatedChoices });
                    }}
                    placeholder="ข้อความที่จะปรากฏบนปุ่มตัวเลือก..."
                    className="flex-1 bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                  />

                  {/* สวิตช์สลับลอจิกตามจริงของระบบ Visual Novel */}
                  <select
                    value={choice.mode}
                    onChange={(e) => {
                      const updatedChoices = node.choices.map((c) =>
                        c.id === choice.id ? { ...c, mode: e.target.value } : c,
                      );
                      onUpdateNode(path, { ...node, choices: updatedChoices });
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-500 rounded-lg px-2 py-0.5 text-xs focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="inline">
                      [ 📝 เขียนเนื้อเรื่องย่อยต่อในชอยส์นี้ทันที ]
                    </option>
                    <option value="jump">
                      → กระโดดข้ามไปที่ Chapter ID อื่น (Jump)
                    </option>
                  </select>

                  {choice.mode === "jump" ? (
                    <input
                      type="text"
                      value={choice.targetChapterId || ""}
                      onChange={(e) => {
                        const updatedChoices = node.choices.map((c) =>
                          c.id === choice.id
                            ? { ...c, targetChapterId: e.target.value }
                            : c,
                        );
                        onUpdateNode(path, {
                          ...node,
                          choices: updatedChoices,
                        });
                      }}
                      placeholder="เป้าหมาย Chapter ID"
                      className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-xs focus:outline-none"
                    />
                  ) : null}

                  <button
                    onClick={() => {
                      const updatedChoices = node.choices.filter(
                        (c) => c.id !== choice.id,
                      );
                      if (updatedChoices.length === 0) {
                        onDeleteNode(path); // ถ้าไม่มีชอยส์เหลือให้ลบทั้งบล็อกออกเลย
                      } else {
                        onUpdateNode(path, {
                          ...node,
                          choices: updatedChoices,
                        });
                      }
                    }}
                    className="text-slate-300 hover:text-red-500 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* CONTAINER ชุดเนื้อเรื่องย่อยซ้อนเยื้องสไลด์เข้าด้านใน (Nested Indentation Sub-Timeline) */}
                {choice.mode === "inline" && !choice.isCollapsed && (
                  <div
                    className={`pl-6 ml-3 border-l-2 border-dashed relative space-y-3 pt-2 pb-2 rounded-br-xl
                    ${isEven ? "border-emerald-200 bg-emerald-50/10" : "border-rose-200 bg-rose-50/10"}
                  `}
                  >
                    {choice.subTimeline && choice.subTimeline.length > 0 ? (
                      choice.subTimeline.map((subNode, subIdx) => (
                        <TimelineNode
                          key={subNode.id}
                          node={subNode}
                          index={subIdx}
                          path={[
                            ...path,
                            "choices",
                            cIdx,
                            "subTimeline",
                            subIdx,
                          ]}
                          characters={characters}
                          onUpdateNode={onUpdateNode}
                          onDeleteNode={onDeleteNode}
                          onInsertNodeAfter={onInsertNodeAfter}
                        />
                      ))
                    ) : (
                      <div className="text-center py-2 text-xs text-slate-400 italic bg-white/60 border border-dashed rounded-xl">
                        ยังไม่มีบทพูดในชอยส์นี้
                        กดปุ่มด้านล่างเพื่อพิมพ์บทตอบรับย่อย
                      </div>
                    )}

                    {/* ปุ่มเพิ่มบรรทัดย่อยข้างในตัวเลือกนั้นๆ */}
                    <button
                      onClick={() => {
                        const newSubNode = {
                          id: String(Date.now()),
                          type: "dialogue",
                          speaker: "",
                          expression: "",
                          text: "",
                          isNew: true,
                          actions: { bg: "", bgm: "", sfx: "" },
                        };
                        const updatedSubTimeline = [
                          ...(choice.subTimeline || []),
                          newSubNode,
                        ];
                        const updatedChoices = node.choices.map((c) =>
                          c.id === choice.id
                            ? { ...c, subTimeline: updatedSubTimeline }
                            : c,
                        );
                        onUpdateNode(path, {
                          ...node,
                          choices: updatedChoices,
                        });
                      }}
                      className={`w-full py-1.5 rounded-xl border border-dashed text-xs font-semibold transition-all shadow-2xs
                        ${isEven ? "bg-white border-emerald-300 text-emerald-600 hover:bg-emerald-50/50" : "bg-white border-rose-300 text-rose-600 hover:bg-rose-50/50"}
                      `}
                    >
                      + เพิ่มบรรทัดบทพูดในชอยส์นี้
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* ปุ่มกดเพิ่มจำนวนข้อชอยส์ทางเลือกหลัก */}
          <button
            onClick={() => {
              const newChoice = {
                id: String(Date.now()),
                text: `ตัวเลือกที่ ${node.choices.length + 1}`,
                mode: "inline",
                targetChapterId: "",
                isCollapsed: false,
                subTimeline: [],
              };
              onUpdateNode(path, {
                ...node,
                choices: [...node.choices, newChoice],
              });
            }}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-500 rounded-xl py-1 text-xs font-medium transition-colors"
          >
            + เพิ่มชอยส์ทางเลือกขนานใหม่
          </button>

          {/* ========================================================
              [MERGE INDICATOR] ป้ายบอกจุดเชื่อมต่อทางสายตาของเส้นเรื่องไหลรวม
             ======================================================== */}
          <div className="flex flex-col items-center justify-center pt-2 select-none">
            <div className="w-0.5 h-4 border-l border-dashed border-slate-300"></div>
            <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-full px-4 py-0.5 text-[10px] font-bold flex items-center gap-1">
              <span>⤵️</span> เส้นเรื่องรวมกัน — ดำเนินต่อด้านล่าง{" "}
              <span>⤵️</span>
            </div>
            <div className="w-0.5 h-4 border-l border-dashed border-slate-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ========================================================
// CORE EXPORT COMPONENT (บอร์ดแกนกลางหลักในการทำงานทั้งหมด)
// ========================================================
export default function EditorContainer({ selectedChapter, onSaveChapter }) {
  const [newCharInput, setNewCharInput] = useState("");

  if (!selectedChapter) {
    return (
      <div className="flex-1 bg-[#fafafa] flex items-center justify-center text-slate-400 italic">
        โปรดเลือกหรือสร้างฉากจากเมนูด้านซ้ายเพื่อเริ่มเขียนบทละครรันระบบจริง
      </div>
    );
  }

  const background = selectedChapter.background || { location: "", image: "" };
  const audio = selectedChapter.audio || { bgm: "", sfx: "" };
  const characters = selectedChapter.characters || [];
  const timeline = selectedChapter.timeline || [
    {
      id: "init_row",
      type: "dialogue",
      speaker: "",
      expression: "",
      text: "",
      actions: { bg: "", bgm: "", sfx: "" },
    },
  ];

  // ฟังก์ชันกลางส่งออกค่า State กลับขึ้นไปหา Parent Component
  const emitUpdate = (updatedFields) => {
    onSaveChapter({ ...selectedChapter, ...updatedFields });
  };

  // เจาะลึกอัปเดตข้อมูล Node Tree ตาม Path อาร์เรย์แบบ Dynamic Deep Update
  const handleUpdateNodeByPath = (path, updatedNode) => {
    const newTimeline = [...timeline];
    let current = newTimeline;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        current[key] = updatedNode;
      } else {
        current = current[key];
      }
    }
    emitUpdate({ timeline: newTimeline });
  };

  // เจาะลึกฟังก์ชันลบตามพิกัดชั้นความลึก
  const handleDeleteNodeByPath = (path) => {
    const newTimeline = [...timeline];
    let current = newTimeline;

    for (let i = 0; i < path.length - 2; i++) {
      current = current[path[i]];
    }
    const indexToRemove = path[path.length - 1];
    const parentArray =
      path.length === 1 ? newTimeline : current[path[path.length - 2]];
    parentArray.splice(indexToRemove, 1);

    emitUpdate({ timeline: newTimeline });
  };

  // แทรก Node ชุดใหม่หลังกล่องข้อความเดิม (ใช้ควบคู่กับฟังก์ชันตรวจจับปุ่มลัด Enter คีย์บอร์ด)
  const handleInsertNodeAfterByPath = (path) => {
    const newTimeline = [...timeline];
    let current = newTimeline;

    for (let i = 0; i < path.length - 2; i++) {
      current = current[path[i]];
    }

    const indexToInsert = path[path.length - 1];
    const parentArray =
      path.length === 1 ? newTimeline : current[path[path.length - 2]];

    // ดึงชื่อผู้พูดเดิมติดมาให้เพื่อคงความต่อเนื่องในสายงานเขียน
    const prevNode = parentArray[indexToInsert];
    const newNode = {
      id: String(Date.now()),
      type: "dialogue",
      speaker: prevNode?.speaker || "",
      expression: "",
      text: "",
      isNew: true, // ส่งสัญญาณสั่ง Auto Focus ย้าย Cursor ลงมา
      actions: { bg: "", bgm: "", sfx: "" },
    };

    parentArray.splice(indexToInsert + 1, 0, newNode);
    emitUpdate({ timeline: newTimeline });
  };

  return (
    <div className="flex-1 bg-[#fcfcfc] flex flex-col h-full overflow-hidden font-sans antialiased text-slate-700">
      {/* HEADER CONTROL BAR */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-[#f8f9fa] shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-400 font-semibold">
            ID: {selectedChapter.id}
          </div>
          <input
            type="text"
            value={selectedChapter.title || ""}
            onChange={(e) => emitUpdate({ title: e.target.value })}
            className="w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-400 shadow-2xs"
          />
        </div>
        <button
          onClick={() => onSaveChapter(selectedChapter)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold py-1.5 px-4 rounded-lg shadow-sm transition-colors"
        >
          💾 Save Layout Project
        </button>
      </div>

      {/* CORE WORKSPACE SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SECTION 2: GLOBAL Chapter SETUP */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            🎬 ส่วนที่ 2: ตั้งค่าเริ่มต้นของฉาก
          </h3>
          <div className="bg-[#f8f9fa] border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-4 text-xs">
              <label className="text-slate-500 font-semibold w-24">
                🌅 ฉากหลังเริ่มต้น:
              </label>
              <input
                type="text"
                value={background.image}
                onChange={(e) =>
                  emitUpdate({
                    background: { ...background, image: e.target.value },
                  })
                }
                placeholder="bg_room.jpg"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-600 focus:outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <label className="text-slate-500 font-semibold w-24">
                🎵 เพลงคลอเริ่มต้น:
              </label>
              <input
                type="text"
                value={audio.bgm}
                onChange={(e) =>
                  emitUpdate({ audio: { ...audio, bgm: e.target.value } })
                }
                placeholder="bgm_main.mp3"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-600 focus:outline-none font-mono"
              />
            </div>
            <div className="flex items-start gap-4 text-xs">
              <label className="text-slate-500 font-semibold w-24 pt-1.5">
                👥 รายชื่อตัวละคร:
              </label>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                {characters.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 bg-violet-50 text-violet-600 px-2 py-0.5 border border-violet-100 rounded-md font-medium text-[11px]"
                  >
                    {name}{" "}
                    <button
                      onClick={() =>
                        emitUpdate({
                          characters: characters.filter((n) => n !== name),
                        })
                      }
                      className="hover:text-red-500 ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      newCharInput.trim() &&
                      !characters.includes(newCharInput.trim())
                    ) {
                      emitUpdate({
                        characters: [...characters, newCharInput.trim()],
                      });
                      setNewCharInput("");
                    }
                  }}
                  className="inline-flex items-center bg-white border border-slate-200 rounded-md px-1.5 py-0.5"
                >
                  <input
                    type="text"
                    value={newCharInput}
                    onChange={(e) => setNewCharInput(e.target.value)}
                    placeholder="+ เพิ่มชื่อ"
                    className="w-16 focus:outline-none text-[11px]"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: STORY CONTENT TIMELINE WORKSPACE */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            📖 ส่วนที่ 3: บทละครและโครงสร้างเส้นเรื่องหลัก
          </h3>

          <div className="space-y-4">
            {timeline.map((node, idx) => (
              <TimelineNode
                key={node.id}
                node={node}
                index={idx}
                path={[idx]}
                characters={characters}
                onUpdateNode={handleUpdateNodeByPath}
                onDeleteNode={handleDeleteNodeByPath}
                onInsertNodeAfter={handleInsertNodeAfterByPath}
              />
            ))}
          </div>

          {/* MASTER TIMELINE APPEND BUTTON */}
          <button
            onClick={() =>
              emitUpdate({
                timeline: [
                  ...timeline,
                  {
                    id: String(Date.now()),
                    type: "dialogue",
                    speaker: "",
                    expression: "",
                    text: "",
                    actions: { bg: "", bgm: "", sfx: "" },
                  },
                ],
              })
            }
            className="w-full border-2 border-dashed border-violet-200 bg-white hover:bg-violet-50/20 text-violet-500 rounded-2xl py-3 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1"
          >
            ➕ เพิ่มบรรทัดบทพูดใหม่ (หรือกดปุ่ม Enter ในกล่องด้านบน)
          </button>
        </div>

        {/* DEVELOPER NOTES */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            🗒️ บันทึกเพิ่มเติม (Developer notes)
          </label>
          <textarea
            rows="3"
            value={selectedChapter.developerNotes || ""}
            onChange={(e) => emitUpdate({ developerNotes: e.target.value })}
            placeholder="เขียนบันทึกช่วยจำสำหรับสคริปต์ส่วนนี้..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 focus:outline-none focus:border-slate-400 shadow-2xs resize-none"
          />
        </div>
      </div>
    </div>
  );
}
