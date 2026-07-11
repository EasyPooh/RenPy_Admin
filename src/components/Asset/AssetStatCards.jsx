import React from "react";

const AssetStatCards = ({
  counts = { background: 0, sprite: 0, music: 0, sound_effect: 0 },
}) => {
  const cardItems = [
    {
      key: "background",
      title: "ภาพพื้นหลัง",
      count: counts.background,
      iconText: "🖼️",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      key: "sprite",
      title: "ภาพตัวละคร",
      count: counts.sprite,
      iconText: "👤",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      key: "music",
      title: "เพลงประกอบ",
      count: counts.music,
      iconText: "🎵",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      key: "sound_effect",
      title: "เอฟเฟกต์เสียง",
      count: counts.sound_effect,
      iconText: "🔊",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardItems.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* ส่วนของไอคอนประจำประเภทไฟล์ */}
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-semibold ${item.bgColor} ${item.textColor}`}
          >
            {item.iconText}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">{item.title}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {item.count}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetStatCards;
