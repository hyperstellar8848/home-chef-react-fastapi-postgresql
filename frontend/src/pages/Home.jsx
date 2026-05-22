import React, { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';

const Home = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    recipeService.getAllRecipes()
      .then(data => setRecipes(data))
      .catch(err => console.error("خطا در دریافت غذاها", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar /> {/* ناوبار مشترک در بالاترین قسمت */}
      
      <div className="max-w-4xl mx-auto p-6" dir="rtl">
        <h2 className="text-xl font-bold text-gray-700 mb-6">🌟 آخرین دستورهای پخت اعضا</h2>
        <div className="grid gap-6">
          {recipes.map(r => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
