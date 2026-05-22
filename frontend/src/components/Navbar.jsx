import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 mb-6" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* لوگو و نام برنامه */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-black text-orange-500 flex items-center gap-1">
            <span>👨‍🍳</span> HomeChef
          </Link>
          
          {/* لینک‌های صفحات چهارگانه جدید */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-orange-500 transition">🏠 خانه</Link>
            <Link to="/search-ingredients" className="hover:text-orange-500 transition">🔍 جستجو با یخچال</Link>
            <Link to="/create-recipe" className="hover:text-orange-500 transition">➕ ثبت دستور جدید</Link>
          </div>
        </div>

        {/* بخش کاربر و دکمه خروج */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg hidden sm:inline">
              سلام، {user.name || 'کاربر گرامی'} 👋
            </span>
          )}
          <button 
            onClick={logout}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition"
          >
            خروج از حساب
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
