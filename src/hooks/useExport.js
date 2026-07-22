// src/hooks/useExport.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 

/**
 * [HOOK สำหรับดึงข้อมูลดิบจากฐานข้อมูล]
 * ทำหน้าที่เป็น Data Access Layer มีหน้าที่วิ่งไปดึงข้อมูลดิบของเกมจาก Cloud Storage และ Database
 * โดยไม่ผูกมัดกับการแปลงไฟล์ เพื่อให้โค้ดส่วนนี้สามารถนำไป Reuse ใช้กับการ Export รูปแบบอื่นได้ในอนาคต
 */

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const handleExportZIP = async (projectId) => {
    try {
      // เริ่มต้นเปิดการโหลด
      setIsExporting(true);
      setExportProgress('กำลังดึงข้อมูลจากฐานข้อมูล...');

      // 1. ดึงข้อมูล Chapters
      // ดึงบทเรียนหรือตอนทั้งหมดในโปรเจกต์นี้ และเรียงลำดับตามเส้นเนื้อเรื่อง (sort_order)
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

        // หากผู้ใช้ยังไม่ได้สร้างตอนใดๆ เลย ให้แจ้งเตือนและหยุดการทำงานทันที
      if (chaptersError) throw chaptersError;
      if (!chapters || chapters.length === 0) {
        alert('ไม่พบข้อมูล Chapter ในโปรเจกต์นี้');
        setIsExporting(false); // เคลียร์สถานะกรณีไม่มีข้อมูล
        setExportProgress('');
        return null;
      }

      const chapterIds = chapters.map(ch => ch.id);

      // 2. ดึงข้อมูล Blocks (🎯 จุดที่แก้ไขบั๊กโครงสร้างใหม่)
      // ดึงเนื้อหา บทสนทนา คำสั่งควบคุม หรือทางเลือก ที่ผูกอยู่กับแต่ละ Chapter
      // ใช้คำสั่ง .in() เพื่อจอยข้อมูลบล็อกที่สังกัดอยู่ในรายการ chapterIds ทั้งหมดในการยิง API ครั้งเดียว
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('*')
        .in('chapter_id', chapterIds) 
        .order('sort_order', { ascending: true });

      if (blocksError) throw blocksError;

      // 3. ดึงข้อมูล Assets
      // ดึงรายการไฟล์ภาพ ฉากหลัง ตัวละคร และเสียงทั้งหมดที่ลงทะเบียนไว้ในโปรเจกต์นี้
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId);

      if (assetsError) throw assetsError;

      setExportProgress('ดึงข้อมูลสำเร็จ! กำลังเตรียมประมวลผลสคริปต์...');
      
      // ส่งข้อมูลดิบทั้ง 3 ส่วนกลับไปให้ Hook ตัวถัดไปทำหน้าที่ประมวลผล 
      // *ถอดบล็อก finally ออกเพื่อให้สถานะ Loading แสดงต่อเนื่องไปจนถึงกระบวนการดาวน์โหลดเสร็จสิ้น
      return { chapters, blocks, assets };

    } catch (error) {
      console.error('Export failed:', error.message);
      alert('เกิดข้อผิดพลาดในการ Export: ' + error.message);
      
      // เคลียร์สถานะเฉพาะตอนที่พัง (Catch Error) เพื่อให้ปุ่มกดกลับมาใช้งานใหม่ได้
      setIsExporting(false);
      setExportProgress('');
      return null;
    }
  };

  // ส่งตัวแปรและฟังก์ชันออกไปให้ Component อื่นเรียกใช้
  return {
    isExporting,
    exportProgress,
    handleExportZIP,
    setExportProgress,
    setIsExporting 
  };
}