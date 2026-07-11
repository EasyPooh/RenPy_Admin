const Projectbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="shrink-0 flex items-center flex-col">
            <span className="text-2xl font-bold text-blue-600">
              โปรเจกต์ของฉัน
            </span>
            <p class="text-sm text-gray-500">เลือกโปรเจกต์ของคุณ</p>
          </div>

          {/* Button */}
          <div className="hidden md:block">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              สร้างโปรเจกต์ใหม่
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Projectbar;
