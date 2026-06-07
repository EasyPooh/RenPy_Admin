// src/components/ChapterList/MainLayout.jsx
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 font-sans antialiased overflow-hidden text-gray-950">
      {/* children คือ Component ทั้งหมดที่จะถูกส่งมาจากหน้า Page 
        ระบบจะนำมาเรนเดอร์เรียงกันในแนวตั้ง (flex-col) 
        ทำให้ Navbar อยู่บนสุด และ Content อื่นๆ อยู่ถัดลงมาพอดี
      */}
      {children}
    </div>
  );
};

export default MainLayout;
