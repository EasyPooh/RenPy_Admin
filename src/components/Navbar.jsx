import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      {/* พื้นหลังขาว ขอบล่างสีเทา เว้นแกนx,y */}
      {/* 1. Container หลัก จัดให้อยู่กลางหน้าจอและใช้ Flex */}
      <div className="max-w-7xl mx-auto flex items-center justify-start gap-10">
        {/* กลางจอ flexกลาง */}

        {/* 2. ส่วน Logo (ทางซ้ายสุด) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white">
            {/* ไอคอนหนังสือ (SVG) */}
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
          <span className="font-bold text-gray-800 text-lg">Ren'Py Admin</span>
        </div>

        {/* 3. ส่วน Menu Links */}
        <div className="flex items-center gap-4">
          {/* เมนูที่ Active (สีม่วง) */}
          <button className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-xl font-medium">
            {/* พื้นหลังม่วง มุมโค้งมน ตัวหนากลาง */}
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
            โปรเจค
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
