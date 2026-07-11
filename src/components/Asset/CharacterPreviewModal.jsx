import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CharacterPreviewModal({
  isOpen,
  onClose,
  assetData,
  onSave,
}) {
  const [zoom, setZoom] = useState(1.0);
  const [yoffset, setYoffset] = useState(0); // เปลี่ยนจาก yalign เป็น yoffset (หน่วยพิกเซล)
  const [isSaving, setIsSaving] = useState(false);
  const [showTextbox, setShowTextbox] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);

  // 1. Sync Initial Data เมื่อ assetData เปลี่ยนแปลง
  useEffect(() => {
    if (assetData?.transform_config) {
      setZoom(assetData.transform_config.zoom ?? 1.0);
      setYoffset(assetData.transform_config.yoffset ?? 0);
    } else {
      setZoom(1.0);
      setYoffset(0);
    }
  }, [assetData]);

  // 2. Fetch Signed URL พร้อมระบบ Cleanup ป้องกัน Race Conditions
  useEffect(() => {
    let isMounted = true;

    const fetchSignedUrl = async () => {
      if (!assetData?.storage_path) {
        setImageUrl(null);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from("game-assets")
          .createSignedUrl(assetData.storage_path, 3600);

        if (!isMounted) return;

        if (error) {
          console.error("Error creating signed URL:", error.message);
          setImageUrl(null);
        } else {
          setImageUrl(data?.signedUrl || null);
        }
      } catch (err) {
        console.error("Failed to fetch signed URL:", err);
        if (isMounted) setImageUrl(null);
      }
    };

    if (isOpen) {
      fetchSignedUrl();
    }

    return () => {
      isMounted = false;
    };
  }, [assetData?.storage_path, isOpen]);

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      if (typeof onSave === "function") {
        // ส่งโครงสร้าง yoffset กลับไปบันทึกใน Database
        await onSave(assetData.id, { zoom, yoffset });
        onClose();
      } else {
        console.error("Error: onSave prop is missing");
        alert("ไม่สามารถบันทึกได้เนื่องจากระบบเชื่อมต่อมีปัญหา");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
          <h3 className="text-base font-bold text-gray-900">
            ปรับแต่งพิกัดตัวละคร: {assetData?.file_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body Layout */}
        <div className="p-6 grid grid-cols-1 gap-6 lg:grid-cols-3 overflow-y-auto">
          {/* ฝั่งซ้าย: Canvas จำลองหน้าจอเกม 16:9 */}
          <div className="lg:col-span-2 flex flex-col">
            <div
              className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200"
              style={{
                backgroundColor: "#ffffff",
                backgroundImage:
                  "conic-gradient(#f8fafc 0.25turn, transparent 0.25turn 0.5turn, #f8fafc 0.5turn 0.75turn, transparent 0.75turn)",
                backgroundSize: "20px 20px",
              }}
            >
              {/* เส้นไกด์กึ่งกลางจอแนวดิ่ง */}
              <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-slate-300 pointer-events-none"></div>

              {/* ตัวละครที่มีการคำนวณแบบสัดส่วนตรงกับ Ren'Py */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Character Preview"
                  className="absolute will-change-transform select-none"
                  style={{
                    height: "100%",
                    left: "50%",
                    bottom: "0%",
                    /* 
        แก้ไข: แปลงหน่วย yoffset (พิกเซลเกม) ให้เป็น % เทียบกับความสูงหน้าจอเกมจริง (1080px) 
        ทำให้แสดงผลตำแหน่งได้ตรงตามหน้าจอเกม 1:1 และภาพไม่หลุดขอบจอพรีวิว
      */
                    transform: `translate(-50%, calc((${yoffset} / 1080) * 100%)) scale(${zoom})`,
                    transformOrigin: `center bottom`,
                  }}
                />
              )}

              {/* กล่องคำพูดจำลอง (Dialogue Box Mockup) */}
              {showTextbox && (
                <div className="absolute bottom-4 left-1/2 w-[92%] -translate-x-1/2 rounded-xl bg-white/95 backdrop-blur-sm p-4 border border-slate-200 shadow-lg pointer-events-none select-none transition-all">
                  <div className="text-xs font-bold text-indigo-600">
                    {assetData?.file_name?.split(".")[0] || "Character Name"}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    "กล่องคำพูดจำลองการแสดงบทสนทนา"
                  </div>
                </div>
              )}
            </div>

            {/* แถบควบคุมใต้จอจำลอง */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                * จอจำลองสัดส่วนคล้ายหน้าจอภายในตัวเกม Ren'Py
              </span>
              <button
                onClick={() => setShowTextbox(!showTextbox)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  showTextbox
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {showTextbox ? "ซ่อนกล่องคำพูด" : "แสดงกล่องคำพูด"}
              </button>
            </div>
          </div>

          {/* ฝั่งขวา: แผงควบคุม (Sliders Panel) */}
          <div className="flex flex-col justify-between rounded-xl bg-slate-50 p-5 border border-slate-100">
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  คอนโทรลพิกัด (Transform)
                </h4>
              </div>

              {/* Slider 1: Zoom */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">ขนาดตัวละคร (zoom)</span>
                  <span className="text-indigo-600 font-mono font-bold">
                    {zoom.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Slider 2: Y-Offset */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">
                    ระยะชดเชยแนวตั้ง (yoffset)
                  </span>
                  <span className="text-indigo-600 font-mono font-bold">
                    {yoffset > 0 ? `+${yoffset}` : yoffset} px
                  </span>
                </div>
                <input
                  type="range"
                  min="-600" // ปรับค่าพิกเซลให้ยืดหยุ่นขยับขึ้นบนได้สูง
                  max="600" // ขยับลงล่างได้ลึก
                  step="5" // เลื่อนทีละ 5px เพื่อความลื่นไหลในการปรับแต่ง
                  value={yoffset}
                  onChange={(e) => setYoffset(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* ปุ่ม Actions ด้านล่างแผงควบคุม */}
            <div className="mt-8 flex gap-3 border-t border-slate-200 pt-4">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกพิกัด"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
