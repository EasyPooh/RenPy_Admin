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
export const updateWorkspaceConfig = async (workspaceId, updates) => {
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', workspaceId)
    .select();

  if (error) throw error;
  return data;
};

// --- ส่วนที่ 3: การจัดการ JSONB (start_characters) ---
// เราจะใช้การดึงค่าเดิมออกมาอัปเดต แล้วเขียนทับ เป็นวิธีที่ปลอดภัยที่สุดสำหรับ Supabase
export const updateWorkspaceCharacters = async (workspaceId, newCharactersArray) => {
  const { data, error } = await supabase
    .from('workspaces')
    .update({ start_characters: newCharactersArray })
    .eq('id', workspaceId)
    .select();

  if (error) throw error;
  return data;
};