import React from "react";

export default function TreeViewer() {
  return (
    <div className="w-80 bg-[#f8f9fa] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 tracking-wider">
          VISUAL TREE
        </h2>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <button className="p-1 hover:bg-slate-200 rounded">🔍+</button>
          <button className="p-1 hover:bg-slate-200 rounded">🔍-</button>
          <button className="p-1 hover:bg-slate-200 rounded">⤢</button>
        </div>
      </div>

      {/* Tree Canvas Placeholder */}
      <div className="flex-1 bg-slate-50 relative p-4">
        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 italic">
          [Visual Tree Canvas]
        </div>
      </div>
    </div>
  );
}
