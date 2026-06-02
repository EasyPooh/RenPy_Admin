import React from "react";
import FormLabel from "./FormLabel";

const TextareaField = ({ label, placeholder, value, onChange, ...props }) => {
  return (
    <div className="w-full mb-4">
      {/* ถ้ามีส่ง prop label มา ให้แสดงชื่อหัวข้อฟิลด์ */}
      {label && <FormLabel>{label}</FormLabel>}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white text-slate-700 font-medium min-h-[100px] resize-y"
      />
    </div>
  );
};

export default TextareaField;
