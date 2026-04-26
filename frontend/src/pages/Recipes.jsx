import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cookingTime, setCookingTime] = useState('');

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes/');
      setRecipes(response.data);
    } catch (error) {
      console.error("خطا در دریافت لیست:", error);
    }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recipes/', {
        title,
        description: ingredients,
        instructions,
        cooking_time: parseInt(cookingTime),
      });
      setTitle(''); setIngredients(''); setInstructions(''); setCookingTime('');
      fetchRecipes();
    } catch (error) {
      alert("خطا! مطمئن شوید که لاگین کرده‌اید.");
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      {/* بخش فرم ایجاد غذا */}
      <section className="bg-white p-8 rounded-2xl shadow-sm mb-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ثبت دستور پخت جدید</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="نام غذا" 
              className="p-3 border rounded-xl outline-none focus:border-orange-500"
              value={title} onChange={(e) => setTitle(e.target.value)} required 
            />
            <div className="flex items-center border rounded-xl px-3 focus-within:border-orange-500">
              <input 
                type="number" placeholder="زمان پخت" 
                className="w-full p-3 outline-none"
                value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required 
              />
              <span className="text-gray-400 text-sm w-20">دقیقه</span>
            </div>
          </div>
          <textarea 
            placeholder="مواد لازم را اینجا تایپ کنید..." 
            className="w-full p-3 border rounded-xl h-24 outline-none focus:border-orange-500"
            value={ingredients} onChange={(e) => setIngredients(e.target.value)} required 
          />
          <textarea 
            placeholder="طرز تهیه..." 
            className="w-full p-3 border rounded-xl h-32 outline-none focus:border-orange-500"
            value={instructions} onChange={(e) => setInstructions(e.target.value)} required 
          />
          <button type="submit" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition">
            انتشار در هوم‌شف
          </button>
        </form>
      </section>

      {/* بخش نمایش لیست غذاها */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">دستورهای پخت کاربران</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:border-orange-200 transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-orange-600">{recipe.title}</h3>
                <span className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                   {recipe.cooking_time} دقیقه
                </span>
              </div>
              <p className="text-gray-700 mb-2"><strong>مواد لازم:</strong> {recipe.description}</p>
              <p className="text-gray-600 text-sm leading-relaxed"><strong>طرز تهیه:</strong> {recipe.instructions}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Recipes;
