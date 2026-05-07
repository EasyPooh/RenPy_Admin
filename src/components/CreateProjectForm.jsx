import InputField from './InputField';
import TextareaField from './TextareaField';
import SelectField from './SelectField';
import Button from './Button';
import { Save } from 'lucide-react';

const CreateProjectForm = () => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 w-full max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* ชื่อโปรเจกต์ */}
        <InputField 
          label="ชื่อโปรเจกต์" 
          required 
          placeholder="ชื่อเกมเช่น Summer Romance, Mystery School" 
        />

        {/* คำอธิบาย */}
        <TextareaField 
          label="คำอธิบาย" 
          placeholder="เล่าเรื่องย่อของเกม หรือคำอธิบายของเกมสั้นๆ" 
        />
        
        {/* Step 3: แถวคู่ แนวเกม และ สถานะ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="แนวเกม (Genre)" 
            placeholder="เช่น Romance, Mystery, Fantasy" 
          />
          <SelectField label="สถานะ" />
        </div>

        {/* Step 3: URL ภาพปก */}
        <InputField 
          label="URL ภาพปก (ไม่บังคับ)" 
          placeholder="https://..." 
        />
        
        {/* Step 4: Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Button variant="ghost">
            ยกเลิก
          </Button>
          <Button variant="primary" icon={Save}>
            สร้างโปรเจกต์
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectForm;