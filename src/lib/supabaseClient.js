import { createClient } from '@supabase/supabase-js'

// ดึงค่าจาก .env.local ที่เราตั้งไว้
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// สร้างตัว Client สำหรับเรียกใช้งาน
// เรา Export ออกไปเพื่อให้ไฟล์อื่นๆ (เช่น App.jsx) เรียกใช้ได้ทันที
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const MOCK_USER_ID = "62ba56e6-8e6b-4f30-a4da-a001ce73502d" 