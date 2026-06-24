// src/lib/chapterConfigService.js
import { supabase } from './supabaseClient';

// 🎯 เปลี่ยนมาดึงค่า Config ที่อยู่ในตาราง chapters เลย
export const getChapterConfigById = async (chapterId) => {
  const { data, error } = await supabase
    .from('chapters')
    .select(`
      id,
      project_id,
      start_bg_asset_id,
      start_music_asset_id,
      start_characters,
      background:assets!start_bg_asset_id(id, name:file_name), 
      music:assets!start_music_asset_id(id, name:file_name)
    `)
    .eq('id', chapterId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching chapter config:", error);
    throw error;
  } 
  return data;
};

// 🎯 เปลี่ยนมาอัปเดตค่า Config ลงตาราง chapters โดยตรง
export const updateChapterConfig = async (chapterId, payload) => {
  console.log("กำลังอัปเดต Config ลงตาราง chapters:", payload);
  
  const { data, error } = await supabase
    .from('chapters')
    .update({
      start_bg_asset_id: payload.start_bg_asset_id,
      start_music_asset_id: payload.start_music_asset_id,
      start_characters: payload.start_characters
    })
    .eq('id', chapterId)
    .select();

  if (error) {
    console.error("Supabase Error ในการอัปเดตบท:", error);
    throw error;
  }
  return data?.[0] || null;
};