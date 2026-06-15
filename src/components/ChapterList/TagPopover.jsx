import React from "react";

const TagPopover = ({
  suggestedTags,
  onSelectTag,
  onAddCustomTag,
  onClose,
}) => {
  const [customTag, setCustomTag] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customTag.trim()) {
      onAddCustomTag(customTag.trim());
      setCustomTag("");
    }
  };

  return (
    <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 mt-1 text-sm text-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">แท็ก </span>
        <span className="w-32 text-gray-600 text-xs font-medium">
          จัดหมวดหมู่และค้นหาได้
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {/* ส่วนแสดงรายการแท็กแนะนำ */}
      <div className="flex flex-wrap gap-1 mb-3">
        {suggestedTags.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTag(tag)}
            className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ฟอร์มเพิ่มแท็กเอง */}
      <form onSubmit={handleSubmit} className="flex gap-1">
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          placeholder="แท็กเอง..."
          className="flex-1 px-2 py-1 border rounded text-xs focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
        >
          เพิ่ม
        </button>
      </form>
    </div>
  );
};

export default TagPopover;
