import InputField from './InputField';
import TextareaField from './TextareaField';
import SelectField from './SelectField';
import Button from './Button';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router';
import { useState } from 'react';

const CreateProjectForm = () => {
  const navigate = useNavigate();

  // 1. วาง State ไว้ด้านบนสุด
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titles: '',
    description: '',
    game_type: '',
    status: 'developing', // ค่าเริ่มต้น
    image_url: ''
  });

  // 2. วางฟังก์ชัน Logic ไว้ก่อนส่วน return
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  try {
      // บันทึกข้อมูลลง Supabase
      const { error } = await supabase
        .from('Projects') // <--- เปลี่ยนเป็นชื่อ Table ของคุณ
        .insert([
          { 
            titles: formData.titles, 
            description: formData.description, 
            game_type: formData.game_type,
            image_url: formData.image_url,
            // user_id: '...' หากมีระบบ Auth ให้ใส่ ID ของผู้ใช้ที่นี่
          }
        ]);

      if (error) throw error;

      // บันทึกสำเร็จ: ส่งกลับไปหน้าก่อนหน้า
      navigate(-1); 
      
    } catch (error) {
      alert('Error saving data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (!e || !e.target) return;
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value // ใช้ชื่อจาก attribute "name" มาเป็น key
  }));
};

  return (
    <form onSubmit={handleSubmit}>
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 w-full max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* ชื่อโปรเจกต์ */}
        <InputField 
          label="ชื่อโปรเจกต์"
          name="titles" // <--- เพิ่ม attribute name เพื่อใช้ใน handleChange
          value={formData.titles} // <--- เชื่อมกับ state
          onChange={handleChange} // <--- เพิ่ม onChange handler   
          required 
          placeholder="ชื่อเกมเช่น Summer Romance, Mystery School" 
        />

        {/* คำอธิบาย */}
        <TextareaField 
          label="คำอธิบาย" 
          name="description" // <--- เพิ่ม attribute name เพื่อใช้ใน handleChange
          value={formData.description} // <--- เชื่อมกับ state
          onChange={handleChange} // <--- เพิ่ม onChange handler
          placeholder="เล่าเรื่องย่อของเกม หรือคำอธิบายของเกมสั้นๆ" 
        />
        
        {/* Step 3: แถวคู่ แนวเกม และ สถานะ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="แนวเกม (Genre)" 
            name="game_type"
            value={formData.game_type}
            onChange={handleChange}
            placeholder="เช่น Romance, Mystery, Fantasy" 
          />
          <SelectField label="สถานะ" name="status" value={formData.status} onChange={handleChange} />
        </div>

        {/* Step 3: URL ภาพปก */}
        <InputField 
          label="URL ภาพปก (ไม่บังคับ)" 
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://..." 
        />
        
        {/* Step 4: Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Button variant="ghost">
            ยกเลิก
          </Button>
          <Button variant="primary" icon={Save} type="submit" disabled={loading}>
            สร้างโปรเจกต์
          </Button>
        </div>
      </div>
    </div>
    </form>
  );
};

export default CreateProjectForm;