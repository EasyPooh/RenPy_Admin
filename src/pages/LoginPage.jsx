import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // ตรวจสอบ path ให้ตรงกับโครงสร้างของคุณ

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // เพิ่ม State สำหรับจับสถานะกำลังโหลด

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // เริ่มต้นโหลดข้อมูล (ป้องกันผู้ใช้กดเบิ้ล)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"); // แสดง Error ถ้า Login ไม่ผ่าน
      setLoading(false);
    } else {
      alert("เข้าสู่ระบบสำเร็จ!");
      navigate("/Allproject"); // พาไปหน้าที่มีโฟลเดอร์ของเขา
    }
  };

  return (
    // คุมพื้นหลังโทนเดียวกับหน้าสร้างโปรเจกต์และหน้าสมัครสมาชิก
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      {/* Card Container: ขาว มน คลีน */}
      <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
        <button
          onClick={() => navigate("/")} // เปลี่ยน '/' เป็น Path หน้าแรกของระบบที่คุณต้องการ
          className="w-full text-slate-500 hover:text-[#8B5CF6] text-sm py-2 transition-all text-left "
        >
          ← กลับสู่หน้าหลัก
        </button>
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Ren'Py Admin</h2>
          <p className="text-sm text-slate-400 mt-1">
            ยินดีต้อนรับกลับมา กรุณาเข้าสู่ระบบ
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-all placeholder-slate-300"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-all placeholder-slate-300"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A78BFA] hover:bg-[#8B5CF6] disabled:bg-slate-300 text-white font-medium p-3 rounded-xl shadow-sm transition-all text-sm"
            >
              {loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ"}
            </button>

            {/* ปุ่มทางเลือกสำหรับผู้ใช้ที่ยังไม่มีบัญชี */}
            <button
              type="button"
              onClick={() => navigate("/RegisterPage")}
              className="w-full text-slate-500 hover:text-[#8B5CF6] text-sm py-2 transition-all text-center"
            >
              ยังไม่มีบัญชี?{" "}
              <span className="font-semibold underline">สมัครสมาชิกที่นี่</span>
            </button>
            {/* <button
              onClick={() => navigate("/")} // เปลี่ยน '/' เป็น Path หน้าแรกของระบบที่คุณต้องการ
              className="inline-block text-sm text-slate-400 hover:text-slate-600 transition-colors mb-5 text-center"
            >
              กลับสู่หน้าหลัก
            </button>*/}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
