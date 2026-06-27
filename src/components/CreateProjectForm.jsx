import InputField from "./InputField";
import TextareaField from "./TextareaField";
import SelectField from "./SelectField";
import Button from "./Button";
import { Save } from "lucide-react";
import { supabase, MOCK_USER_ID } from "../lib/supabaseClient";
import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react"; // 👈 เพิ่มการ import useRef เข้ามาจัดการการล้างค่าอินพุต
import { chapterService } from "../lib/chapterService";

const CreateProjectForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    titles: "",
    description: "",
    game_type: "",
    status: "developing",
    image_url: "",
  });

  // 👈 เพิ่ม ref สำหรับอ้างอิงและล้างค่ากล่องเลือกไฟล์ของเบราว์เซอร์
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    // สร้าง Object URL สำหรับพรีวิวรูป
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // ล้างหน่วยความจำ (Revoke) เมื่อปิดฟอร์มหรือเปลี่ยนรูปใหม่
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // 👈 เพิ่มฟังก์ชันจัดการลบรูปภาพพรีวิวออก
  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // ล้างชื่อไฟล์ค้างในอินพุต
    }
  };

  // ฟังก์ชันอัปโหลดรูปไปยัง Supabase Storage
  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("Project-Thumbnail")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("Project-Thumbnail").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titles || formData.titles.trim() === "") {
      alert("กรุณากรอกชื่อโปรเจคด้วยครับ!");
      return; // สั่งหยุดทำงานทันที ไม่ให้วิ่งไปหา Supabase
    }
    setLoading(true);

    try {
      let finalImageUrl = "";

      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const { data, error } = await supabase
        .from("Projects")
        .insert([
          {
            titles: formData.titles.trim(),
            description: formData.description,
            game_type: formData.game_type,
            status: formData.status,
            image_url: finalImageUrl,
            user_id: MOCK_USER_ID, // ใช้ Mock User ID ที่เรากำหนดไว้ใน supabaseClient.js
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newProject = data[0]; // ดึงข้อมูลโปรเจคแถวแรกที่เพิ่งสร้าง
        const projectId = newProject.id; // สมมติว่าคอลัมน์ ID ของคุณชื่อ 'id' (ถ้าชื่อ project_id ให้เปลี่ยนตามนะครับ)

        // เรียกใช้ฟังก์ชันจาก chapterService เพื่อสร้างบทแรกอัตโนมัติ
        // (อย่าลืม import createStartChapter มาจาก chapterService.js ที่ด้านบนสุดของไฟล์นี้นะครับ)
        await chapterService.createStartChapter(projectId);
      }

      alert("สร้างโปรเจคสำเร็จแล้ว!");

      // 🧹 [จุดแก้ไขที่ 2] เคลียร์หน่วยความจำ Blob และไฟล์ออกให้หมดจดก่อนย้ายหน้า
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);

      navigate(-1);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 w-full max-w-3xl mx-auto">
        <div className="space-y-8">
          <InputField
            label="ชื่อโปรเจค"
            name="titles"
            value={formData.titles}
            onChange={handleChange}
            required
            placeholder="ชื่อเกม..."
          />
          <label className="block text-slate-700 font-bold mb-2">
            คำอธิบาย
          </label>
          <TextareaField
            label="คำอธิบาย"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="เล่าเรื่องย่อ..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="แนวเกม (Genre)"
              name="game_type"
              value={formData.game_type}
              onChange={handleChange}
              placeholder="เช่น Romance..."
            />
            <SelectField
              label="สถานะ"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="developing">กำลังพัฒนา</option>
              <option value="completed">เสร็จสิ้น</option>
            </SelectField>
          </div>

          {/* === ส่วนอัปโหลดรูปภาพดีไซน์ใหม่ ปรับขนาดฟอนต์หัวข้อให้เท่ากันเป๊ะ === */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold mb-2">
              ภาพปกโปรเจค
            </label>

            {/* อินพุตรับไฟล์แบบซ่อนเพื่อความสะอาดตา */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedFile(file);
              }}
              className="hidden"
            />

            {/* Container หลักควบคุมหน้าตาพรีวิวและกล่องอัปโหลด */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group transition-all duration-300">
              {selectedFile ? (
                /* เคสที่ 1: เลือกรูปภาพแล้ว -> แสดงรูปภาพพรีวิวพร้อม Overlay ปุ่มควบคุมตอน Hover */
                <>
                  <img
                    src={previewUrl}
                    alt="Preview"
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
                /* เคสที่ 2: ยังไม่มีรูปภาพ -> แสดงกล่องขอบปรุมินิมอลสไตล์เดียวกับหน้าแก้ไข */
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
                      คลิกเพื่ออัปโหลดภาพปก
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      แนะนำขนาด 16:9 (หรือลากไฟล์มาวาง)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              variant="ghost"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(-1);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              icon={Save}
              type="submit"
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "สร้างโปรเจค"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateProjectForm;
