import React, { useState, useEffect } from "react";
import BackgroundSection from "./BackgroundSection";
import AudioSection from "./AudioSection";
import StorySection from "./StorySection";

export default function EditorContainer({ selectedScene, onSaveScene }) {
  // สร้าง Local State สำหรับรองรับการพิมพ์กรอกข้อมูลภายในฟอร์ม
  const [formData, setFormData] = useState(null);

  // เมื่อผู้ใช้เปลี่ยนไปคลิกเลือกฉากอื่น ให้ดึงข้อมูลของฉากใหม่มาลงในฟอร์มทันที
  useEffect(() => {
    if (selectedScene) {
      setFormData({ ...selectedScene });
    } else {
      setFormData(null);
    }
  }, [selectedScene]);

  // หากยังไม่ได้เลือกฉาก ให้แสดงหน้าจอว่างตามรูปที่ 1
  if (!formData) {
    return (
      <main className="flex-1 bg-white p-6 flex flex-col items-center justify-center select-none">
        <div className="text-center space-y-3">
          <div className="text-6xl text-gray-200">📖</div>
          <h3 className="text-gray-500 font-medium text-base">
            เลือกฉากจากรายการด้านซ้าย
          </h3>
          <p className="text-gray-400 text-xs">
            หรือกด New Scene เพื่อสร้างใหม่
          </p>
        </div>
      </main>
    );
  }

  // ฟังก์ชันเมื่อกดเซฟฟอร์ม
  const handleSubmitSave = (e) => {
    e.preventDefault();
    onSaveScene(formData); // ส่งสเตตที่แก้เสร็จแล้วกลับขึ้นไปเซฟที่หน้าหลัก
    alert("บันทึกข้อมูลฉากเรียบร้อยแล้ว!");
  };

  return (
    <main className="flex-1 overflow-y-auto bg-white p-6 flex flex-col min-w-112.5">
      <form
        onSubmit={handleSubmitSave}
        className="space-y-6 flex-1 flex flex-col"
      >
        {/* Header ของฟอร์ม */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-16">
              <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">
                ID
              </label>
              <input
                type="text"
                value={formData.id.slice(-4)}
                disabled
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 text-gray-500 font-mono text-center"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">
                Scene Name
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-400 font-medium"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none text-gray-600 cursor-pointer"
            >
              <option value="draft">📝 Draft</option>
              <option value="published">🚀 Published</option>
            </select>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors flex items-center gap-1.5 shadow-sm shadow-purple-100"
            >
              💾 Save
            </button>
          </div>
        </div>

        {/* ส่วนเนื้อหาของฟอร์มที่เรียกใช้ Sub-components */}
        <div className="space-y-5 flex-1">
          {/* 1. ส่วนจัดทำ Background */}
          <BackgroundSection
            background={formData.background}
            onChange={(updatedBg) =>
              setFormData({ ...formData, background: updatedBg })
            }
          />

          {/* 2. ส่วนจัดทำ Audio */}
          <AudioSection
            audio={formData.audio}
            onChange={(updatedAudio) =>
              setFormData({ ...formData, audio: updatedAudio })
            }
          />

          {/* 3. ส่วนจัดทำเนื้อเรื่องและบทพูด */}
          <StorySection
            storyContent={formData.storyContent}
            onChange={(updatedStory) =>
              setFormData({ ...formData, storyContent: updatedStory })
            }
          />
        </div>
      </form>
    </main>
  );
}
