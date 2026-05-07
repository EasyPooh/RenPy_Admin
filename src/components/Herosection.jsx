import React from 'react'
import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';

const Herosection = () => (
  
  <section className="pt-32 pb-20 px-4 bg-linear-to-b from-purple-50 to-white text-center">
    {/*<span className="inline-block px-4 py-1 mb-6 text-sm font-medium text-purple-600 bg-purple-100 rounded-full">
      ✨ Visual Novel Script Editor
    </span>*/}
    <h1 className="text-5xl md:text-6xl font-bold mb-6">
      ให้การสร้าง <span className="text-purple-600">Visual Novel</span><br/>เป็นเรื่องง่าย
    </h1>
    <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg">
      ระบบสำหรับพัฒนา Ren'Py อย่างง่าย — จัดการบทเนื้อเรื่อง ตัวละคร และ Asset ของ Ren'Py ได้ครบจบในที่เดียว
    </p>
    <div className="flex justify-center gap-4">
        <Link to="/Allproject">
      <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
        Get Started →
      </button>
        </Link>
      <button className="border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
        คู่มือการใช้
      </button>
    </div>
  </section>
);

export default Herosection