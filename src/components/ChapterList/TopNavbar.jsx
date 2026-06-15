// src/components/ChapterList/TopNavbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabaseClient";

const TopNavbar = ({ id }) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("กำลังโหลด...");

  // 🎯 ดึงชื่อโปรเจกต์จากฐานข้อมูลเมื่อ id เปลี่ยนแปลง
  useEffect(() => {
    const fetchProjectName = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("Projects") // ชื่อตารางโปรเจกต์ของคุณ
          .select("titles") // สมมติว่าในเบสคุณเก็บชื่อด้วยฟิลด์ project_name (ถ้าเป็น name ให้เปลี่ยนตรงนี้ครับ)
          .eq("id", id)
          .single(); // ดึงข้อมูลมาแค่แถวเดียว

        if (error) throw error;
        if (data) {
          setProjectName(data.titles || "ไม่มีชื่อโปรเจกต์");
        }
      } catch (error) {
        console.error("Error fetching project name:", error.message);
        setProjectName("ไม่สามารถดึงชื่อได้");
      }
    };

    fetchProjectName();
  }, [id]);

  const handleAssetPage = () => {
    // ตรงนี้คุณสามารถใส่เงื่อนไขได้ เช่น ถ้า user ล็อกอินแล้วค่อยไป
    console.log("กำลังจะไปหน้าasset...");
    console.log("ID ที่จะส่งไปคือ:", id);
    navigate(`/Chapter_editor/${id}/assets`); // สั่งให้เปลี่ยนหน้า
  };
  return (
    <div className="h-11 border-b border-gray-100 bg-white flex items-center justify-between px-6 select-none shrink-0 text-xs text-gray-500">
      <div className="flex items-center gap-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          ← กลับ
        </button>

        {/* ฝั่งซ้าย: โลโก้และชื่อระบบจัดการสคริปต์ */}
        <div className="flex items-center space-x-2 font-medium tracking-wide">
          <span className="text-sm">🔮</span>
          <span className="font-bold text-gray-700">RenPy Admin</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">ชื่อโปรเจค : {projectName}</span>
        </div>
      </div>

      {/* ฝั่งขวา: ศูนย์รวมปุ่มกด Utilities เครื่องมือจัดการภาพรวมโปรเจกต์ */}
      <div className="flex items-center space-x-6 font-semibold">
        <button className="hover:text-purple-600 transition-colors">
          [ download game template ]
        </button>
        <button
          onClick={handleAssetPage}
          className="hover:text-purple-600 transition-colors"
        >
          [ asset library ]
        </button>
        {/*<button className="hover:text-purple-600 transition-colors">
          [ story map ]
        </button>*/}
        {/* ไฮไลท์ปุ่มสำหรับกดสร้างไฟล์แปลงโค้ด .rpy ส่งออกอนาคต */}
        <button className="text-purple-600 hover:text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded transition-all">
          [ export .rpy ]
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
