import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // import instance ของคุณ

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message); // แสดง Error ถ้า Login ไม่ผ่าน
    } else {
      alert("เข้าสู่ระบบสำเร็จ!");
      navigate("/Allproject"); // พาไปหน้าที่มีโฟลเดอร์ของเขา
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleLogin}
        className="p-8 border rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h2>

        <input
          type="email"
          placeholder="อีเมล"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
