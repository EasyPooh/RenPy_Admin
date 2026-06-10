<div className="flex items-center space-x-2 gap-4">
  <span className="w-28 text-gray-600 text-xs font-medium ">
    เพิ่มตัวละครและบันทึกไว้ในส่วนนี้แล้วจะปรากฏให้เลือกได้ในบล็อกบทสนทนา
  </span>
</div>;
//ตาราง assets supabase
//https://qwhrixreaurkpwzocqff.supabase.co/rest/v1/assets

return (
    // เปลี่ยน Container หลักเป็น Grid: บนจอคอมโชว์ 4 คอลัมน์, แท็บเล็ต 2-3 คอลัมน์, มือถือ 1 คอลัมน์
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      {assets.map((asset) => {
        const badge = getTypeBadge(asset.file_type);

        return (
          <div
            key={asset.id}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col"
          >
            {/* พื้นที่ด้านบน: รูปภาพ Thumbnail และป้ายกำกับ */}
            <div className="relative w-full aspect-video bg-gray-50 border-b border-gray-100 overflow-hidden shrink-0">
              {/* แสดงรูปตัวอย่างไฟล์ */}
              {asset.url ? (
                // Case 1: ถ้ามี URL รูปภาพจริงจากการอัปโหลด ให้แสดงรูปจริง
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                // Case 2: Fallback UI หากไม่มีรูปภาพ (เช่น กำลังโหลด หรือเป็นไฟล์ประเภทอื่น)
                <div className="flex flex-col items-center text-gray-400">
                  <span className="text-xs">ไม่มีรูปตัวอย่าง</span>
                </div>
              )}

              {/* ป้ายประเภทไฟล์มุมขวาบน */}
              <span
                className={`absolute top-2.5 right-2.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badge.bg} shadow-sm`}
              >
                {badge.text}
              </span>

              {/* ปุ่ม ... (Action Menu) มุมขวาล่างของส่วนรูปภาพ */}
              <button
                onClick={() => handleOpenEdit(asset)}
                className="absolute bottom-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm text-gray-500 hover:text-gray-800 transition-all opacity-0 group-hover:opacity-100"
                title="เมนูเพิ่มเติม"
              >
                ⋯
              </button>
            </div>

            {/* พื้นที่ด้านล่าง: ชื่อไฟล์และรายละเอียดขนาด */}
            <div className="p-3.5 flex flex-col justify-between flex-1 min-w-0">
              <div className="space-y-0.5">
                <h4
                  className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors"
                  title={asset.name}
                >
                  {asset.name}
                </h4>
                <p className="text-xs text-gray-400 font-medium">
                  {asset.size}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetListView;