import React from "react";
import { Link } from "react-router";

const Herosection = ({ session }) => (
  <section className="relative pt-28 pb-20 px-4 bg-gradient-to-b from-purple-100/70 via-purple-50/30 to-white text-center text-balance overflow-hidden">
    {/* Ambient Background Glow (แสงฟุ้งสร้างมิติ) */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-purple-300/30 blur-[100px] pointer-events-none rounded-full" />

    {/* Pill Badge ดึงสายตา 
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm">
      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
      Ren'Py Visual Scripting Platform
    </div>*/}

    {/* Heading พร้อม Gradient Text */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight">
      สร้างเกม{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
        วิชวลโนเวล
      </span>{" "}
      บนเว็บ
    </h1>

    <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-base sm:text-lg leading-relaxed">
      พัฒนาเกมผ่านระบบ Visual Blocks
      <br className="hidden sm:inline" />
      ลดเวลาเขียนโค้ด สร้างบทสนทนา ตัวละคร และ Assets ได้เป็นระบบมากยิ่งขึ้น
    </p>

    <div className="flex justify-center gap-4 relative z-10">
      <Link to={session ? "/Allproject" : "/LoginPage"}>
        <button className="bg-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-purple-700 transition active:scale-95 shadow-lg shadow-purple-600/25">
          เริ่มสร้างเลย →
        </button>
      </Link>
    </div>
  </section>
);

export default Herosection;
