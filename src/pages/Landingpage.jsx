// src/pages/Landingpage.jsx
import React from "react";
import { useNavigate } from "react-router";

import Herosection from "../components/Herosection";
import Featuresection from "../components/Featuresection";
import LandingNavbar from "../components/Landingnavbar";

// 1. เพิ่ม { session } เข้ามาในวงเล็บฟังก์ชัน
function Landingpage({ session }) {
  const nav = useNavigate();

  console.log("2. Session ใน Landingpage.jsx:", session);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 2. ส่งต่อ session ไปให้ Navbar และ Herosection เอาไว้เช็กสถานะ */}
      <LandingNavbar session={session} />
      <Herosection session={session} />
      <Featuresection />
    </div>
  );
}

export default Landingpage;
