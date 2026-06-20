import { supabase } from './supabaseClient';

// --- ส่วนที่ 1: การดึงข้อมูล ---
export const getWorkspaceByChapterId = async (chapterId) => {
  const { data, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      background:assets!start_bg_asset_id(id, name:file_name), 
      music:assets!start_music_asset_id(id, name:file_name)
    `)
    .eq('chapter_id', chapterId)
    .maybeSingle();

  // ถ้าไม่เจอ workspace ให้คืนค่า null แทนการ throw error เพื่อให้หน้า UI จัดการเคส "สร้างใหม่" ได้
  if (error && error.code !== 'PGRST116') throw error; 
  return data;
};

// --- ส่วนที่ 2: การจัดการ Config พื้นฐาน ---
export const upsertWorkspaceConfig = async (payload) => {
  console.log("กำลังส่งข้อมูลไป Upsert บน Supabase:", payload);
  
  const { data, error } = await supabase
    .from('workspaces')
    .upsert(payload) // ✨ มี id จะเขียนทับ ไม่มี id จะ Insert ให้ทันที
    .select();

  if (error) {
    console.error("Supabase Error ใน Service:", error);
    throw error;
  }
  return data?.[0] || null;
};

