import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BookOpen, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้ปัจจุบันมาแสดงผลตอนโหลดคอมโพเนนต์
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // คอยดักฟังเผื่อมีการล็อกอินหรือออกจากระบบจากหน้าอื่น สถานะโปรไฟล์จะอัปเดตตามทันที
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ฟังก์ชันสำหรับล็อกเอาต์ออกจากระบบ
  const handleLogout = () => {
    if (window.globalIsDataChanged === true) {
      const isConfirmed = window.confirm(
        "คุณแน่ใจใช่หรือไม่ที่จะออกจากระบบ? โปรดแน่ใจว่าคุณได้บันทึกงานแล้ว",
      );

      if (!isConfirmed) return; // ❌ ถ้าผู้ใช้กด Cancel ให้จบฟังก์ชันทันที (ไม่ล็อกเอาต์)
      window.globalIsDataChanged = false; // 🔓 ถ้าผู้ใช้กด OK ให้ปลดล็อกสถานะเพื่อเตรียมย้ายหน้า
    }
    //  สั่งย้ายหน้าที่หน้า Landingpage ("/")
    navigate("/");

    // หน่วงเวลาไว้เสี้ยววินาที (100 มิลลิวินาที) ให้ React สลับคอมโพเนนต์เสร็จเรียบร้อย
    // แล้วจึงสั่งให้ Supabase เคลียร์ Token ออกจากระบบ
    setTimeout(async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        if (setIsDropdownOpen) setIsDropdownOpen(false); // ปิดเมนู Dropdown (ถ้ามี)
      } catch (error) {
        console.error("Error signing out:", error.message);
      }
    }, 100);
    alert("คุณออกจากระบบแล้ว");
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      {/* ปรับเป็น justify-between เพื่อดันส่วนโปรไฟล์ไปขวาสุด */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* รวมกลุ่มฝั่งซ้าย: โลโก้ และ เมนูเดิม */}
        <div className="flex items-center justify-start gap-10">
          {/*  ส่วน Logo (ทางซ้ายสุด) */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="font-bold text-gray-800 text-lg">
                Ren'Py Admin
              </span>
            </Link>
          </div>

          {/*  ส่วน Menu Links */}
          <div className="flex items-center gap-4">
            <Link to="/Allproject">
              <button className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-in-out hover:bg-violet-100 hover:text-violet-800 hover:scale-105 hover:shadow-lg hover:shadow-violet-200/50 active:scale-95">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l-2 4m1 1l2-4m-10 6h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                โปรเจกต์
              </button>
            </Link>
          </div>
        </div>

        {/*  ส่วนจัดการ User Profile & Dropdown  */}
        <div className="relative">
          {user ? (
            <div className=" bg-violet-50/50 text-violet-700 border border-violet-100 rounded-xl font-medium transition-all duration-300 hover:bg-violet-50 hover:border-violet-400 hover:text-violet-900">
              {/* ปุ่มกดเปิด/ปิด Dropdown */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors text-left"
              >
                {/* วงกลมตัวอักษรแรกของอีเมล */}
                <div className="w-7 h-7 bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center rounded-lg uppercase">
                  {user.email ? user.email.charAt(0) : "U"}
                </div>
                {/* แสดงอีเมล */}
                <span className="hidden sm:inline text-sm font-medium text-gray-600 max-w-35 truncate">
                  {user.email}
                </span>
                {/* ไอคอนลูกศรชี้ลง (Chevron Down SVG) */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* กล่องเมนูย่อย Dropdown */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop ใสสำหรับกดยุบเก็บเมื่อคลิกนอกพื้นที่ */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {/* ส่วน Header  */}
                    <div className="px-5 py-3 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">
                        บัญชีผู้ใช้
                      </p>
                      <p className="text-sm text-slate-800 font-semibold mt-1 truncate">
                        {user.email}
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
                        <LayoutDashboard className="w-4 h-4" /> โปรเจกต์ของฉัน
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                      >
                        <LogOut className="w-4 h-4" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // กรณีไม่มี Session
            <Link
              to="/LoginPage"
              className="text-sm font-medium text-violet-600 hover:text-violet-700 px-3 py-1.5"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
