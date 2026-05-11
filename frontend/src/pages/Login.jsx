import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // استفاده از URLSearchParams برای اطمینان از فرمت x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', email); // FastAPI به دنبال کلمه username می‌گردد
      params.append('password', password);

      const response = await api.post('/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      localStorage.setItem('token', response.data.access_token);
      
      // تغییر مسیر به صفحه اصلی (یا هر مسیری که هدر فارسی دارد)
      navigate('/home'); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "ورود ناموفق بود. ایمیل یا رمز عبور را چک کنید.");
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
              type="email" 
              placeholder="example@mail.com" 
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-400 transition-all text-left" 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2 mr-1 text-sm">رمز عبور</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-400 transition-all text-left" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all shadow-lg 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}`}
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
