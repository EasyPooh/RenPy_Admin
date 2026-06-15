import { useState } from 'react';
import { chapterService } from "../lib/chapterService";

export const useSaveManager = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async (projectId, chapters, setChapters, setIsDataChanged) => {
    setIsSaving(true);
    try {
      // วนลูปเพื่อยิง API ทีละตัวไปที่ Supabase
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        
        // ⚠️ ต้องเรียกใช้ฟังก์ชันอัปเดตตรงนี้ และแปลงค่าจาก State หน้าบ้านให้ตรงกับตัวแปรที่ Service ต้องการ
        await chapterService.updateExistingChapter(
          c.id,
          c.name,         // หน้าบ้านใช้ name -> ส่งไปเป็น title
          i,              // ใช้ลำดับอินเด็กซ์เป็น sort_order
          c.tags || [],   // หน้าบ้านใช้ tags -> ส่งไปเป็น tags
          c.status        // หน้าบ้านใช้ status -> ส่งไปเป็น status
        );
      }

      // เซฟสำเร็จแล้วให้ปิดปุ่มเซฟ
      setIsDataChanged(false); 
      alert("บันทึกข้อมูลลงฐานข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveAll, isSaving };
};