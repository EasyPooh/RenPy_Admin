// src/components/Asset/AssetFilterTabs.jsx
import React from "react";

const AssetFilterTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "all", label: "ทั้งหมด" },
    { id: "background", label: "พื้นหลัง" },
    { id: "sprite", label: "ตัวละคร" },
    { id: "music", label: "เพลง" },
    { id: "sound_effect", label: "เอฟเฟกต์" }, // เปลี่ยนจาก soundEffect เป็น sound_effect
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all relative top-px ${
              isActive
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default AssetFilterTabs;
