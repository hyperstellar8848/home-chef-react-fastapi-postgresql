import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ۲. بیرون کشیدن تابع لاگین سراسری

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      // ارسال درخواست به ایندپوینت FastAPI
      const response = await api.post('/token', formData);
      
      const token = response.data.access_token;
      // ساخت یک شیء کاربر فرضی با ایمیلش برای اینکه ناوبار بتونه اسم یا ایمیل رو نشون بده
      const userData = { email: email, name: email.split('@')[0] };

      // ۳. این بخش کلیدی بود: به جای localStorage مستقیم، تابع کانتکست رو صدا می‌زنیم
      // این تابع هم توکن رو ذخیره می‌کنه و هم وضعیت لودینگ روت‌ها رو آپدیت می‌کنه تا صفحه سفید نشه
      login(token, userData);
      
      // هدایت امن به صفحه اصلی
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.detail || "ورود ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-2xl rounded-3xl w-96 border border-gray-100 transform transition-all hover:scale-[1.01]">
        <h2 className="text-3xl font-bold mb-8 text-orange-600 text-center">خوش آمدید 🍳</h2>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-xl text-sm">
              ⚠️ {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-2 mr-1 text-sm">ایمیل کاربر</label>
            <input 
              type="email" placeholder="example@mail.com" 
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50/50 transition-all text-left"
              onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2 mr-1 text-sm">رمز عبور</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50/50 transition-all text-left"
              onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all shadow-lg 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200 active:scale-95'}`}
          >
            {loading ? 'در حال ورود...' : 'ورود به حساب'}
          </button>
        </div>
        
        <p className="mt-8 text-center text-gray-500">
          هنوز عضو نشده‌اید؟ <span onClick={() => navigate('/register')} className="text-orange-600 cursor-pointer font-bold hover:underline">ثبت‌نام کنید</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
