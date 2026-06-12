// src/lib/chapterService.js
import { supabase } from "./supabaseClient";

// 🛠️ ฟังก์ชันภายในสำหรับแปลง Title เป็น Label ที่ปลอดภัยสำหรับ Ren'Py
const generateLabelFromTitle = (title, currentCount) => {
  if (!title) return `chapter_${currentCount + 1}`;

  let label = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')          // เปลี่ยนเว้นวรรคเป็น _
    .replace(/[^a-z0-9_]/g, '');   // ลบภาษาไทยและอักขระพิเศษออกทั้งหมด

  // หากเป็นภาษาไทยล้วน พอโดนลบหมดแล้วจะกลายเป็นค่าว่าง ให้ตั้งชื่อทดแทนอัตโนมัติ
  if (!label || label === '_') {
    label = `chapter_${currentCount + 1}`;
  }

  return label;
};

export const chapterService = {
  // ดึงข้อมูลบทเรียนทั้งหมด
  async getChapters(projectId) {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data;
  },

  // ➕ ปรับปรุงการสร้าง Chapter ใหม่ให้เจน Label อัตโนมัติภายในนี้เลย
  async createChapter(projectId, title, currentCount) {
    // เสก label_name ที่ปลอดภัยขึ้นมาตรงนี้
    const automaticallyGeneratedLabel = generateLabelFromTitle(title, currentCount);

    const { data, error } = await supabase
      .from("chapters")
      .insert([
        {
          project_id: projectId,
          chapter_titles: title,
          label_name: automaticallyGeneratedLabel, // ส่งค่าที่เซฟรันจากระบบเข้าไป
          sort_order: currentCount,
          chapter_status: "draft",
          chapter_tags: ["จุดเริ่มต้น"] // หรือเซ็ตเป็นหมวดหมู่เริ่มต้นตามที่คุณต้องการ
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data; // ส่งข้อมูลแถวใหม่กลับไปให้ไฟล์แม่ใช้งานต่อ
  },

  // อัปเดตเฉพาะชื่อบท (Title) เท่านั้น ล็อก label_name ไว้ไม่ให้ขยับ
  async updateChapterName(chapterId, newTitle) {
    const { data, error } = await supabase
      .from("chapters")
      .update({ title: newTitle }) // อัปเดตแค่คอลัมน์ title
      .eq("id", chapterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ลบบทเรียน
  async deleteChapter(chapterId) {
    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) throw error;
    return true;
  }
};