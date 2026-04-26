import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // fastapi uses formdata for login
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/token', formData);
      localStorage.setItem('token', response.data.access_token); // stores token
      navigate('/'); // gets you to main page
    } catch (err) {
      setError('ایمیل یا رمز عبور اشتباه است');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-lg rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-orange-600 text-center">ورود به هوم‌شف</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input 
          type="email" placeholder="ایمیل" className="w-full p-3 mb-4 border rounded-lg focus:outline-orange-500"
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="رمز عبور" className="w-full p-3 mb-6 border rounded-lg focus:outline-orange-500"
          onChange={(e) => setPassword(e.target.value)} required 
        />
        <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600 transition">
          ورود
        </button>
      </form>
    </div>
  );
};

export default Login;
