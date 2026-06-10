// src/components/Asset/AssetListView.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const AssetListView = ({ assets = [], onOpenEdit, onRefresh, projectId }) => {
  // ฟังก์ชันดึง URL รูปภาพจาก Storage จริงมาแสดงผลตามต้องการ
  const getAssetPreviewUrl = (filePath) => {
    if (!filePath || typeof filePath !== "string") return null;
    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data?.publicUrl || null;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "background":
        return {
          text: "ภาพพื้นหลัง",
          bg: "bg-blue-50 text-blue-600 border-blue-100",
        };
      case "sprite":
        return {
          text: "ภาพตัวละคร",
          bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
        };
      case "music":
        return {
          text: "เพลงประกอบ",
          bg: "bg-amber-50 text-amber-600 border-amber-100",
        };
      case "sound_effect":
        return {
          text: "เอฟเฟกต์เสียง",
          bg: "bg-purple-50 text-purple-600 border-purple-100",
        };
      default:
        return {
          text: "ทั่วไป",
          bg: "bg-gray-50 text-gray-600 border-gray-100",
        };
    }
  };

  const renderThumbnail = (asset) => {
    if (asset.file_type === "background" || asset.file_type === "sprite") {
      const previewUrl = getAssetPreviewUrl(asset.storage_path);
      return previewUrl ? (
        <img
          src={previewUrl}
          alt={asset.name}
          className="w-12 h-12 object-cover rounded-lg border border-gray-100"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
          🖼️
        </div>
      );
    }
    if (asset.file_type === "music" || asset.file_type === "sound_effect") {
      return (
        <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-lg">
          🎵
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
        📁
      </div>
    );
  };

  const handleDelete = async (asset) => {
    console.log("🔎 ตรวจสอบข้อมูล asset ที่ส่งเข้ามา:", asset);
    if (!asset || !asset.id) {
      alert("ไม่พบข้อมูลสินทรัพย์ที่ต้องการลบ");
      return;
    }

    // กำหนดชื่อที่จะแสดงในตารางยืนยันการลบ
    const displayName = asset.name || asset.file_name || "ชิ้นงานนี้";
    const isConfirm = window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการลบ "${displayName}"?`,
    );
    if (!isConfirm) return;

    try {
      // 1. ลบไฟล์จริงใน Supabase Storage โดยใช้พาธตรงๆ จากตารางในฐานข้อมูล
      if (asset.storage_path) {
        console.log(
          "👉 กำลังส่งคำสั่งลบไปที่ Storage Path:",
          asset.storage_path,
        );

        const { data: storageData, error: storageError } =
          await supabase.storage
            .from("game-assets") // ⚠️ เช็กให้มั่นใจว่าชื่อ Bucket ใน Supabase สะกดแบบนี้เป๊ะๆ
            .remove([asset.storage_path]);

        if (storageError) {
          console.error("❌ Storage Error:", storageError.message);
          alert(
            `[Storage Error] ไม่สามารถลบไฟล์ในคลังได้: ${storageError.message}\n(ระบบจะระงับการลบข้อมูลในตารางไว้ชั่วคราว)`,
          );
          return; // 🛑 บล็อกไว้ ไม่ให้ไปลบแถวข้อมูลในตารางเด็ดขาด
        }
      }

      // 2. เมื่อลบไฟล์ใน Storage ผ่านแล้ว ค่อยสั่งลบข้อมูลแถวนี้ใน Database
      console.log("👉 กำลังลบข้อมูลในตาราง Database ID:", asset.id);
      const { error: dbError } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id);

      if (dbError) {
        console.error("❌ Database Error:", dbError.message);
        alert("เกิดข้อผิดพลาดในการลบฐานข้อมูล: " + dbError.message);
      } else {
        alert("ลบสินทรัพย์สำเร็จเรียบร้อยทั้งในคลังและฐานข้อมูล!");
        if (onRefresh) onRefresh(); // รีเฟรชหน้าจอแสดงผลใหม่
      }
    } catch (err) {
      console.error("❌ System Error:", err);
      alert("เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const formatFileSize = (sizeInKb) => {
    if (sizeInKb === undefined || sizeInKb === null || isNaN(sizeInKb)) {
      return "0 KB";
    }
    if (sizeInKb < 1024) {
      return `${parseFloat(sizeInKb).toFixed(1)} KB`;
    }
    return `${(parseFloat(sizeInKb) / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6">สื่อตัวอย่าง</th>
              <th className="py-4 px-6">ชื่อสินทรัพย์</th>
              <th className="py-4 px-6">ประเภท</th>
              <th className="py-4 px-6">ขนาดไฟล์</th>
              <th className="py-4 px-6 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {assets.map((asset) => {
              const badge = getTypeBadge(asset.file_type);
              return (
                <tr
                  key={asset.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">{renderThumbnail(asset)}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {asset.name}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${badge.bg}`}
                    >
                      {badge.text}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500">
                    {formatFileSize(asset.file_size_kb)}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => onOpenEdit(asset)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-2.5 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(asset)}
                      className="text-rose-600 hover:text-rose-900 font-medium text-xs bg-rose-50 px-2.5 py-1.5 rounded-md hover:bg-rose-100 transition-colors"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetListView;
