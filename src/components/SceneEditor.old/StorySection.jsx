import React from "react";

export default function StorySection({ storyContent, onChange }) {
  // ฟังก์ชันเพิ่มบรรทัดคำพูดใหม่
  const handleAddDialogue = () => {
    const newDialogue = {
      character: "",
      expression: "",
      text: "",
    };
    onChange([...storyContent, newDialogue]);
  };

  // ฟังก์ชันแก้ไขข้อมูลรายบรรทัด
  const handleUpdateDialogue = (index, updatedField) => {
    const updatedContent = storyContent.map((item, idx) => {
      if (idx === index) {
        return { ...item, ...updatedField };
      }
      return item;
    });
    onChange(updatedContent);
  };

  // ฟังก์ชันลบบรรทัดคำพูด
  const handleRemoveDialogue = (index) => {
    const updatedContent = storyContent.filter((_, idx) => idx !== index);
    onChange(updatedContent);
  };

  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>💬</span> Story Content & Dialogues
        </div>
        <button
          type="button"
          onClick={handleAddDialogue}
          className="text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
        >
          + Add Dialogue
        </button>
      </div>

      {storyContent.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
          ยังไม่มีบทสนทนาในฉากนี้ กดปุ่ม Add Dialogue
          ด้านบนเพื่อเริ่มเขียนเนื้อเรื่อง
        </div>
      ) : (
        <div className="space-y-3">
          {storyContent.map((dialogue, index) => (
            <div
              key={index}
              className="flex items-start gap-2 bg-white border border-gray-100 p-3 rounded-xl shadow-sm"
            >
              <span className="text-xs font-mono text-gray-300 pt-2 shrink-0 w-5">
                #{index + 1}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                {/* ตัวละคร */}
                <div>
                  <input
                    type="text"
                    value={dialogue.character}
                    onChange={(e) =>
                      handleUpdateDialogue(index, { character: e.target.value })
                    }
                    placeholder="Character Name"
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
                {/* สีหน้า/ท่าทาง */}
                <div>
                  <input
                    type="text"
                    value={dialogue.expression}
                    onChange={(e) =>
                      handleUpdateDialogue(index, {
                        expression: e.target.value,
                      })
                    }
                    placeholder="Expression (e.target. happy)"
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
                {/* บรรทัดบทพูด */}
                <div className="sm:col-span-3">
                  <textarea
                    rows={1}
                    value={dialogue.text}
                    onChange={(e) =>
                      handleUpdateDialogue(index, { text: e.target.value })
                    }
                    placeholder="ข้อความบทสนทนาหรือคำบรรยาย..."
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>
              </div>

              {/* ปุ่มลบบรรทัด */}
              <button
                type="button"
                onClick={() => handleRemoveDialogue(index)}
                className="text-gray-400 hover:text-red-500 p-1.5 text-xs transition-colors"
                title="ลบบรรทัดนี้"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
