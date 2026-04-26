import React, { useState } from 'react';
import api from '../services/api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', { email, password });
            setMessage("ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.");
        } catch (error) {
            setMessage(error.response?.data?.detail || "خطا در ثبت‌نام");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleRegister} className="p-8 bg-white shadow-lg rounded-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-orange-600 text-center">عضویت در هوم‌شف</h2>
                <input 
                    type="email" placeholder="ایمیل" className="w-full p-3 mb-4 border rounded-lg"
                    onChange={(e) => setEmail(e.target.value)} required 
                />
                <input 
                    type="password" placeholder="رمز عبور" className="w-full p-3 mb-6 border rounded-lg"
                    onChange={(e) => setPassword(e.target.value)} required 
                />
                <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600">
                    ثبت‌ نام
                </button>
                {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
            </form>
        </div>
    );
};

export default Register;
