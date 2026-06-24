// src/components/Asset/AssetModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useImageCompressor } from "../../hooks/useImageCompressor";

const AssetModal = ({
  isOpen,
  onClose,
  onRefresh,
  mode,
  selectedAsset,
  projectId,
}) => {
  const { compressImage, isCompressing } = useImageCompressor();

  const [assetType, setAssetType] = useState("background");
  const [assetName, setAssetName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mainTag, setMainTag] = useState("");
  const [expressionTag, setExpressionTag] = useState("");
  const [description, setDescription] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (mode === "edit" && selectedAsset) {
      setAssetName(selectedAsset.file_name || selectedAsset.name || "");
      setAssetType(selectedAsset.file_type);
      setMainTag(selectedAsset.main_tag || "");
      setExpressionTag(selectedAsset.expression_tag || "");
      setDescription(selectedAsset.description || "");

      if (selectedAsset.storage_path) {
        const { data } = supabase.storage
          .from("game-assets")
          .getPublicUrl(selectedAsset.storage_path);
        setPreviewUrl(data.publicUrl);
      }
    } else {
      setAssetName("");
      setAssetType("background");
      setSelectedFile(null);
      setPreviewUrl("");
      setMainTag("");
      setExpressionTag("");
      setDescription("");
    }
  }, [mode, selectedAsset, isOpen]);

  useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  if (!isOpen) return null;

  // 🌟 จุดปรับปรุงที่ 1: ระบบแกะชื่อไฟล์เป็นแท็กอัจฉริยะ (Smart Tag Auto-Fill)
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        // 1. ส่งไฟล์เข้ากระบวนการบีบอัดและย่อความสูงเหลือ 1080px (รักษาสัดส่วนเดิม)
        // *หากไม่ใช่ไฟล์รูปภาพ ตัว Hook จะคืนไฟล์ดิบเดิมกลับมาให้ทันทีโดยไม่ประมวลผล*
        const optimizedFile = await compressImage(file, 1080);

        console.log(
          " ขนาดไฟล์เดิมก่อนบีบ:",
          (file.size / 1024 / 1024).toFixed(2),
          "MB",
        );
        console.log(
          " ขนาดไฟล์ใหม่หลังบีบ:",
          (optimizedFile.size / 1024).toFixed(2),
          "KB",
        );

        // 2. นำไฟล์ที่ผ่านการปรับขนาดและบีบอัดแล้ว เก็บเข้า State ของระบบ
        // (State ตัวนี้จะถูกส่งไปยิงขึ้น Supabase Storage ในฟังก์ชันอัปโหลดของคุณ)
        setSelectedFile(optimizedFile);

        // 3. แยกชื่อไฟล์ออกจากนามสกุล (คงโค้ด Logic เดิมของคุณไว้ทั้งหมดอย่างปลอดภัย)
        const rawName = optimizedFile.name.split(".").slice(0, -1).join(".");
        setAssetName(rawName);

        // 4. ถ้าเป็นประเภท Sprite จะแยก Pattern ชื่อไฟล์เพื่อเดาแท็กให้ผู้ใช้ล่วงหน้า
        if (assetType === "sprite") {
          // รองรับทั้งการคั่นด้วย _ หรือ - (เช่น fuse_smile หรือ fuse-smile)
          const parts = rawName.split(/[_-]/);
          if (parts.length >= 2) {
            // ส่วนแรกมักเป็นชื่อตัวละคร, ส่วนสองเป็นสีหน้า
            setMainTag(parts[0].trim().toLowerCase());
            setExpressionTag(parts[1].trim().toLowerCase());
          } else if (parts.length === 1) {
            // มีคำเดี่ยวๆ ยัดเป็นชื่อตัวละครไว้ก่อน
            setMainTag(parts[0].trim().toLowerCase());
          }
        }
      } catch (error) {
        // ดักจับกรณีเกิดข้อผิดพลาดในการประมวลผลไฟล์ผ่าน Canvas API
        console.error("เกิดข้อผิดพลาดในการบีบอัดรูปภาพ:", error);
        alert(
          "ระบบไม่สามารถประมวลผลรูปภาพนี้ได้ กรุณาลองอัปโหลดใหม่อีกครั้งครับ",
        );
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetName.trim()) return alert("กรุณากรอกชื่อ asset");

    // 🌟 จุดปรับปรุงที่ 2: เช็กความพร้อมของแท็กถ้าเป็น Sprite
    if (assetType === "sprite" && (!mainTag.trim() || !expressionTag.trim())) {
      return alert(
        "ภาพตัวละคร (Sprite) จำเป็นต้องระบุทั้ง ชื่อตัวละคร (Main Tag) และ สีหน้า (Expression)",
      );
    }

    try {
      setIsSubmitting(true);
      let filePath = selectedAsset?.storage_path || "";
      let fileSize = selectedAsset?.file_size_kb || 0;

      if (selectedFile) {
        if (mode === "edit" && selectedAsset?.storage_path) {
          await supabase.storage
            .from("game-assets")
            .remove([selectedAsset.storage_path]);
        }

        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const customPath = `${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("game-assets")
          .upload(customPath, selectedFile);

        if (uploadError) throw uploadError;
        filePath = customPath;
        fileSize = Math.round(selectedFile.size / 1024);
      } else if (mode === "upload") {
        return alert("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");
      }

      // ทำความสะอาดข้อมูลแท็กเพื่อความเสถียรของโค้ดสคริปต์ปลายทาง
      const finalMainTag = mainTag.trim();
      const finalExpressionTag = expressionTag.trim();

      const assetPayload = {
        project_id: projectId,
        file_name: assetName.trim(),
        file_type: assetType,
        storage_path: filePath,
        file_size_kb: fileSize,
        description: description.trim() || null,
        main_tag: assetType === "sprite" ? finalMainTag : null,
        expression_tag: assetType === "sprite" ? finalExpressionTag : null,
      };

      if (mode === "upload") {
        const { error: insertError } = await supabase
          .from("assets")
          .insert([assetPayload]);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("assets")
          .update(assetPayload)
          .eq("id", selectedAsset.id);
        if (updateError) throw updateError;
      }

      alert("บันทึกข้อมูลและอัปเดตไฟล์ asset สำเร็จ!");
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error submitting asset modal:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isImageType = assetType === "background" || assetType === "sprite";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "แก้ไขไฟล์ asset" : "อัปโหลดไฟล์ใหม่"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Content Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0">
            {/* 1. ประเภท Assets */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                ประเภท Assets <span className="text-red-500">*</span>
              </label>
              <select
                value={assetType}
                onChange={(e) => {
                  setAssetType(e.target.value);
                  handleRemoveFile();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
              >
                <option value="background">ภาพพื้นหลัง (Background)</option>
                <option value="sprite">ภาพตัวละคร (Sprite)</option>
                <option value="music">เพลงประกอบ (Music)</option>
                <option value="sound_effect">
                  เอฟเฟกต์เสียง (Sound Effect)
                </option>
              </select>
            </div>

            {/* 🌟 จุดปรับปรุงที่ 3: เพิ่มคำอธิบายกำกับ (Helper text) และปรับ Placeholder ของ Sprite Input */}
            {assetType === "sprite" && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 animate-in fade-in duration-200">
                <p className="text-[11px] text-amber-600 font-medium">
                  ⚠️
                  แท็กเหล่านี้จะถูกใช้ในการจับคู่กับชื่อตัวละครและสีหน้าในระบบเนื้อเรื่องอัตโนมัติ
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ตัวละคร (Main Tag) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mainTag}
                      onChange={(e) => setMainTag(e.target.value)}
                      placeholder="เช่น fuse, phu"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      สีหน้า (Expression){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expressionTag}
                      onChange={(e) => setExpressionTag(e.target.value)}
                      placeholder="เช่น smile, sad, angry"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. กล่องอัปโหลดไฟล์ */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                อัปโหลดไฟล์ asset{" "}
                {mode === "edit" && "(อัปโหลดไฟล์ใหม่เพื่อเปลี่ยนไฟล์เดิม)"}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={isImageType ? "image/*" : "audio/*"}
                className="hidden"
              />

              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group transition-all duration-300">
                {previewUrl ? (
                  <>
                    {isImageType ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-[center_10%]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50/50 gap-2 px-4">
                        <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-indigo-700 text-center truncate max-w-[90%]">
                          {selectedFile
                            ? selectedFile.name
                            : selectedAsset?.file_name ||
                              "ไฟล์เสียงประกอบในระบบ"}
                        </p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        เปลี่ยนไฟล์ใหม่
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                      >
                        เอาไฟล์ออก
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-gray-100/70 transition-colors border-2 border-dashed border-gray-200 rounded-2xl"
                  >
                    {isImageType ? (
                      <svg
                        className="w-9 h-9 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-9 h-9 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-500">
                        คลิกเพื่ออัปโหลด{" "}
                        {isImageType ? "ภาพ Asset" : "ไฟล์เสียงประกอบ"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isImageType
                          ? "แนะนำสัดส่วน 16:9 สำหรับฉากหลัง"
                          : "รองรับไฟล์รูปแบบ MP3, WAV, OGG"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. ชื่อ Asset ที่ต้องการ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ Asset ที่ต้องการ
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="กรอกชื่อเรียกไฟล์"
              />
            </div>

            {/* 5. คำอธิบาย / รายละเอียดเพิ่มเติม */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบาย / รายละเอียดเพิ่มเติม
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                placeholder="กรอกข้อมูลบันทึกความจำ หรือรายละเอียดสเปกของไฟล์นี้..."
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-white flex-shrink-0">
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
