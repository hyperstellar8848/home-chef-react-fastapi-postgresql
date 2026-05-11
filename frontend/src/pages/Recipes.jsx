import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({ title: '', ingredients: '', instructions: '', cookingTime: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/recipes/');
      setRecipes(res.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/recipes/', {
        title: formData.title,
        description: formData.ingredients, // Backend calls it 'description'
        instructions: formData.instructions,
        cooking_time: parseInt(formData.cookingTime)
      });
      setFormData({ title: '', ingredients: '', instructions: '', cookingTime: '' });
      fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.detail || "خطا در ثبت غذا. لطفا وارد حساب شوید.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-lg mb-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👩‍🍳 اشتراک‌گذاری دستور جدید</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border-r-4 border-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" placeholder="نام غذا" 
              className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
            />
            <input 
              type="number" placeholder="زمان (دقیقه)" 
              className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all"
              value={formData.cookingTime} onChange={e => setFormData({...formData, cookingTime: e.target.value})} required 
            />
          </div>
          <textarea 
            placeholder="مواد لازم..." 
            className="w-full p-3 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} required 
          />
          <textarea 
            placeholder="طرز تهیه..." 
            className="w-full p-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} required 
          />
          <button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-orange-100 shadow-lg active:scale-[0.98] transition-all"
          >
            {loading ? 'در حال ارسال...' : '🚀 انتشار دستور پخت'}
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        {recipes.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-orange-600">{r.title}</h3>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-lg">⏱ {r.cooking_time} دقیقه</span>
            </div>
            <p className="text-gray-700 text-sm mb-2"><strong>مواد لازم:</strong> {r.description}</p>
            <p className="text-gray-600 text-sm italic">{r.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
