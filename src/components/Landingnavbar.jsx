import React from "react";
import { BookOpen, FileText } from "lucide-react"; // นำเข้าไอคอนจาก Lucide
//import { db } from "../lib/firebase"; // ดึงตัวแปร db มาจากไฟล์ที่เราเซ็ตไว้
//import { collection, addDoc } from "firebase/firestore";

const LandingNavbar = () => {
  /*const testFirebase = async () => {
    try {
      // ลองสร้างข้อมูลจำลองใน Collection ชื่อ "test"
      const docRef = await addDoc(collection(db, "test"), {
        message: "Hello from React!",
        timestamp: new Date(),
        status: "Success"
      });
      console.log("Document written with ID: ", docRef.id);
      alert("เชื่อมต่อสำเร็จ! ข้อมูลถูกบันทึกลง Firebase แล้ว");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("เกิดข้อผิดพลาด: " + e.message);
    }
  }*/
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ฝั่งซ้าย: Logo และชื่อแอป */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Ren'Py Admin
            </span>
          </div>

          {/* ฝั่งขวา: เมนู Docs และปุ่ม Sign in */}
          <div className="flex items-center gap-6">
            <a
              href="#docs"
              className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-medium transition-colors"
            >
              <FileText size={18} />
              <span>คู่มือ</span>
            </a>

            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md active:scale-95">
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
