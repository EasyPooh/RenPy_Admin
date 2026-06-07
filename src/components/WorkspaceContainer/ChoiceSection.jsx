import React, { useState, useEffect, useRef } from "react";

const ChoiceSection = ({
  id,
  choice, // คาดหวังให้เป็น Array เช่น [{ id: 1, text: "", target: "" }]
  handleUpdateBlock,
  handleDeleteBlock,
  focusedBlockId,
  allchapter,
  // เพิ่ม Mock Data สำหรับค้นหาฉากย่อย (สามารถส่งผ่าน Props เข้ามาแทนได้)
  allScenes = [
    { id: "scene-0", name: "chapter นี้" },
    { id: "scene-1", name: "Chapter 10" },
    { id: "scene-2", name: "Chapter 5000" },
    { id: "scene-3", name: "Chapter 20 - Scene 1" },
    { id: "scene-4", name: "Chapter 30 - Scene 2" },
  ],
}) => {
  const inputRef = useRef(null);

  // Auto-focus เมื่อ Block นี้ถูกเลือก
  useEffect(() => {
    if (id === focusedBlockId) {
      inputRef.current?.focus();
    }
  }, [focusedBlockId, id]);

  // ปิด Dropdown เมื่อคลิกพื้นที่อื่นข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const newChoice = { id: Date.now().toString(), text: "", target: "" };
    handleUpdateBlock(id, "choice", [...choicesList, newChoice]);
  };

  // ฟังก์ชันอัปเดตข้อความหรือเส้นทางของแต่ละตัวเลือก
  const handleChoiceChange = (choiceId, field, value) => {
    const updatedChoices = choicesList.map((c) =>
      c.id === choiceId ? { ...c, [field]: value } : c,
    );
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

              {/* บรรทัดที่ 2: เลือกเส้นทางฉากย่อย */}
              <div
                className="flex items-center gap-3 pl-4 sm:pl-23 relative"
                ref={openDropdownId === item.id ? dropdownRef : null}
              >
                <span className="text-gray-400 font-bold">↳</span>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  เส้นทางเนื้อเรื่องที่จะไป:
                </span>

                <div className="flex-1 relative">
                  {/* ช่องสำหรับพิมพ์และเปิด Dropdown ค้นหา (ใช้ ClassName เดิมของคุณทั้งหมด) */}
                  <input
                    type="text"
                    value={
                      openDropdownId === item.id ? searchQuery : displayLabel
                    }
                    placeholder="[ เลือก Chapter / Scene ▼ ]"
                    onFocus={() => {
                      setOpenDropdownId(item.id);
                      setSearchQuery(displayLabel);
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-sm font-sans cursor-pointer text-gray-600 pr-8"
                  />
                  {/* สัญลักษณ์ลูกศรชี้ลงด้านขวา */}
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs">
                    ▼
                  </span>

                  {/* กล่องแสดงผลลัพธ์การค้นหาเมื่อผู้ใช้ Focus ที่ช่องทางเลือกนี้ */}
                  {openDropdownId === item.id && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          handleChoiceChange(item.id, "target", "same-chapter"); // เซ็ตค่า target เป็น "same-chapter" เข้า State หลัก
                          setOpenDropdownId(null); // เลือกเสร็จให้ปิดตลับลงไป
                        }}
                        className={`px-3 py-2 text-sm font-sans cursor-pointer transition-colors border-b border-gray-100 ${
                          item.target === "same-chapter"
                            ? "bg-purple-50 text-purple-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        ไม่เปลี่ยน chapter (อยู่ chapter เดิม)
                      </div>
                      {filteredScenes.length > 0 ? (
                        filteredScenes.map((scene) => (
                          <div
                            key={scene.id}
                            onClick={() => {
                              handleChoiceChange(item.id, "target", scene.id);
                              setOpenDropdownId(null);
                            }}
                            className={`px-3 py-2 text-sm font-sans cursor-pointer transition-colors ${
                              item.target === scene.id
                                ? "bg-purple-50 text-purple-600 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {scene.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm font-sans text-gray-400 italic text-center">
                          ไม่พบข้อมูลที่ค้นหา
                        </div>
                      )}
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
    </div>
  );
};

export default ChoiceSection;
