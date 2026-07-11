// src/hooks/useExport.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const handleExportZIP = async (projectId) => {
    try {
      // เริ่มต้นเปิดการโหลด
      setIsExporting(true);
      setExportProgress('กำลังดึงข้อมูลจากฐานข้อมูล...');

      // 1. ดึงข้อมูล Chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      if (chaptersError) throw chaptersError;
      if (!chapters || chapters.length === 0) {
        alert('ไม่พบข้อมูล Chapter ในโปรเจกต์นี้');
        setIsExporting(false); // เคลียร์สถานะกรณีไม่มีข้อมูล
        setExportProgress('');
        return null;
      }

      const chapterIds = chapters.map(ch => ch.id);

      // 2. ดึงข้อมูล Blocks (🎯 จุดที่แก้ไขบั๊กโครงสร้างใหม่)
      const { data: blocks, error: blocksError } = await supabase
        .from('blocks')
        .select('*')
        .in('chapter_id', chapterIds) // ✨ แก้จาก workspace_id เป็น chapter_id และใช้ .in แทน .eq
        .order('sort_order', { ascending: true });

      if (blocksError) throw blocksError;

      // 3. ดึงข้อมูล Assets
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId);

      if (assetsError) throw assetsError;

      setExportProgress('ดึงข้อมูลสำเร็จ! กำลังเตรียมประมวลผลสคริปต์...');
      
      // 🎯 นำเอาบล็อก finally ออก ตามที่คุณตั้งใจไว้เพื่อลากสถานะ Loading ไปปิดที่ปุ่มปลายทาง
      return { chapters, blocks, assets };

    } catch (error) {
      console.error('Export failed:', error.message);
      alert('เกิดข้อผิดพลาดในการ Export: ' + error.message);
      
      // เคลียร์สถานะเฉพาะตอนที่พัง (Catch Error)
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