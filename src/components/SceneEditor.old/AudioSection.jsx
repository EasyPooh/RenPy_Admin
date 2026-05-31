import React from "react";

export default function AudioSection({ audio, onChange }) {
  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <span>🎵</span> Audio Settings
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            BGM (Music)
          </label>
          <input
            type="text"
            value={audio.bgm || ""}
            onChange={(e) => onChange({ ...audio, bgm: e.target.value })}
            placeholder="เช่น main_theme.mp3"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            SFX (Sound Effect)
          </label>
          <input
            type="text"
            value={audio.sfx || ""}
            onChange={(e) => onChange({ ...audio, sfx: e.target.value })}
            placeholder="เช่น rain_ambient.wav"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
