import React from "react";

const features = [
  {
    title: "จัดการบทเนื้อเรื่อง",
    desc: "สร้างและแก้ไขบทพูด ฉาก ตัวละคร",
    icon: "📚",
  },
  { title: "คลัง Asset", desc: "อัปโหลดและจัดการไฟล์ภาพพื้นหลัง", icon: "🎵" },
  { title: "หลายโปรเจกต์", desc: "รองรับการทำงานหลายเกมพร้อมกัน", icon: "👥" },
  {
    title: "Export พร้อมใช้",
    desc: "นำเข้า/ส่งออกข้อมูลผ่าน JSON ",
    icon: "⚡",
  },
];

const Featuresection = () => (
  <section className="py-20 px-8 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-bold mb-4">ทุกอย่างที่คุณต้องการ</h2>
      <p className="text-gray-500">
        ฟีเจอร์ครบสำหรับการพัฒนา Visual Novel ด้วย RenPy
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {features.map((f, i) => (
        <div
          key={i}
          className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="text-3xl mb-4">{f.icon}</div>
          <h3 className="font-bold mb-3">{f.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Featuresection;
