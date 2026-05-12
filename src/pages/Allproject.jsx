import React from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Emptystate from "../components/Emptystate";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LayoutGrid, Plus, Gamepad2, Clock, CheckCircle2 } from "lucide-react"; // เพิ่มไอคอนสวยๆ

function Allproject() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("Projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId) => {
    // ยืนยันกับผู้ใช้ก่อนลบ (Best Practice)
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้?");
    if (!confirmDelete) return;

    try {
      // --- STEP 1: ลบข้อมูลใน Supabase ---
      // ใช้ชื่อตาราง 'Projects' และ column 'id' ตามที่คุณระบุไว้
      const { error } = await supabase
        .from("Projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        throw error;
      }

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId),
      );

      alert("ลบโปรเจกต์สำเร็จแล้ว!");
    } catch (error) {
      console.error("Error deleting project:", error.message);
      alert("เกิดข้อผิดพลาด: ไม่สามารถลบข้อมูลในฐานข้อมูลได้");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* --- Header Section --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  โปรเจคของฉัน
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />{" "}
                  จัดการเกมและเนื้อหาทั้งหมดของคุณ
                </p>
              </div>
            </div>

            <Link to="/CreateProject">
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 transition-all duration-300 shadow-md hover:shadow-violet-200 active:scale-95">
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                สร้างโปรเจคใหม่
              </button>
            </Link>
          </div>

          {/* --- Content Section --- */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">
                กำลังดึงข้อมูลโปรเจค...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <Emptystate />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Thumbnail Area */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={
                        item.image_url ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={item.titles}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      // เพิ่ม Error Handler เผื่อลิงก์พัง
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {item.status === "developing" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/90 backdrop-blur-md text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" /> กำลังพัฒนา
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/90 backdrop-blur-md text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> เสร็จสมบูรณ์
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                        {item.titles || "ไม่มีชื่อโปรเจค"}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                        {item.description || "ไม่มีคำอธิบายสำหรับโปรเจคนี้..."}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {item.game_type || "General"}
                      </span>
                      <button
                        onClick={() => navigate(`/EditProject/${item.id}`)}
                        className="text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        แก้ไขโปรเจค
                      </button>
                      <button
                        onClick={() => handleDeleteProject(item.id)}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Allproject;
