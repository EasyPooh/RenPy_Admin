import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { Save, ArrowLeft, Gamepad2, ChevronDown, X } from 'lucide-react';

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    titles: '',
    description: '',
    game_type: '',
    status: '',
    image_url: ''
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from('Projects')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data) setFormData(data);
      } catch (error) {
        alert('ไม่พบข้อมูลโปรเจกต์นี้');
        navigate('/Allproject');
      } finally {
        setFetching(false);
      }
    };
    fetchProjectData();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('Projects')
        .update({
          titles: formData.titles,
          description: formData.description,
          game_type: formData.game_type,
          status: formData.status,
          image_url: formData.image_url
        })
        .eq('id', id);
      if (error) throw error;
      alert('แก้ไขโปรเจกต์สำเร็จ!');
      navigate('/Allproject');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-32 text-gray-400">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 py-10 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* --- Header Section (ตามภาพ image_6.png) --- */}
          <div className="flex items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition">
              <ArrowLeft size={22} />
            </button>
            <div className="flex items-center gap-5 flex-1">
              {/* ไอคอนจอยเกมในกรอบม่วง */}
              <div className="p-4.5 bg-violet-600 text-white rounded-3xl shadow-lg shadow-violet-100 flex items-center justify-center">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">แก้ไขโปรเจกต์</h1>
                <p className="text-gray-500 mt-1.5 text-base">ตรวจสอบและปรับปรุงข้อมูลโปรเจกต์ของคุณ</p>
              </div>
            </div>
          </div>

          {/* --- Form Section (Layout ตามภาพ image_6.png/image_7.png) --- */}
          <form onSubmit={handleUpdate} className="bg-white p-10 md:p-12 rounded-[2rem] shadow-lg shadow-gray-50/50 border border-gray-100 space-y-10">
            
            {/* ชื่อโปรเจกต์ */}
            <div className="space-y-3">
              <label className="block text-lg font-bold text-gray-900 flex items-center gap-1.5">
                ชื่อโปรเจกต์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ชื่อเกมของคุณ..."
                className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-300 outline-none transition duration-150 text-base placeholder:text-gray-300"
                value={formData.titles}
                onChange={(e) => setFormData({ ...formData, titles: e.target.value })}
              />
            </div>

            {/* คำอธิบาย */}
            <div className="space-y-3">
              <label className="block text-lg font-bold text-gray-900">คำอธิบาย</label>
              <textarea
                rows="6"
                placeholder="เล่าเรื่องย่อหรือจุดเด่นของเกม..."
                className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-300 outline-none transition duration-150 text-base placeholder:text-gray-300"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* แถว Genre และ Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {/* แนวเกม */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-900">แนวเกม (Genre)</label>
                <input
                  type="text"
                  placeholder="เช่น Visual Novel, RPG..."
                  className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-300 outline-none transition duration-150 text-base placeholder:text-gray-300"
                  value={formData.game_type}
                  onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
                />
              </div>
              
              {/* สถานะ */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-900">สถานะ</label>
                <div className="relative">
                  <select 
                    className="w-full px-6 py-4.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-300 outline-none transition duration-150 text-base appearance-none bg-white"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="" disabled>เลือกสถานะ...</option>
                    <option value="developing">กำลังพัฒนา</option>
                    <option value="completed">เสร็จสมบูรณ์</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ส่วนแสดงรูปภาพเดิม */}
            {formData.image_url && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                 <label className="block text-lg font-bold text-gray-900">ภาพปกปัจจุบัน</label>
                 <img src={formData.image_url} alt="Current" className="w-64 h-36 object-cover rounded-2xl shadow-inner border" onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found' }}/>
              </div>
            )}

            {/* --- Buttons Section (ตามภาพ image_7.png) --- */}
            <div className="pt-10 border-t border-gray-100 flex items-center justify-end gap-5">
              <button 
                type="button"
                onClick={() => navigate('/Allproject')}
                className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
              >
                ยกเลิก
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="group px-10 py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-violet-100 disabled:bg-violet-300 active:scale-95"
              >
                <Save className="w-6 h-6" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}

export default EditProject;