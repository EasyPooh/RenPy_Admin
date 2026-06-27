// src/components/Asset/AssetHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AssetHeader = ({ searchQuery, setSearchQuery, handleOpenUpload }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      {/* ฝั่งซ้าย: ปุ่มย้อนกลับ และ ชื่อหัวข้อ */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          ← กลับ
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">คลังจัดการ Assets</h1>
          <p className="text-xs text-gray-500">
            อัปโหลด ค้นหา และแก้ไขไฟล์ต่าง ๆ ภายในโปรเจค
          </p>
        </div>
      </div>

      {/* ฝั่งขวา: ช่องค้นหาข้อมูล + ปุ่มอัปโหลด */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ Assets..."
            className="w-full pl-3 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <button
          onClick={handleOpenUpload}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all whitespace-nowrap"
        >
          + อัปโหลดไฟล์
        </button>
      </div>
    </div>
  );
};

export default AssetHeader;
