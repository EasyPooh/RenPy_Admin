// src/lib/chapterService.js
import { supabase } from "./supabaseClient";

// 🛠️ ฟังก์ชันภายในสำหรับแปลง Title เป็น Label ที่ปลอดภัยสำหรับ Ren'Py
const generateLabelFromTitle = (title, currentCount) => {
  if (!title) return `chapter_${currentCount + 1}`;
  
  let label = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // เปลี่ยนเว้นวรรคเป็น _
    .replace(/[^a-z0-9_]/g, '');    // ลบภาษาไทยและอักขระพิเศษออกทั้งหมด

  // หากชื่อบทเป็นภาษาไทยล้วน พอโดนลบแล้วจะกลายเป็นค่าว่าง ให้ตั้งชื่อทดแทนอัตโนมัติ
  if (!label || label === '') {
    label = `chapter_${currentCount + 1}`;
  }
  return label;
};

export const chapterService = {
  
  // 1. ดึงข้อมูลบทเรียนทั้งหมด (แยกตาม project_id และเรียงตามลำดับ)
  async getChapters(projectId) {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
  },

  // 2. 🌟 ฟังก์ชันพิเศษ: สำหรับสร้างบทเริ่มต้น (Start Chapter) อัตโนมัติทันทีที่สร้างโปรเจกต์ใหม่
  async createStartChapter(projectId) {
    const { data, error } = await supabase
      .from("chapters")
      .insert([
        {
          project_id: projectId,
          chapter_titles: "เริ่มเกม (Start)",
          label_name: "start", // ล็อกตายตัวสำหรับ Ren'Py เสมอ
          sort_order: 0,      // เป็นบทแรกสุด
          chapter_status: "draft",
          chapter_tags: ["จุดเริ่มต้น"],
        }
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 3. ฟังก์ชันสร้างบทเรียนทั่วไป (ปุ่มกดเพิ่มบทเองในหน้าจัดการเนื้อเรื่อง)
  async createChapter(projectId, title, sortOrder, tags, status) {
    //const automaticallyGeneratedLabel = generateLabelFromTitle(title, sortOrder);
    const autoLabelName = `chapter_${Date.now()}`;
    const isFirstChapter = sortOrder === 0;
    const { data, error } = await supabase
      .from("chapters")
      .insert([
        {
          project_id: projectId,
          chapter_titles: title || `บทที่ ${sortOrder + 1}`,
          label_name: autoLabelName,
          sort_order: sortOrder, // ใช้ลำดับที่ส่งมาจากหน้าจอ
          chapter_status: status || "draft",
          chapter_tags: isFirstChapter ? ["จุดเริ่มต้น"] : [], // ลบฮาร์ดโค้ด "จุดเริ่มต้น" ทิ้ง!
        }
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error inside createChapter:", error);
      throw error;
    }
    return data;
  },

  // 4. อัปเดตเฉพาะชื่อบท (Title) เท่านั้น (ล็อก label_name ไว้ไม่ให้ขยับเพื่อความปลอดภัย)
  async updateChapterName(chapterId, newTitle) {
    const { data, error } = await supabase
      .from("chapters")
      .update({ chapter_titles: newTitle })
      .eq("id", chapterId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 5. ลบบทเรียน
  async deleteChapter(chapterId) {
    const { data,error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) throw error;
    return data;
  },
// ➕ เพิ่มฟังก์ชันสำหรับอัปเดต Tags โดยเฉพาะ
  async updateChapterTags(chapterId, newTags) {
    const { data, error } = await supabase
      .from("chapters")
      .update({ chapter_tags: newTags }) // ส่ง Array ของแท็กใหม่ไปเซฟ (เช่น ['จุดเริ่มต้น', 'ดราม่า'])
      .eq("id", chapterId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateExistingChapter(chapterId, title, sortOrder, tags, status) {
    const { data, error } = await supabase
      .from("chapters")
      .update({
        chapter_titles: title,
        sort_order: sortOrder, // บังคับอัปเดตลำดับแถวให้ตรงกับที่ลากบนหน้าจอ
        chapter_status: status || "draft",
        chapter_tags: tags || []
      })
      .eq("id", chapterId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};