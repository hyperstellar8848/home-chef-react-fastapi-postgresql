import React, { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';

const SearchByIngredients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const data = await recipeService.searchIngredients(searchTerm);
          setSuggestions(data);
        } catch (err) { console.error(err); }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 🚀 تابع نهایی فیلتر و پیدا کردن غذاها بر اساس مواد انتخاب شده
  const handleFindRecipes = async () => {
    if (selectedIngredients.length === 0) {
      alert("لطفاً ابتدا حداقل یک ماده اولیه از یخچال انتخاب کنید.");
      return;
    }
    
    try {
      const allRecipes = await recipeService.getAllRecipes();
      
      // فیلتر کردن غذاهایی که حداقل یکی از مواد انتخابی کاربر را در بخش توضیحات/مواد خود دارند
      const filtered = allRecipes.filter(recipe => {
        return selectedIngredients.some(ing => 
          recipe.description.toLowerCase().includes(ing.name.toLowerCase())
        );
      });

      setMatchedRecipes(filtered);
      setHasSearched(true);
    } catch (err) {
      console.error("خطا در فیلتر غذاها", err);
    }
  };

  const handleSupport = async () => {
    const content = prompt("نام ماده غذایی که پیدا نکردید را بنویسید:");
    if (content) {
      await recipeService.sendSupportMessage(content);
      alert("درخواست شما برای ادمین ارسال شد.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <div className="max-w-xl mx-auto p-6" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔮 چی تو یخچال داری؟</h2>
        
        <div className="relative mb-4">
          <input 
            type="text" placeholder="تایپ کنید: پیاز، مرغ..." 
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
              {suggestions.map(ing => (
                <li 
                  key={ing.id} 
                  onClick={() => {
                    if(!selectedIngredients.find(i => i.id === ing.id)) setSelectedIngredients([...selectedIngredients, ing]);
                    setSearchTerm('');
                    setSuggestions([]);
                  }}
                  className="p-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 text-sm"
                >
                  {ing.name} <span className="text-gray-400 text-xs">({ing.category})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {searchTerm && suggestions.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">
            ماده مورد نظرت رو پیدا نکردی؟ <button onClick={handleSupport} className="text-orange-600 font-bold underline">درخواست از ادمین</button>
          </p>
        )}

        {/* تگ‌های انتخاب شده */}
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedIngredients.map(ing => (
            <span key={ing.id} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center">
              {ing.name}
              <button onClick={() => {
                setSelectedIngredients(selectedIngredients.filter(i => i.id !== ing.id));
                setHasSearched(false); // ریست وضعیت جستجو در صورت تغییر مواد
              }} className="mr-2 font-bold">×</button>
            </span>
          ))}
        </div>

        {/* ✅ دکمه محرک برای شروع عملیات فیلتر بر اساس یخچال */}
        <button
          onClick={handleFindRecipes}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-100 transition-all mb-8"
        >
          🚀 جستجوی غذاها بر اساس این مواد
        </button>

        {/* نمایش نتایج جستجو */}
        {hasSearched && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-700 border-r-4 border-emerald-500 pr-2">🍲 غذاهای پیشنهادی با مواد شما:</h3>
            {matchedRecipes.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded-xl text-center">متأسفانه غذایی پیدا نشد که شامل این ترکیب باشد. مواد دیگری را امتحان کنید.</p>
            ) : (
              matchedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchByIngredients;
