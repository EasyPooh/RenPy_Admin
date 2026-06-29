import React from "react"; // 🌟 ลบ useState, useEffect และ Supabase ออกเพราะไม่ต้องดึงตารางจับคู่แล้ว
import Select from "react-select";

const JumpSection = ({
  id,
  target_chapter_id, // 🔄 เปลี่ยนชื่อพร็อบรับจากหน้าหลักตามชื่อคอลัมน์ใหม่ของคุณ
  action_type,
  chapterList, // รายชื่อ Chapter ทั้งหมดที่ส่งมาจากหน้าจอหลัก
  workspaces, // พรอบเดิม (เก็บไว้เพื่อไม่ให้หน้าบ้านหลักเออร์เรอร์พัง)
  handleUpdateBlock,
  handleDeleteBlock,
  isGhosted,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  blockNumber,
}) => {
  const currentActionType = action_type || "jump";

  const handleModeChange = (mode) => {
    if (mode === "return") {
      handleUpdateBlock(id, "target_chapter_id", null); // 🔄 อัปเดตคอลัมน์ใหม่
      handleUpdateBlock(id, "action_type", "return");
    } else {
      handleUpdateBlock(id, "action_type", "jump");
    }
  };

  // ล็อกไว้ส่องตรวจสอบความถูกต้องของข้อมูลผ่าน Console
  console.log("👀 เช็กไส้ใน chapterList ปัจจุบัน:", chapterList);
  console.log(
    "🎯 ไอดีบทปลายทางที่เลือกอยู่ปัจจุบัน (target_chapter_id):",
    target_chapter_id,
  );

  // 🌟 3. ปรับลอจิกการ Map ตัวเลือก: ดึงค่า ch.id มาเป็น value ตรง ๆ ได้เลย ไม่ต้องวิ่งไปหาในตารางอื่นแล้ว
  const chapterOptions = chapterList
    ? chapterList.map((ch) => ({
        value: ch.id, // 💡 ใช้ไอดีของ Chapter ตรง ๆ ไปบันทึกลงคอลัมน์ target_chapter_id
        label:
          ch.name ||
          ch.chapter_titles ||
          `บทสนทนาที่ไม่มีชื่อ (${ch.id.slice(0, 5)})`,
      }))
    : [];

  // ตรวจสอบตัวเลือกที่กำลังถูกเลือกอยู่ในปัจจุบัน
  const currentSelectedOption = target_chapter_id
    ? chapterOptions.find((opt) => opt.value === target_chapter_id)
    : null;

  return (
    <div className="relative flex flex-col gap-4 p-4 bg-rose-50 text-rose-700 border-rose-200 rounded-xl mb-3">
      {/* ส่วนหัวของบล็อก */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">👍</span>
          <label className="text-xs font-bold text-black-400 tracking-wider uppercase">
            #{blockNumber} เส้นทาง / ปลายทางถัดไป
          </label>
          {/* ป้ายเตือนเมื่อบล็อกโดน Ghosted */}
          {isGhosted && (
            <span className="text-xs text-red-500 font-bold animate-pulse">
              🚨 บล็อกนี้จะไม่ทำงานในเกม (อยู่หลังจุดสิ้นสุดเนื้อเรื่อง)
            </span>
          )}
        </div>
        {/* ซ่อนปุ่มลบเมื่อบล็อกโดน Ghosted */}
        {!isGhosted && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-black-400 tracking-wider">
              เลื่อนบล็อก
            </label>
            {/* กลุ่มปุ่มลูกศร สลับขึ้น-ลง */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              {/* ปุ่มเลื่อนขึ้น */}
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
              <div className="w-px h-4 bg-gray-200" /> {/* เส้นแบ่งกลางเล็กๆ */}
              {/* ปุ่มเลื่อนลง */}
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

            {/* ปุ่มลบเดิม */}
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

      {/* ส่วนเลือกรูปแบบผลลัพธ์ (Radio Buttons) */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 border border-gray-100 rounded-lg">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="radio"
            name={`action_type_${id}`}
            value="jump"
            checked={currentActionType === "jump"}
            disabled={isGhosted}
            onChange={() => handleModeChange("jump")}
            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
          />
          <span>📖 กระโดดข้ามไป chapter อื่น (Jump)</span>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="radio"
            name={`action_type_${id}`}
            value="return"
            checked={currentActionType === "return"}
            disabled={isGhosted}
            onChange={() => handleModeChange("return")}
            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
          />
          <span>🏁 สิ้นสุดเนื้อเรื่องตรงนี้ (Return / End Game)</span>
        </label>
      </div>

      {/* ส่วนแสดงผลลัพธ์ตามโหมดที่เลือก */}
      {currentActionType === "jump" ? (
        <div className="flex flex-col gap-2 bg-white p-3 border border-gray-100 rounded-lg">
          <label className="text-xs font-bold text-gray-400 tracking-wider">
            เลือกบทปลายทางที่ต้องการให้เกมนําทางไป
          </label>

          {/* ตู้เลือก react-select */}
          <Select
            options={chapterOptions}
            value={currentSelectedOption}
            isDisabled={isGhosted}
            onChange={(selectedOption) => {
              // 💡 ส่งค่า target_chapter_id ขึ้นไปบันทึกบนตารางบล็อกโดยตรง
              handleUpdateBlock(
                id,
                "target_chapter_id",
                selectedOption ? selectedOption.value : null,
              );
            }}
            placeholder="-- เลือก Chapter ปลายทาง --"
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
                borderColor: state.isFocused ? "#a855f7" : "#e5e7eb",
                boxShadow: "none",
                "&:hover": {
                  borderColor: state.isFocused ? "#a855f7" : "#d1d5db",
                },
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontFamily: "sans-serif",
                paddingTop: "1px",
                paddingBottom: "1px",
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                fontSize: "0.875rem",
                borderRadius: "0.5rem",
                zIndex: 50,
              }),
            }}
          />
        </div>
      ) : (
        /* โหมด Return จบเกม */
        <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-100 text-purple-800 rounded-lg">
          <span className="text-sm mt-0.5">💡</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">ยืนยันการสิ้นสุดเส้นทาง</span>
            <span className="text-xs text-purple-600">
              เมื่อผู้เล่นดำเนินเนื้อเรื่องมาถึงจุดนี้ ระบบของ Ren'Py
              จะตัดฉากกลับสู่หน้าเมนูหลัก (Main Menu) ของเกมทันที
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JumpSection;
