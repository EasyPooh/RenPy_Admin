import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export const useAssets = (id) => {
const [assetsList, setAssetsList] = useState([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);

  // --- เพิ่มฟังก์ชันนี้ลงไปในตัว ChapterManagementPage ---
  const fetchProjectAssets = async () => {
    try {
      setIsAssetsLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("project_id", id); // id ตัวนี้มาจาก useParams() ที่มีอยู่แล้วด้านบน

      if (error) throw error;
      if (data) {
        setAssetsList(data);
      }
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาดในการดึงข้อมูล Asset ไปยัง Dropdown:",
        error.message,
      );
    } finally {
      setIsAssetsLoading(false);
    }
  };

  // เรียกใช้งานฟังก์ชันดึงข้อมูลเมื่อโปรเจค id มีการเปลี่ยนแปลง
  useEffect(() => {
    if (id) {
      fetchProjectAssets();
    }
  }, [id]);

  /*useEffect(() => {
    const fetchChapters = async () => {
      if (!id) return;

      try {
        const data = await chapterService.getChapters(id);

        if (data && data.length > 0) {
          // กรณีมีข้อมูลใน Database อยู่แล้ว
          setChapters(data);
          setActiveChapterId(data[0].id);
        } else {
          // กรณีโปรเจคใหม่เอี่ยม ไม่มีข้อมูลเลย -> สร้างฉาก Start จำลองขึ้นมาทันที!
          const startId = crypto.randomUUID(); // ใช้ UUID แทนเลข 1
          const initialStartChapter = {
            id: startId,
            name: "เริ่มเกม (Start)",
            labelName: "start", // เราจะใช้คำนี้เป็นตัวล็อคห้ามลบ
            status: "draft",
            tags: ["จุดเริ่มต้น"],
          };

          setChapters([initialStartChapter]);
          setActiveChapterId(startId);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    fetchChapters();
  }, [id]);*/
  return { assetsList, isAssetsLoading };
};
