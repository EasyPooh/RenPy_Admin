// src/components/WorkspaceContainer/StartSection.jsx
import React from "react";

const StartSection = ({ startBg, setStartBg, startMusic, setStartMusic }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 select-none">
      <div className="text-xs font-bold text-gray-400 tracking-wider">
        🎬 CONFIG ฉากเริ่มต้น
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Background */}
        <div className="flex items-center space-x-2">
          <span className="w-28 text-gray-600 text-xs font-medium">
            start background
          </span>
          <select
            value={startBg}
            onChange={(e) => setStartBg(e.target.value)}
            className="flex-1 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
          >
            <option value="">[ เลือกฉากหลังเริ่มต้น ]</option>
            <option value="bg_room">ห้องนอน (bg_room)</option>
          </select>
        </div>

        {/* Start Music */}
        <div className="flex items-center space-x-2">
          <span className="w-28 text-gray-600 text-xs font-medium">
            start music
          </span>
          <select
            value={startMusic}
            onChange={(e) => setStartMusic(e.target.value)}
            className="flex-1 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
          >
            <option value="">[ เลือกเพลงพื้นหลังเริ่มต้น ]</option>
            <option value="sizzle.ogg">sizzle.ogg</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default StartSection;
