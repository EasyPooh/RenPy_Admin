import React from "react";
import { useNavigate } from "react-router";
import CreateProjectHeader from "../components/CreateProjectHeader";
import CreateProjectForm from "../components/CreateProjectForm";
import Navbar from "../components/Navbar";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function CreateProject() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // เพิ่ม loading เพื่อรอเช็ค session

  useEffect(() => {
    // 1. ดึง session ปัจจุบัน
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. ฟังการเปลี่ยนแปลงสถานะ (เผื่อมีการ Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // กรณีที่กำลังโหลด session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  // กรณีไม่มี session ให้แสดงข้อความเตือน
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            ยังไม่ได้เข้าสู่ระบบ
          </h2>
          <p className="text-gray-500 mb-4">
            กรุณาล็อกอินก่อนสร้างโปรเจกต์ใหม่ครับ
          </p>
          <button
            onClick={() => (window.location.href = "/login")} // หรือใช้ navigate('/login')
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ไปหน้าล็อกอิน
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ส่วนหัว */}
          <CreateProjectHeader />

          {/* ส่วนฟอร์ม */}
          <CreateProjectForm session={session} />
        </div>
      </div>
    </div>
  );
}

export default CreateProject;
