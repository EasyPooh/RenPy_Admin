import React from 'react'
import { useNavigate } from 'react-router';
import { Link } from 'react-router';

const Emptystate = () => {

  return (
    <div className="flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-3xl p-10 min-h-[400px]">
      <div className="p-10 bg-violet-50 text-violet-300 rounded-3xl mb-8">
        <svg className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M6 12h.01M9 12h.01M15 10l-2 4m1 1l2-4m-10 6h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      </div>

      <div className="space-y-3 mb-10 max-w-sm">
        <h2 className="text-3xl font-bold text-gray-900">ยังไม่มีโปรเจค</h2>
        <p className="text-lg text-gray-500">สร้างโปรเจคแรกของคุณเพื่อเริ่มเขียนบทเนื้อเรื่อง</p>
      </div>

      <Link to="/CreateProject">
        <button className="inline-flex items-center gap-2.5 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium text-lg hover:bg-violet-700 transition duration-150 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
          สร้างโปรเจคแรก
        </button>
      </Link>
    </div>
  );
};
  

export default Emptystate