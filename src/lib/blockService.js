// src/lib/blockService.js
import { supabase } from "./supabaseClient"; // 👈 เปลี่ยนเป็นพาธไฟล์ Supabase Client จริงของคุณ

/**
 * 1. ดึงบล็อกทั้งหมดของ Workspace นี้ขึ้นมาแสดงผล
 */
export const getBlocksByWorkspaceId = async (workspaceId) => {
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("sort_order", { ascending: true }); // เรียงตามลำดับไทม์ไลน์

  if (error) throw error;
  return data;
};

/**
 * 2. บันทึกหรืออัปเดตบล็อกทั้งหมดพร้อมกัน (Batch Upsert)
 * วิธีนี้จะช่วยลบ/เพิ่ม/อัปเดตข้อมูลให้ตรงกับสเตทบนหน้าจอแบบรอบเดียวจบ
 */
export const upsertBlocks = async (blocksArray) => {
  if (!blocksArray || blocksArray.length === 0) return [];

  const { data, error } = await supabase
    .from("blocks")
    .upsert(blocksArray, { onConflict: "id" }) // ถ้ามี ID เดิมจะอัปเดต ถ้าเป็น ID ใหม่จะเพิ่มให้
    .select();

  if (error) throw error;
  return data;
};

/**
 * 3. ลบบล็อกออกจากฐานข้อมูล (กรณีผู้เล่นกดปุ่มลบถังขยะบนหน้าจอ)
 */
export const deleteBlockFromDb = async (blockId) => {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", blockId);

  if (error) throw error;
  return true;
};