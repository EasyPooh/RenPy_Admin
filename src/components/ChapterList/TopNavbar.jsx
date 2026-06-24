// src/components/ChapterList/TopNavbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabaseClient";
import { useRenPyExport } from "../../hooks/useRenPyExport";

// 💡 กำหนด URL ของไฟล์ Template (เลือกเปิดใช้วิธีใดวิธีหนึ่ง)
// วิธีที่ 1: หากเก็บในโฟลเดอร์ public ของโปรเจกต์ React
//const TEMPLATE_URL = "/templates/renpy-thai-template.zip";

// วิธีที่ 2: หากเก็บใน Supabase Storage (เปลี่ยน URL ให้ตรงกับโปรเจกต์ของคุณ)
const TEMPLATE_URL =
  "https://qwhrixreaurkpwzocqff.supabase.co/storage/v1/object/public/game-templates/renpy_templete-1.0-pc.zip";

const TopNavbar = ({ id }) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("กำลังโหลด...");
  const { exportProject, isExporting, exportProgress } = useRenPyExport();

  useEffect(() => {
    const fetchProjectName = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("Projects")
          .select("titles")
          .eq("id", id)
          .single();

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
    navigate(`/Chapter_editor/${id}/assets`);
  };

  const handleExportClick = () => {
    exportProject(id, projectName);
  };

  // 💡 เพิ่มฟังก์ชันสำหรับจัดการดาวน์โหลดไฟล์เทมเพลต
  const handleDownloadTemplate = () => {
    // สร้าง element <a> จำลองเพื่อสั่งดาวน์โหลดแบบโปรแกรมมิ่ง (Best Practice สำหรับ Web)
    const link = document.createElement("a");
    link.href = TEMPLATE_URL;
    link.setAttribute("download", "renpy-thai-template.zip"); // ชื่อไฟล์ที่จะเซฟลงเครื่องผู้ใช้
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // เคลียร์ element ทิ้งหลังจากดาวน์โหลดเสร็จ
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

        <div className="flex items-center space-x-2 font-medium tracking-wide">
          <span className="text-sm">🔮</span>
          <span className="font-bold text-gray-700">RenPy Admin</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">ชื่อโปรเจค : {projectName}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6 font-semibold">
        {exportProgress && (
          <span className="text-purple-500 font-mono animate-pulse text-[11px]">
            {exportProgress}
          </span>
        )}

        {/* 💡 ผูกฟังก์ชัน handleDownloadTemplate เข้ากับ onClick ที่นี่ */}
        <button
          onClick={handleDownloadTemplate}
          className="hover:text-purple-600 transition-colors"
        >
          [ download game template ]
        </button>

        <button
          onClick={handleAssetPage}
          className="hover:text-purple-600 transition-colors"
        >
          [ asset library ]
        </button>

        <button
          onClick={handleExportClick}
          disabled={isExporting}
          className="text-purple-600 hover:text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? "[ exporting... ]" : "[ export .rpy ]"}
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
