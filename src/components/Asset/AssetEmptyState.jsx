// src/components/Asset/AssetEmptyState.jsx
import React from "react";

const AssetEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* วงกลมไอคอนโฟลเดอร์จำลองตรงกลาง */}
      <div className="w-16 h-16 bg-gray-50 text-gray-400 border border-gray-200 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">
        📁
      </div>

      {/* ข้อความชี้แนะระบบตามรูปตัวอย่าง */}
      <h3 className="text-base font-semibold text-gray-700">ยังไม่มีไฟล์</h3>
      <p className="text-xs text-gray-400 mt-1 max-w-sm">
        กดปุ่ม 'อัปโหลดไฟล์' เพื่อเพิ่มไฟล์แรก
      </p>
    </div>
  );
};

export default AssetEmptyState;
