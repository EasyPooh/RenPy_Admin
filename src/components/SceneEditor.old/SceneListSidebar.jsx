import React from "react";

export default function SceneListSidebar({
  scenes,
  selectedSceneId,
  onSelectScene,
  onCreateScene,
  searchQuery,
  onSearchChange,
}) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/50 flex flex-col h-full select-none">
      {/* ส่วนหัว Sidebar */}
      <div className="p-4 flex flex-col gap-3 border-b border-gray-100 bg-white">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Scene List
        </h2>

        {/* ผูกฟังก์ชันสร้างฉากใหม่ */}
        <button
          onClick={onCreateScene}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-sm shadow-purple-100"
        >
          <span>+</span> New Scene
        </button>

        {/* ผูกค่าและการพิมพ์ในช่องค้นหา */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-400 placeholder:text-gray-400 bg-gray-50/50"
        />
      </div>

      {/* รายการฉาก (Dynamic Render จาก State) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {scenes.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            {searchQuery
              ? "ไม่พบฉากที่ค้นหา"
              : "ยังไม่มีฉาก, กดปุ่มด้านบนเพื่อเพิ่ม"}
          </div>
        ) : (
          scenes.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`p-3 border rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-purple-50/80 border-purple-200 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="text-[10px] text-gray-400 font-mono mb-0.5">
                  #{scene.id.slice(-4)}
                </div>
                <div className="text-sm font-medium text-gray-700 flex items-center justify-between gap-2">
                  <span className="truncate">{scene.title}</span>
                  <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-md uppercase shrink-0">
                    {scene.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
