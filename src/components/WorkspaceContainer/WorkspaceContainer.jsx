// src/components/SceneList/WorkspaceContainer.jsx
import React from "react";

const WorkspaceContainer = ({ currentScene, children }) => {
  return (
    <main className="flex-1 bg-white overflow-y-auto p-6 flex flex-col h-full">
      {/* 1. ส่วนหัวของ Workspace */}
      <div className="flex items-center space-x-2 font-semibold text-gray-700 text-sm mb-4 select-none">
        <span>📝</span>
        <span>
          WORKSPACE AREA: ฉาก "{currentScene ? currentScene.name : "..."}"
        </span>
      </div>

      <div className="w-full border-t border-gray-100 my-2"></div>

      {/* 2. โซนตั้งค่าเริ่มต้นฉาก (Start Configurations) - สไตล์มินิมอล ขาว-ม่วง */}
      <div className="space-y-3 text-xs text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
        {/* แถว start scene */}
        <div className="flex items-center space-x-2">
          <span className="w-24 text-gray-500 flex items-center gap-1">
            🎬 start scene
          </span>
          <select className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-purple-400">
            <option>เลือกฉากเริ่มต้น...</option>
          </select>
          <select className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none focus:border-purple-400">
            <option>✨ เอฟเฟกต์...</option>
          </select>
        </div>

        {/* แถว start music */}
        <div className="flex items-center space-x-2">
          <span className="w-24 text-gray-500 flex items-center gap-1">
            🎵 start music
          </span>
          <select className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-purple-400">
            <option>เลือกเพลงพื้นหลังเริ่มต้น...</option>
          </select>
          <select className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none focus:border-purple-400">
            <option>✨ เอฟเฟกต์...</option>
          </select>
        </div>

        {/* แถว ตัวละครในฉาก */}
        <div className="flex items-center space-x-2 pt-1">
          <span className="w-24 text-gray-500 flex items-center gap-1">
            👥 ตัวละครในฉาก
          </span>
          <div className="flex items-center flex-wrap gap-1.5 flex-1">
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1">
              nevi{" "}
              <button className="hover:text-purple-900 font-bold">
                &times;
              </button>
            </span>
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1">
              main{" "}
              <button className="hover:text-purple-900 font-bold">
                &times;
              </button>
            </span>
            <input
              type="text"
              placeholder="+ พิมพ์ชื่อเพื่อแอดตัวละคร..."
              className="bg-transparent border-b border-dashed border-gray-300 px-1 py-0.5 focus:outline-none focus:border-purple-400 text-gray-600 w-44"
            />
          </div>
        </div>
      </div>

      <div className="w-full border-t border-dashed border-gray-200 mb-6"></div>

      {/* 3. พื้นที่ไทม์ไลน์สำหรับเรนเดอร์บล็อกย่อย (Timeline Content) */}
      <div className="flex-1 space-y-4">{children}</div>

      {/* 4. โซนแผงปุ่มสำหรับเพิ่มบล็อกเนื้อเรื่องใหม่ด้านท้ายหน้าต่าง */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-3 bg-white sticky bottom-0">
        <div className="font-medium text-purple-800 flex items-center gap-1">
          ➕ เพิ่มบล็อกใหม่ต่อท้าย (หรือพิมพ์ / เพื่อแทรกคำสั่ง)
        </div>
        <div className="flex flex-wrap gap-2 text-gray-700 font-medium">
          <button className="bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded px-3 py-1.5 transition-colors">
            💬 บทพูด
          </button>
          <button className="bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded px-3 py-1.5 transition-colors">
            🖼️ ภาพ (/image)
          </button>
          <button className="bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded px-3 py-1.5 transition-colors">
            🔊 เสียง (/audio)
          </button>
          <button className="bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded px-3 py-1.5 transition-colors">
            🔀 ช้อยส์
          </button>
        </div>
      </div>
    </main>
  );
};

export default WorkspaceContainer;
