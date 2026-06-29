import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // 🔥 1. เพิ่มการ Import supabase (ปรับ Path ให้ตรงกับของคุณ)

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null); // 🔥 2. เพิ่ม State สำหรับเก็บข้อความข้อผิดพลาด
  const [loading, setLoading] = useState(false); // 🔥 3. เพิ่ม State สำหรับจัดการสถานะการโหลดข้อมูล

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. ตรวจสอบความถูกต้องเบื้องต้น: รหัสผ่านต้องตรงกัน
    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    // รหัสผ่านขั้นต่ำของ Supabase คือ 6 ตัวอักษร
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      // 2. เรียกใช้งาน Supabase Auth สำหรับสมัครสมาชิก
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) throw signUpError;

      // 3. จัดการหลังจากสมัครสมาชิกสำเร็จ
      if (data.user && !data.session) {
        alert("สมัครสมาชิกสำเร็จ!");
        //กรุณาเช็กกล่องข้อความในอีเมลของคุณเพื่อกดยืนยันการใช้งาน (เผื่อตอนเปิดให้เช็คเมล)
        navigate("/LoginPage");
      } else {
        navigate("/Allproject");
      }
    } catch (err) {
      // แปลความหมาย Error พื้นฐานให้เป็นภาษาไทยเข้าใจง่าย
      if (err.message === "User already registered") {
        setError("อีเมลนี้ถูกใช้งานในระบบแล้ว");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            สร้างบัญชีผู้ใช้ใหม่
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* 🔥 4. เพิ่มกล่องแสดง Error Alert บนหน้าจอเมื่อเกิดข้อผิดพลาด */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl transition-all">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-all placeholder-slate-300"
              placeholder="กรอกอีเมลของคุณ..."
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-all placeholder-slate-300"
              placeholder="กำหนดรหัสผ่าน..."
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-all placeholder-slate-300"
              placeholder="กรอกรหัสผ่านอีกครั้ง..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            {/* 🔥 5. ปรับปุ่มสมัครสมาชิกให้ล็อกตัวเอาไว้ (disabled) และเปลี่ยนข้อความเมื่ออยู่ในสถานะ loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A78BFA] hover:bg-[#8B5CF6] text-white font-medium p-3 rounded-xl shadow-sm transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังลงทะเบียน..." : "สมัครสมาชิก"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/LoginPage")}
              className="w-full text-slate-500 hover:text-slate-700 text-sm py-2 transition-all"
            >
              ยกเลิก และกลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
