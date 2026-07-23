import React from "react";

const features = [
  {
    title: "จัดการบทเนื้อเรื่อง",
    desc: "สร้างและแก้ไขบทพูด ฉาก ตัวละคร ได้ในที่เดียว",
  },
  {
    title: "คลัง Assets",
    desc: "จัดเก็บและจัดการไฟล์ภาพ เสียง ที่จำเป็นกับตัวเกม",
  },
  {
    title: "หลายโปรเจกต์",
    desc: "รองรับการสร้างและสลับทำงานได้หลายเกมพร้อมกัน",
  },
  {
    title: "Export พร้อมเล่น",
    desc: "ส่งออกเป็นตัวเกมสำเร็จรูป พร้อมเล่นได้ทันที",
  },
];

const Featuresection = () => (
  /* แยกโซนด้วย bg-slate-50/80 และใส่เส้นขอบ บน-ล่าง */
  <section className="py-20 px-8 bg-slate-50/80 border-y border-slate-200/60">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-3 text-slate-900">
          ฟีเจอร์ที่เว็บนี้มอบให้คุณ
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          ฟีเจอร์ที่จำเป็นสำหรับการพัฒนาเกมวิชวลโนเวลด้วย Ren'Py
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div
            key={f.id || i}
            className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group"
          >
            {/* เส้นไฮไลต์ม่วงที่จะโผล่มาตอน Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Featuresection;
