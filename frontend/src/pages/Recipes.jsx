import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [editingId, setEditingId] = useState(null); // Track if we are editing

  // READ: Get recipes from Backend 
  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes/');
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => { fetchRecipes(); }, []);

  // CREATE / UPDATE Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    const recipeData = {
      title,
      description: ingredients,
      instructions,
      cooking_time: parseInt(cookingTime),
    };

    try {
      if (editingId) {
        // UPDATE (PUT)
        await api.put(`/recipes/${editingId}`, recipeData);
        setEditingId(null);
      } else {
        // CREATE (POST)
        await api.post('/recipes/', recipeData);
      }
      // Reset form and refresh list
      setTitle(''); setIngredients(''); setInstructions(''); setCookingTime('');
      fetchRecipes();
    } catch (error) {
      alert("خطا! مطمئن شوید لاگین کرده‌اید و فقط غذای خودتان را ویرایش می‌کنید.");
    }
  };

  //  DELETE Logic
  const handleDelete = async (id) => {
    if (window.confirm("آیا از حذف این دستور پخت مطمئن هستید؟")) {
      try {
        await api.delete(`/recipes/${id}`);
        fetchRecipes();
      } catch (error) {
        alert("خطا در حذف! فقط صاحب غذا می‌تواند آن را حذف کند.");
      }
    }
  };

  // Form for Editing 
  const startEdit = (recipe) => {
    setEditingId(recipe.id);
    setTitle(recipe.title);
    setIngredients(recipe.description);
    setInstructions(recipe.instructions);
    setCookingTime(recipe.cooking_time);
    window.scrollTo(0, 0); // Scroll up to see the form
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      {/* FORM */}
      <section className="bg-white p-6 rounded-2xl shadow-md mb-10 max-w-2xl mx-auto border-t-4 border-orange-500">
        <h2 className="text-xl font-bold mb-4">{editingId ? 'ویرایش دستور پخت' : 'ثبت دستور پخت جدید'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="نام غذا" className="w-full p-3 border rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="number" placeholder="زمان پخت (دقیقه)" className="w-full p-3 border rounded-xl" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required />
          <textarea placeholder="مواد لازم" className="w-full p-3 border rounded-xl h-24" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />
          <textarea placeholder="طرز تهیه" className="w-full p-3 border rounded-xl h-32" value={instructions} onChange={(e) => setInstructions(e.target.value)} required />
          <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition ${editingId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
            {editingId ? 'بروزرسانی تغییرات' : 'انتشار دستور پخت'}
          </button>
          {editingId && <button onClick={() => {setEditingId(null); setTitle(''); setIngredients(''); setInstructions(''); setCookingTime('');}} className="w-full text-gray-500 text-sm mt-2">انصراف از ویرایش</button>}
        </form>
      </section>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-orange-600">{recipe.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => startEdit(recipe)} className="text-blue-500 hover:bg-blue-50 px-2 py-1 rounded text-sm border border-blue-200">ویرایش</button>
                <button onClick={() => handleDelete(recipe.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm border border-red-200">حذف</button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">⏱ {recipe.cooking_time} دقیقه</p>
            <p className="text-gray-700 text-sm mb-2"><strong>مواد لازم:</strong> {recipe.description}</p>
            <p className="text-gray-600 text-sm italic"><strong>طرز تهیه:</strong> {recipe.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
