import InputField from "./InputField";
import TextareaField from "./TextareaField";
import SelectField from "./SelectField";
import Button from "./Button";
import { Save, Upload } from "lucide-react"; // เพิ่มไอคอน Upload
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router";
import { useState } from "react";

const CreateProjectForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    titles: "",
    description: "",
    game_type: "",
    status: "developing",
    image_url: "",
  });

  // ฟังก์ชันอัปโหลดรูปไปยัง Supabase Storage
  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("Project-Thumbnail") // <--- ตรวจสอบชื่อ Bucket ใน Supabase ให้ตรงกัน
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("Project-Thumbnail").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      // 1. ถ้ามีการเลือกไฟล์ ให้ทำการอัปโหลดก่อน
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      // 2. บันทึกข้อมูลลงตาราง Projects
      const { error } = await supabase.from("Projects").insert([
        {
          titles: formData.titles,
          description: formData.description,
          game_type: formData.game_type,
          status: formData.status,
          image_url: finalImageUrl, // ใช้ URL ที่อัปโหลดเสร็จ หรือ URL ที่กรอกมา
        },
      ]);

      if (error) throw error;
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
            label="ชื่อโปรเจกต์"
            name="titles"
            value={formData.titles}
            onChange={handleChange}
            required
            placeholder="ชื่อเกม..."
          />

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

          {/* ส่วนอัปโหลดรูปภาพ */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              ภาพปกโปรเจกต์
            </label>
            <div className="flex flex-col gap-4">
              {/* เลือกอัปโหลดไฟล์ */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
              />
              {/* แสดงตัวอย่างรูปที่เลือก */}
              {selectedFile && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              variant="ghost"
              type="button"
              onClick={(e) => {
                e.preventDefault(); // ป้องกันพฤติกรรมฟอร์ม
                e.stopPropagation(); // หยุดการส่งต่อ Event ไปยัง form tag
                navigate(-1); // ย้อนกลับ
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
              {loading ? "กำลังบันทึก..." : "สร้างโปรเจกต์"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateProjectForm;
