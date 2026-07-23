import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CharacterPreviewModal({
  isOpen,
  onClose,
  assetData,
  onSave,
}) {
  const [zoom, setZoom] = useState(1.0);
  const [yoffset, setYoffset] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showTextbox, setShowTextbox] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);

  // 🌟 เพิ่ม State สำหรับสลับตำแหน่งพรีวิว (left, center, right)
  const [previewAlign, setPreviewAlign] = useState("center");

  // เก็บขนาดจริงของไฟล์ภาพ
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  // แมปตำแหน่งRen'Py (xalign) เป็น % บน Canvas
  const alignMap = {
    left: { label: "ซ้าย (0.16)", value: "16%" },
    center: { label: "กลาง (0.50)", value: "50%" },
    right: { label: "ขวา (0.84)", value: "84%" },
  };

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

  // Reset ขนาดภาพเมื่อเปลี่ยน Asset
  useEffect(() => {
    setImgDimensions({ width: 0, height: 0 });
  }, [assetData?.id]);

  // 2. Fetch Signed URL
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

  const handleImageLoad = (e) => {
    setImgDimensions({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
  };

  const handleAutoFit = () => {
    if (imgDimensions.height > 0) {
      const fitZoom = Number((1080 / imgDimensions.height).toFixed(2));
      setZoom(fitZoom);
    }
  };

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      if (typeof onSave === "function") {
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

  const calculatedHeightPercentage = imgDimensions.height
    ? `${(imgDimensions.height / 1080) * 100}%`
    : "100%";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-gray-900">
              ปรับแต่งพิกัดตัวละคร: {assetData?.file_name}
            </h3>
            {imgDimensions.width > 0 && (
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                {imgDimensions.width} × {imgDimensions.height} px
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body Layout */}
        <div className="p-6 grid grid-cols-1 gap-6 lg:grid-cols-3 overflow-y-auto">
          {/* ฝั่งซ้าย: Canvas จำลองหน้าจอเกม 16:9 (1920x1080) */}
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
              {/* เส้นไกด์ตำแหน่ง 3 จุด (ซ้าย 16%, กลาง 50%, ขวา 84%) */}
              <div className="absolute inset-y-0 left-[16%] w-px border-l border-dashed border-slate-200 pointer-events-none z-10 opacity-60"></div>
              <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-slate-300 pointer-events-none z-10"></div>
              <div className="absolute inset-y-0 left-[84%] w-px border-l border-dashed border-slate-200 pointer-events-none z-10 opacity-60"></div>

              {/* ตัวละครที่พรีวิวตามตำแหน่งที่เลือก */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Character Preview"
                  onLoad={handleImageLoad}
                  className="absolute will-change-transform select-none max-w-none transition-[left] duration-200 ease-out"
                  style={{
                    height: calculatedHeightPercentage,
                    width: "auto",
                    /* 🌟 ปรับตำแหน่ง left ตามปุ่มที่เลือก (16%, 50%, หรือ 84%) */
                    left: alignMap[previewAlign].value,
                    bottom: `calc((${yoffset} / 1080) * -100%)`,
                    transform: `translateX(-50%) scale(${zoom})`,
                    transformOrigin: `center bottom`,
                  }}
                />
              )}

              {/* กล่องคำพูดจำลอง */}
              {showTextbox && (
                <div className="absolute bottom-4 left-1/2 w-[92%] -translate-x-1/2 rounded-xl bg-white/95 backdrop-blur-sm p-4 border border-slate-200 shadow-lg pointer-events-none select-none transition-all z-20">
                  <div className="text-xs font-bold text-indigo-600">
                    {assetData?.file_name?.split(".")[0] || "Character Name"}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    "กล่องคำพูดพรีวิวการแสดงบทสนทนา"
                  </div>
                </div>
              )}
            </div>

            {/* แถบควบคุมใต้จอพรีวิว */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                * พรีวิวอ้างอิงอัตราส่วนจอ 1920x1080 (WYSIWYG)
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

          {/* ฝั่งขวา: แผงควบคุม (Sliders & Preview Align) */}
          <div className="flex flex-col justify-between rounded-xl bg-slate-50 p-5 border border-slate-100">
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800">
                  คอนโทรลพิกัด (Transform)
                </h4>
                <button
                  type="button"
                  onClick={handleAutoFit}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline"
                >
                  ปรับพอดีจอ
                </button>
              </div>

              {/* 🌟 ปุ่มเลือกตำแหน่งพรีวิว (Left / Center / Right) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  ทดลองวางตำแหน่งพรีวิว
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-lg">
                  {Object.keys(alignMap).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPreviewAlign(key)}
                      className={`py-1.5 text-[11px] font-bold rounded-md transition-all ${
                        previewAlign === key
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {key === "left" && "ซ้าย"}
                      {key === "center" && "กลาง"}
                      {key === "right" && "ขวา"}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200 my-2" />

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
                  min="0.1"
                  max="3.0"
                  step="0.01"
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
                  min="-800"
                  max="800"
                  step="5"
                  value={yoffset}
                  onChange={(e) => setYoffset(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* ปุ่ม Actions */}
            <div className="mt-6 flex gap-3 border-t border-slate-200 pt-4">
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
