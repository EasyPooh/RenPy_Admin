import React, { useState } from "react";
import { BookOpen, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient"; // ตรวจสอบตัวพิมพ์เล็ก-ใหญ่ให้ตรงกับไฟล์ของคุณนะครับ

const LandingNavbar = ({ session }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State ควบคุมการเปิด/ปิดเมนู Dropdown

  const userLetter = session?.user?.email?.charAt(0).toUpperCase() || "U";
  const userEmail = session?.user?.email || "";

  // ฟังก์ชันออกจากระบบ
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      navigate("/"); // ออกจากระบบแล้วกลับมาหน้าแรกแบบเคลียร์เซสชัน
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ฝั่งซ้าย: Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Ren'Py Admin
            </span>
          </div>

          {/* ฝั่งขวา: สลับตามสถานะ Login */}
          <div className="flex items-center gap-6">
            {session ? (
              /* บัญชีผู้ใช้ล็อกอินแล้ว */
              <div className="relative">
                {/* กล่องโปรไฟล์ที่กดเพื่อเปิด/ปิดเมนู */}
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all select-none"
                >
                  <div className="w-7 h-7 bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center rounded-lg">
                    {userLetter}
                  </div>
                  <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                    {userEmail}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {/* กล่องเมนู Dropdown จะแสดงเมื่อ isOpen เป็น true */}
                {isOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {/* ส่วน Header ที่ดูหรูขึ้น */}
                    <div className="px-5 py-3 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">
                        บัญชีผู้ใช้
                      </p>
                      <p className="text-sm text-slate-800 font-semibold mt-1 truncate">
                        {userEmail}
                      </p>
                      {/* <div className="flex items-center gap-2 mt-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <p className="text-[11px] text-slate-500 font-medium">
                          ออนไลน์อยู่
                        </p>
                      </div>*/}
                    </div>

                    {/* ปุ่มต่างๆ */}
                    <div className="px-2 py-1">
                      <button
                        onClick={() => navigate("/Allproject")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" /> โปรเจคของฉัน
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                      >
                        <LogOut className="w-4 h-4" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* หน้าตาตอนยังไม่ล็อกอิน */
              <button
                onClick={() => navigate("/LoginPage")}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md active:scale-95"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
