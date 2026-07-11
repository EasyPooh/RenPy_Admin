import React from "react";
import { Link } from "react-router";

// 1. รับค่า session เข้ามาเป็น Prop
const Herosection = ({ session }) => (
  <section className="pt-32 pb-20 px-4 bg-linear-to-b from-purple-50 to-white text-center">
    <h1 className="text-5xl md:text-6xl font-bold mb-6">
      ให้การสร้าง <span className="text-purple-600">Visual Novel</span>
      <br />
      เป็นเรื่องง่าย
    </h1>
    <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg">
      ระบบสำหรับพัฒนา Ren'Py อย่างง่าย — จัดการบทเนื้อเรื่อง ตัวละคร และ Asset
      ของ Ren'Py ได้ครบจบในที่เดียว
    </p>
    <div className="flex justify-center gap-4">
      {/* 2. เช็กเงื่อนไขในช่อง to: ถ้าล็อกอินแล้วไป /Allproject ถ้ายังไม่ล็อกอินให้ไป /LoginPage */}
      <Link to={session ? "/Allproject" : "/LoginPage"}>
        <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition active:scale-95">
          Get Started →
        </button>
      </Link>
    </div>
  </section>
);

export default Herosection;
{
  /* 
      <button className="border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
        คู่มือการใช้
      </button>*/
}
