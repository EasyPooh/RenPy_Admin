// src/components/Asset/AssetModal.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const AssetModal = ({
  isOpen,
  onClose,
  onRefresh,
  mode,
  selectedAsset,
  projectId,
}) => {
  const [assetType, setAssetType] = useState("background");
  const [assetName, setAssetName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && selectedAsset) {
      setAssetName(selectedAsset.name);
      setAssetType(selectedAsset.file_type); // แก้ไขคำสะกดผิดสะกดถูกตรงนี้แล้วครับ
    } else {
      setAssetName("");
      setAssetType("background");
      setSelectedFile(null);
    }
  }, [mode, selectedAsset, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!assetName) {
        setAssetName(file.name.split(".").slice(0, -1).join("."));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetName.trim()) return alert("กรุณากรอกชื่อสินทรัพย์");

    try {
      setIsSubmitting(true);
      let filePath = selectedAsset?.storage_path || "";
      let fileSize = selectedAsset?.file_size_kb || 0;

      // 1. เคสอัปโหลดไฟล์ใหม่เข้า Storage (ถ้ามี)
      if (selectedFile) {
        // 🎯 [แก้ไขเพิ่มเติม]: หากเป็นการแก้ไขและมีการเลือกไฟล์ใหม่ ให้ลบไฟล์เก่าออกจาก Storage ก่อนเพื่อป้องกันไฟล์ค้าง
        if (mode === "edit" && selectedAsset?.storage_path) {
          console.log(
            "กำลังเคลียร์ไฟล์เก่าออกจาก Storage:",
            selectedAsset.storage_path,
          );
          await supabase.storage
            .from("game-assets")
            .remove([selectedAsset.storage_path]);
        }

        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`; // ใช้ตรรกะเวลาพ่วงสุ่มเพื่อไม่ให้ชื่อไฟล์ซ้ำกัน
        const customPath = `${projectId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("game-assets")
          .upload(customPath, selectedFile);

        if (uploadError) throw uploadError;
        filePath = customPath;
        fileSize = Math.round(selectedFile.size / 1024); // บันทึกขนาดไฟล์เป็น KB
      } else if (mode === "upload") {
        return alert("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");
      }

      // 2. จัดการฐานข้อมูล Database
      if (mode === "upload") {
        const { error: insertError } = await supabase.from("assets").insert([
          {
            project_id: projectId,
            file_name: assetName,
            file_type: assetType,
            storage_path: filePath,
            file_size_kb: fileSize,
          },
        ]);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("assets")
          .update({
            file_name: assetName,
            file_type: assetType,
            storage_path: filePath,
            file_size_kb: fileSize,
          })
          .eq("id", selectedAsset.id);
        if (updateError) throw updateError;
      }

      alert("บันทึกข้อมูลและอัปเดตไฟล์สินทรัพย์สำเร็จ!");
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error submitting asset modal:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "แก้ไขไฟล์สินทรัพย์" : "อัปโหลดไฟล์ใหม่"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ Asset ที่ต้องการ
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="กรอกชื่อเรียกไฟล์"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประเภท Assets
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="background">ภาพพื้นหลัง (Background)</option>
              <option value="sprite">ภาพตัวละคร (Sprite)</option>
              <option value="music">เพลงประกอบ (Music)</option>
              <option value="sound_effect">เอฟเฟกต์เสียง (Sound Effect)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อัปโหลดไฟล์{" "}
              {mode === "edit" && "(อัปโหลดไฟล์ใหม่หากต้องการเปลี่ยนชิ้นเดิม)"}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept={
                assetType === "background" || assetType === "sprite"
                  ? "image/*"
                  : "audio/*"
              }
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? "กำลังบันทึก..." : "ยืนยันข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;
