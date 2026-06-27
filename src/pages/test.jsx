const handleAddChapter = async () => {
  const defaultName = `บทใหม่ที่ ${Chapters.length + 1}`;

  try {
    // 💡 ส่งแค่ id โปรเจค, ชื่อตั้งต้น, และจำนวนแถวปัจจุบันไปให้ Service จัดการ
    const insertedData = await chapterService.createChapter(
      id,
      defaultName,
      Chapters.length,
    );

    if (insertedData) {
      // นำข้อมูลที่ได้จาก Supabase กลับมาอัปเดตลง State ในหน้าเว็บ
      setChapters([
        ...Chapters,
        {
          project_id: insertedData.project_id,
          chapter_name: insertedData.chapter_titles,
          label_name: insertedData.label_name, // ระบบส่งคืนมาเป็นค่าที่ปลอดภัยแล้ว เช่น "chapter_2"
          chapter_status: insertedData.chapter_status,
          chapter_tags: insertedData.chapter_tags,
        },
      ]);
      setActiveChapterId(insertedData.id);
    }
  } catch (error) {
    console.error("เพิ่มบทเรียนไม่สำเร็จ:", error);
    alert("ไม่สามารถสร้างบทเรียนใหม่ได้");
  }
};

const filteredChapters = Chapters.filter(
  (Chapter) =>
    Chapter.chapter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Chapter.project_id.toString().includes(searchQuery),
);
// 1. สร้าง State สำหรับเก็บรายการ Block ทั้งหมด (เริ่มต้นเป็นอาเรย์ว่าง)
const [blocks, setBlocks] = useState([]);
const [focusedBlockId, setFocusedBlockId] = useState(null);

const currentBlocks = blocks[activeChapterId] || [];
