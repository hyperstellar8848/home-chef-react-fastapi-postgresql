import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({ title: '', instructions: '', cookingTime: '' });
  const [selectedIngredients, setSelectedIngredients] = useState([]); // لیست مواد انتخاب شده
  const [searchTerm, setSearchTerm] = useState(''); // متن جستجو
  const [suggestions, setSuggestions] = useState([]); // پیشنهادات بک‌اِند
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSupport, setShowSupport] = useState(false); // نمایش بخش پیام به ادمین

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/recipes');
      setRecipes(res.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  useEffect(() => { fetchRecipes(); }, []);

  // سیستم جستجوی مواد اولیه از بک‌اِند
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const res = await api.get(`/ingredients?q=${searchTerm}`);
          setSuggestions(res.data);
        } catch (err) { console.error("Search error", err); }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const addIngredient = (ing) => {
    if (!selectedIngredients.find(i => i.id === ing.id)) {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
    setSearchTerm('');
    setSuggestions([]);
  };

  const removeIngredient = (id) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIngredients.length === 0) {
      setError("لطفاً حداقل یک ماده اولیه انتخاب کنید.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/recipes', {
        title: formData.title,
        description: selectedIngredients.map(i => i.name).join('، '), // تبدیل لیست به متن برای دیتابیس
        instructions: formData.instructions,
        cooking_time: parseInt(formData.cookingTime)
      });
      setFormData({ title: '', instructions: '', cookingTime: '' });
      setSelectedIngredients([]);
      fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.detail || "خطا در ثبت. لطفاً وارد حساب شوید.");
    } finally { setLoading(false); }
  };

  // ارسال پیام به ادمین
  const handleSupport = async () => {
    const content = prompt("نام ماده غذایی که پیدا نکردید را بنویسید:");
    if (content) {
      try {
        await api.post('/support', { email: "user@example.com", content: content });
        alert("درخواست شما برای ادمین ارسال شد.");
      } catch (err) { alert("خطا در ارسال پیام"); }
    }
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
              className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
            />
            <input 
              type="number" placeholder="زمان (دقیقه)" 
              className="p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              value={formData.cookingTime} onChange={e => setFormData({...formData, cookingTime: e.target.value})} required 
            />
          </div>

          {/* بخش جستجوی مواد اولیه */}
          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">جستجو و انتخاب مواد اولیه:</label>
            <input 
              type="text" 
              placeholder="تایپ کنید: پیاز، مرغ..." 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                {suggestions.map(ing => (
                  <li 
                    key={ing.id} 
                    onClick={() => addIngredient(ing)}
                    className="p-3 hover:bg-orange-50 cursor-pointer border-b last:border-0"
                  >
                    {ing.name} <span className="text-gray-400 text-xs">({ing.category})</span>
                  </li>
                ))}
              </ul>
            )}

            {searchTerm && suggestions.length === 0 && (
              <div className="mt-2 text-sm text-gray-500">
                پیدا نکردی؟ <button type="button" onClick={handleSupport} className="text-orange-600 font-bold underline">درخواست از ادمین</button>
              </div>
            )}
          </div>

          {/* نمایش تگ‌های انتخاب شده */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIngredients.map(ing => (
              <span key={ing.id} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center">
                {ing.name}
                <button type="button" onClick={() => removeIngredient(ing.id)} className="mr-2 font-bold">×</button>
              </span>
            ))}
          </div>

          <textarea 
            placeholder="طرز تهیه..." 
            className="w-full p-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} required 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            {loading ? 'در حال ارسال...' : '🚀 انتشار دستور پخت'}
          </button>
        </form>
      </div>

      {/* لیست دستورها */}
      <div className="grid gap-6">
        {recipes.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
