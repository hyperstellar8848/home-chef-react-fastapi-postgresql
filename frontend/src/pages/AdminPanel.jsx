import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: '' });
  const [message, setMessage] = useState('');

  // دریافت لیست‌های منتظر تایید
  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/pending-recipes');
      setPendingRecipes(res.data);
    } catch (err) { console.error("Error fetching admin data", err); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  // تایید دستور پخت
  const approveRecipe = async (id) => {
    await api.patch(`/admin/approve-recipe/${id}`);
    fetchAdminData();
  };

  // اضافه کردن ماده اولیه جدید
  const addIngredient = async (e) => {
    e.preventDefault();
    await api.post('/admin/ingredients', newIngredient);
    alert("ماده اولیه جدید اضافه شد!");
    setNewIngredient({ name: '', category: '' });
  };

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">🛠 پنل مدیریت</h1>

      {/* ۱. بخش تایید دستور پخت */}
      <section className="bg-white p-6 rounded-2xl shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">⏳ دستورهای منتظر تایید ({pendingRecipes.length})</h2>
        {pendingRecipes.map(r => (
          <div key={r.id} className="border-b py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-orange-600">{r.title}</h3>
              <p className="text-sm text-gray-500">{r.description}</p>
            </div>
            <button 
              onClick={() => approveRecipe(r.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >✅ تایید</button>
          </div>
        ))}
      </section>

      {/* ۲. بخش افزودن ماده اولیه */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">🍎 افزودن ماده اولیه جدید</h2>
        <form onSubmit={addIngredient} className="flex gap-4">
          <input 
            placeholder="نام ماده (مثلاً قارچ)" 
            className="border p-2 rounded-lg"
            value={newIngredient.name}
            onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
          />
          <input 
            placeholder="دسته‌بندی (مثلاً صیفی‌جات)" 
            className="border p-2 rounded-lg"
            value={newIngredient.category}
            onChange={e => setNewIngredient({...newIngredient, category: e.target.value})}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">ذخیره</button>
        </form>
      </section>
    </div>
  );
};

export default AdminPanel;
