// src/components/ChapterList/TopNavbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabaseClient";
import { useRenPyExport } from "../../hooks/useRenPyExport";
import { Download, Folder, FileDown } from "lucide-react";

//const TEMPLATE_URL = "/templates/renpy-thai-template.zip";

const TEMPLATE_URL =
  //  "https://qwhrixreaurkpwzocqff.supabase.co/storage/v1/object/public/game-templates/renpy_templete-1.0-pc.zip";
  "https://github.com/EasyPooh/RenPy_Admin/releases/download/v1.0/renpy_template-1.0-pc.zip";

const TopNavbar = ({ id, onExportClick, isExporting, exportProgress }) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("กำลังโหลด...");

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
    if (typeof onExportClick === "function") {
      onExportClick(projectName); // เรียก Callback จากหน้าหลักแทน และส่งชื่อโปรเจกต์กลับไป
    }
  };

  // เพิ่มฟังก์ชันสำหรับจัดการดาวน์โหลดไฟล์เทมเพลต
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
          <span className="text-gray-400">ชื่อโปรเจกต์ : {projectName}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6 font-semibold">
        {exportProgress && (
          <span className="text-purple-500 font-mono animate-pulse text-[11px]">
            {exportProgress}
          </span>
        )}

        {/* ผูกฟังก์ชัน handleDownloadTemplate เข้ากับ onClick ที่นี่ 
        <button
          onClick={handleDownloadTemplate}
          title="ดาวน์โหลดตัวเกมRen'Py สำหรับวางไฟล์เนื้อเรื่อง"
          className="flex items-center gap-2 text-black-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-in-out hover:bg-violet-100 hover:text-violet-800 hover:scale-105 hover:shadow-lg hover:shadow-violet-200/50 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download game template</span>
        </button>*/}

        <button
          onClick={handleAssetPage}
          title="คลังเก็บรูปภาพและเสียง"
          className="flex items-center gap-2 text-black-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-in-out hover:bg-violet-100 hover:text-violet-800 hover:scale-105 hover:shadow-lg hover:shadow-violet-200/50 active:scale-95"
        >
          <Folder className="w-4 h-4" />
          <span>Asset library</span>
        </button>

        <button
          onClick={handleExportClick}
          title="ดาวน์โหลดไฟล์เนื้อเรื่อง พร้อม Assets"
          disabled={isExporting}
          className="flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-in-out hover:bg-violet-100 hover:text-violet-800 hover:scale-105 hover:shadow-lg hover:shadow-violet-200/50 active:scale-95 "
        >
          <FileDown className="w-4 h-4" />
          <span>{isExporting ? "Exporting..." : "Export Game ZIP"}</span>
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
