import React from "react";

export default function BackgroundSection({ background, onChange }) {
  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <span>🖼️</span> Background Settings
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Location Name
          </label>
          <input
            type="text"
            value={background.location || ""}
            onChange={(e) =>
              onChange({ ...background, location: e.target.value })
            }
            placeholder="เช่น ห้องนอน, โรงเรียน"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Background Image Name (.jpg / .png)
          </label>
          <input
            type="text"
            value={background.image || ""}
            onChange={(e) => onChange({ ...background, image: e.target.value })}
            placeholder="เช่น bg_bedroom.jpg"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
