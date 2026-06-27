import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateProjectHeader = ({ backTo = "/AllProject" }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-start gap-4 mb-8">
      {/* ปุ่มย้อนกลับ */}
      <button
        onClick={() => navigate(backTo)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* ไอคอนโปรเจค (สีม่วง) */}
      <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
        <Gamepad2 className="text-white" size={28} />
      </div>

      {/* หัวข้อ */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">สร้างโปรเจคใหม่</h1>
        <p className="text-gray-500 text-sm">กรอกข้อมูลโปรเจคของคุณ</p>
      </div>
    </div>
  );
};

export default CreateProjectHeader;
