import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Internal error state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevents page refresh
    setError('');       // Clear old errors
    setLoading(true);

    try {
      await api.post('/register', { email, password });
      navigate('/login'); // Success! Go to login
    } catch (err) {
      // Catch backend errors (like password too short)
      const errorMsg = err.response?.data?.detail;
      if (Array.isArray(errorMsg)) {
        setError(errorMsg[0].msg); // Pydantic specific errors
      } else {
        setError(errorMsg || "خطایی در اتصال به سرور رخ داد");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
      <form onSubmit={handleRegister} className="p-8 bg-white shadow-2xl rounded-3xl w-96 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-orange-600 text-center">عضویت در هوم‌شف</h2>

        {/* NICE ERROR MESSAGE BOX */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-3 mb-4 rounded-lg text-sm animate-pulse">
             ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <input 
            type="email" placeholder="ایمیل" 
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="رمز عبور (حداقل ۸ کاراکتر)" 
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            onChange={(e) => setPassword(e.target.value)} required 
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all 
              ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-100'}`}
          >
            {loading ? 'در حال ثبت نام...' : 'ساخت حساب کاربری'}
          </button>
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-500">
          قبلاً ثبت نام کرده‌اید؟ <span onClick={() => navigate('/login')} className="text-orange-600 cursor-pointer font-bold">وارد شوید</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
