import React, { useState, useEffect } from "react"; // 🌟 อิมพอร์ต useState และ useEffect เข้ามาจัดการ State
import Select from "react-select";
import { supabase } from "../../lib/supabaseClient"; // 🌟 อิมพอร์ตสิทธิ์ใช้งาน Supabase (รบกวนเช็กตำแหน่ง Path ไฟล์ให้ตรงกับเครื่องคุณนะครับ)

const JumpSection = ({
  id,
  target_workspace_id, // ค่า UUID ของ Workspace ปลายทางจากฐานข้อมูล
  action_type,
  chapterList, // รายชื่อ Chapter ทั้งหมดที่ส่งมาจากหน้าจอหลัก
  workspaces, // พรอบเดิม (เก็บไว้เพื่อไม่ให้หน้าบ้านหลักเออร์เรอร์พัง)
  handleUpdateBlock,
  handleDeleteBlock,
  isGhosted,
}) => {
  const currentActionType = action_type || "jump";

  // 🌟 1. สร้างพื้นที่เก็บตารางจับคู่ไอดี { [chapter_id]: workspace_id } ภายในเครื่อง
  const [workspaceMap, setWorkspaceMap] = useState({});

  // 🌟 2. ดึงข้อมูลความสัมพันธ์จากตาราง workspaces มาทำแผนที่จับคู่แบบเงียบ ๆ ทันทีที่ข้อมูลบทเรียนโหลดมา
  useEffect(() => {
    const fetchWorkspaceIds = async () => {
      if (!chapterList || chapterList.length === 0) return;

      try {
        // แกะเอาเฉพาะไอดีของบทเรียนทั้งหมดส่งไปถามหาคู่ในฐานข้อมูล workspaces
        const chapterIds = chapterList.map((ch) => ch.id);

        const { data, error } = await supabase
          .from("workspaces")
          .select("id, chapter_id")
          .in("chapter_id", chapterIds);

        if (error) throw error;

        // แปลงข้อมูลให้อยู่ในรูป Object คีย์-ค่า เพื่อคิวรีหาได้ทันทีโดยไม่ต้องวนลูปซ้อนลูป
        const mapping = {};
        data.forEach((ws) => {
          mapping[ws.chapter_id] = ws.id;
        });

        setWorkspaceMap(mapping);
      } catch (err) {
        console.error(
          "❌ เกิดข้อผิดพลาดตอนทำแผนที่จับคู่ Workspace ใน JumpSection:",
          err,
        );
      }
    };

    fetchWorkspaceIds();
  }, [chapterList]);

  const handleModeChange = (mode) => {
    if (mode === "return") {
      handleUpdateBlock(id, "target_workspace_id", null);
      handleUpdateBlock(id, "action_type", "return");
    } else {
      handleUpdateBlock(id, "action_type", "jump");
    }
  };

  // ล็อกไว้ส่องตรวจสอบความถูกต้องของข้อมูลผ่าน Console
  console.log("👀 เช็กไส้ใน chapterList ปัจจุบัน:", chapterList);
  console.log("🧩 ตารางแผนที่จับคู่ไอดีล่าสุด:", workspaceMap);

  // 🌟 3. ปรับลอจิกการ Map ตัวเลือกโดยดึงเลข Workspace ID ตัวจริงมาจากแผนที่ที่เราทำไว้
  const chapterOptions = chapterList
    ? chapterList
        .map((ch) => {
          // ค้นหาค่า Workspace ID ปลายทางที่แท้จริงจากแผนที่ดักจับข้อมูล
          const targetWorkspaceId = workspaceMap[ch.id];

          return {
            value: targetWorkspaceId, // 💡 ได้ Workspace ID ตัวจริงไปบันทึกลงตาราง blocks
            label:
              ch.name ||
              ch.chapter_titles ||
              `บทสนทนาที่ไม่มีชื่อ (${ch.id.slice(0, 5)})`, // รองรับฟิลด์ name ล่าสุดของคุณ
          };
        })
        // กรองตัวเลือกออกชั่วคราว หากบทนั้นยังทำแผนที่จับคู่ไอดีจาก Supabase ไม่เสร็จสิ้น
        .filter((opt) => opt.value !== undefined && opt.value !== null)
    : [];

  // ตรวจสอบตัวเลือกที่กำลังถูกเลือกอยู่ในปัจจุบัน
  const currentSelectedOption = target_workspace_id
    ? chapterOptions.find((opt) => opt.value === target_workspace_id)
    : null;

  return (
    <div className="relative flex flex-col gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-3">
      {/* ส่วนหัวของบล็อก */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">👍</span>
          <label className="text-xs font-bold text-gray-400 tracking-wider uppercase">
            เส้นทาง / ปลายทางถัดไป
          </label>
        </div>
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
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          ลบ
        </button>
      </div>

      {/* ส่วนเลือกรูปแบบผลลัพธ์ (Radio Buttons) */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 border border-gray-100 rounded-lg">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="radio"
            name={`action_type_${id}`}
            value="jump"
            checked={currentActionType === "jump"}
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
            onChange={(selectedOption) => {
              // 💡 ส่งค่า Workspace ID ปลายทางที่เชื่อมโยงถูกต้องร้อยเปอร์เซ็นต์ขึ้นไปบันทึก
              handleUpdateBlock(
                id,
                "target_workspace_id",
                selectedOption ? selectedOption.value : null,
              );
            }}
            placeholder="-- เลือก Chapter ปลายทาง --"
            isClearable={true}
            isSearchable={true}
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
