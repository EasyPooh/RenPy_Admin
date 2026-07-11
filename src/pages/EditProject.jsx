import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import { Save, ArrowLeft, Gamepad2, ChevronDown } from "lucide-react";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 💾 สเตตกลุ่มควบคุมรูปภาพ (แยกออกจาก formData ชัดเจน)
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    titles: "",
    description: "",
    game_type: "",
    status: "",
    image_url: "",
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from("Projects")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (data) {
          setFormData(data);
          setOldImageUrl(data.image_url || ""); // 👈 จำ URL รูปเดิมไว้ตอนดึงข้อมูลมาครั้งแรก
        }
      } catch (error) {
        alert("ไม่พบข้อมูลโปรเจกต์นี้");
        navigate("/Allproject");
      } finally {
        setFetching(false);
      }
    };
    fetchProjectData();
  }, [id, navigate]);

  // 👈 1. ฟังก์ชันสำหรับลบรูปเดิมออกจาก Storage
  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl || imageUrl.startsWith("blob:")) return; // ดักจับถ้าไม่มีรูปเดิม หรือเป็นค่า blob หลุดมา

    try {
      const fileName = imageUrl.split("/").pop();
      await supabase.storage.from("Project-Thumbnail").remove([fileName]);
    } catch (err) {
      console.error("ลบรูปเก่าล้มเหลว:", err);
    }
  };

  // 👈 2. ฟังก์ชันอัปโหลดรูปภาพใหม่ขึ้น Storage
  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("Project-Thumbnail")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("Project-Thumbnail").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = formData.image_url;

      // เคสที่ 1: มีการเลือกรูปภาพใหม่เข้ามาเปลี่ยน
      if (imageFile) {
        // ลบรูปภาพเก่าออกจาก Storage ทันที (เพราะเราล็อคค่า URL เก่าไว้ใน oldImageUrl แล้ว)
        if (oldImageUrl) {
          await deleteImageFromStorage(oldImageUrl);
        }
        // อัปโหลดรูปใหม่ขึ้นไปแทน
        finalImageUrl = await uploadImage(imageFile);
      }
      // เคสที่ 2: ไม่ได้เลือกรูปใหม่ แต่กดเอารูปเดิมออกจนเกลี้ยง
      else if (formData.image_url === "" && oldImageUrl) {
        await deleteImageFromStorage(oldImageUrl);
      }

      const { error } = await supabase
        .from("Projects")
        .update({
          titles: formData.titles,
          description: formData.description,
          game_type: formData.game_type,
          status: formData.status,
          image_url: finalImageUrl, // มั่นใจได้ว่าเป็น URL จริงแน่นอน
        })
        .eq("id", id);

      if (error) throw error;
      alert("แก้ไขโปรเจกต์สำเร็จ!");
      navigate("/Allproject");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // สร้าง blob ชั่วคราวเก็บไว้ที่ previewUrl แยกต่างหาก
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
      setImageFile(file); // เก็บไฟล์ดิบไว้เตรียมอัพโหลด
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setImageFile(null);
    // ถ้าต้องการลบรูปภาพที่มีอยู่เดิมออกด้วยเมื่อเซฟ ให้ล้างค่าใน formData
    setFormData((prev) => ({ ...prev, image_url: "" }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ล้างหน่วยความจำ Blob เมื่อ 컴โพเนนต์ ถูกถอดออก (Best Practice)
  useEffect(() => {
    return () => {
      if (formData.image_url && formData.image_url.startsWith("blob:")) {
        URL.revokeObjectURL(formData.image_url);
      }
    };
  }, [formData.image_url]);

  if (fetching)
    return (
      <div className="text-center py-32 text-gray-400">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-start gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
              <Gamepad2 className="text-white" size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                แก้ไขโปรเจกต์
              </h1>
              <p className="text-gray-500 text-sm">
                ตรวจสอบและปรับปรุงข้อมูลโปรเจกต์ของคุณ
              </p>
            </div>
          </div>

          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12"
          >
            <div className="space-y-8">
              {/* ชื่อโปรเจกต์ */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-2">
                  ชื่อโปรเจกต์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ชื่อเกมของคุณ..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition text-base"
                  value={formData.titles}
                  onChange={(e) =>
                    setFormData({ ...formData, titles: e.target.value })
                  }
                />
              </div>

              {/* คำอธิบาย */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  rows="4"
                  placeholder="เล่าเรื่องย่อ..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition text-base"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* แถว Genre และ Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold mb-2">
                    แนวเกม
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น RPG..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition text-base"
                    value={formData.game_type}
                    onChange={(e) =>
                      setFormData({ ...formData, game_type: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold mb-2">
                    สถานะ
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none appearance-none bg-white transition text-base"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="developing">กำลังพัฒนา</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ภาพปกปัจจุบัน */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-2">
                  ภาพปกโปรเจกต์
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group transition-all duration-300">
                  {previewUrl || formData.image_url ? (
                    <>
                      <img
                        src={previewUrl || formData.image_url}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                        >
                          เปลี่ยนรูปใหม่
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                        >
                          เอารูปออก
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100/70 transition-colors border-2 border-dashed border-gray-200 rounded-2xl"
                    >
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>

                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500">
                          ยังไม่มีภาพปกโปรเจกต์
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          แนะนำขนาด 16:9 (คลิกเพื่ออัปโหลด)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ส่วนปุ่มดำเนินการ */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 transition shadow-sm disabled:bg-violet-300"
                >
                  <Save size={18} />
                  {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditProject;
