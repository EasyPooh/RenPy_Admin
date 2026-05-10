import FormLabel from './FormLabel';
import { ChevronDown } from 'lucide-react';

const SelectField = ({ label, value, onChange, ...props }) => {
  return (
    <div className="w-full">
      <FormLabel label={label} />
      <div className="relative">
        <select
          {...props}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all appearance-none bg-white text-slate-700 font-medium cursor-pointer"

        >
          <option value="developing">กำลังพัฒนา</option>
          <option value="on-hold">พักการพัฒนา</option>
          <option value="completed">เสร็จสิ้น</option>
        </select>

        {/* ไอคอนลูกศรด้านขวาที่ช่วยให้ดูเป็นช่อง Select ที่สวยงาม */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
};

export default SelectField;