// src/lib/blockService.js
import { supabase } from "./supabaseClient"; // 👈 เปลี่ยนเป็นพาธไฟล์ Supabase Client จริงของคุณ


export const getBlocksByWorkspaceId = async (workspaceId) => {
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("sort_order", { ascending: true }); // เรียงตามลำดับไทม์ไลน์

  if (error) throw error;
  return data;
};


export const upsertBlocks = async (blocksArray) => {
  if (!blocksArray || blocksArray.length === 0) return [];

  const { data, error } = await supabase
    .from("blocks")
    .upsert(blocksArray, { onConflict: "id" }) // ถ้ามี ID เดิมจะอัปเดต ถ้าเป็น ID ใหม่จะเพิ่มให้
    .select();

  if (error) throw error;
  return data;
};


export const deleteBlockFromDb = async (blockId) => {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", blockId);

  if (error) throw error;
  return true;
};