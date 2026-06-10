import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const AssetListView = ({ assets = [], onOpenEdit, onRefresh, projectId }) => {
  // ฟังก์ชันดึง URL รูปภาพจาก Storage จริงมาแสดงผล
  const getAssetPreviewUrl = (filePath) => {
    if (!filePath || typeof filePath !== "string") return null;
    const { data } = supabase.storage
      .from("game-assets")
      .getPublicUrl(filePath);
    return data?.publicUrl || null;
  };

  // ฟังก์ชันกำหนดสีและข้อความของ Badge ตามประเภท
  const getTypeBadge = (type) => {
    switch (type) {
      case "background":
        return {
          text: "ภาพพื้นหลัง",
          bg: "bg-blue-50 text-blue-600 border border-blue-100",
        };
      case "sprite":
        return {
          text: "ภาพตัวละคร",
          bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        };
      case "music":
        return {
          text: "เพลงประกอบ",
          bg: "bg-amber-50 text-amber-600 border border-amber-100",
        };
      case "sound_effect":
        return {
          text: "เอฟเฟกต์เสียง",
          bg: "bg-purple-50 text-purple-600 border border-purple-100",
        };
      default:
        return {
          text: "ทั่วไป",
          bg: "bg-gray-50 text-gray-600 border border-gray-100",
        };
    }
  };

  // ฟังก์ชันคำนวณขนาดไฟล์
  const formatFileSize = (sizeInKb) => {
    if (sizeInKb === undefined || sizeInKb === null || isNaN(sizeInKb)) {
      return "0 KB";
    }
    if (sizeInKb < 1024) {
      return `${parseFloat(sizeInKb).toFixed(1)} KB`;
    }
    return `${(parseFloat(sizeInKb) / 1024).toFixed(1)} MB`;
  };

  // ฟังก์ชันจัดการการลบสินทรัพย์
  const handleDelete = async (asset) => {
    console.log("🔎 ตรวจสอบข้อมูล asset ที่ส่งเข้ามา:", asset);
    if (!asset || !asset.id) {
      alert("ไม่พบข้อมูล asset ที่ต้องการลบ");
      return;
    }
    // TODO: ใส่ Logic การลบไฟล์จาก Supabase ตรงนี้เพิ่มเติมตามต้องการ
  };

  return (
    <div className="w-full p-4">
      {assets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400">ยังไม่มี Assets ในโปรเจกต์นี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map((asset) => {
            const badge = getTypeBadge(asset.file_type);
            const previewUrl = getAssetPreviewUrl(asset.storage_path);
            const isImageAsset =
              asset.file_type === "background" || asset.file_type === "sprite";
            const isAudioAsset =
              asset.file_type === "music" || asset.file_type === "sound_effect";

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/*ส่วนแสดงตัวอย่าง (Thumbnail) */}
                <div className="w-full h-44 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
                  {isImageAsset && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={asset.file_name}
                      className={`"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      ${asset.file_type === "sprite" ? "object-top" : "object-center"}`}
                    />
                  ) : isImageAsset ? (
                    <div className="text-4xl select-none">🖼️</div>
                  ) : isAudioAsset ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-xl text-amber-600 animate-pulse-slow">
                        🎵
                      </div>
                      <span className="text-xs text-gray-400 font-medium tracking-wide">
                        AUDIO FILE
                      </span>
                    </div>
                  ) : (
                    <div className="text-4xl select-none">📁</div>
                  )}
                </div>

                {/*ส่วนข้อมูลสินทรัพย์ (Content) */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-medium text-gray-900 truncate mb-2"
                      title={asset.file_name}
                    >
                      {asset.file_name || "ไม่มีชื่อ Asset"}
                    </h3>

                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${badge.bg}`}
                      >
                        {badge.text}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {formatFileSize(asset.size_kb || asset.file_size_kb)}
                      </span>
                    </div>
                  </div>

                  {/*ปุ่มจัดการ (Actions) */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onOpenEdit && onOpenEdit(asset)}
                      className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors active:bg-gray-200"
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(asset)}
                      className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors active:bg-red-200"
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssetListView;
