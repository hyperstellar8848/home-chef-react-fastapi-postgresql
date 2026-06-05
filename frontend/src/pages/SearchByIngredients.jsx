import React, { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';

const SearchByIngredients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // 🔹 UI State: برای ردیابی اینکه آیا کاربر دکمه سرچ را زده یا نه
  const [searching, setSearching] = useState(false); // 🔹 UI State: لودینگ سرچ یخچال

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const data = await recipeService.searchIngredients(searchTerm);
          setSuggestions(data);
        } catch (err) { console.error("خطا در لود پیشنهادات", err); }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFindRecipes = async () => {
    // 🔹 اعتبارسنجی کلاینت: اگر لیستی انتخاب نشده هشدار بده
    if (selectedIngredients.length === 0) {
      alert("لطفاً ابتدا حداقل یک ماده اولیه از یخچال انتخاب کنید.");
      return;
    }
    
    setSearching(true);
    try {
      const allRecipes = await recipeService.getAllRecipes();
      const filtered = allRecipes.filter(recipe => {
        return selectedIngredients.some(ing => 
          recipe.description.toLowerCase().includes(ing.name.toLowerCase())
        );
      });

      setMatchedRecipes(filtered);
      setHasSearched(true);
    } catch (err) {
      alert("خطا در ارتباط با دیتابیس پخت و پز. مجدداً تلاش کنید.");
    } finally {
      setSearching(false);
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

        <div className="flex flex-wrap gap-2 mb-6">
          {selectedIngredients.map(ing => (
            <span key={ing.id} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center">
              {ing.name}
              <button onClick={() => {
                setSelectedIngredients(selectedIngredients.filter(i => i.id !== ing.id));
                setHasSearched(false);
              }} className="mr-2 font-bold">×</button>
            </span>
          ))}
        </div>

        <button
          onClick={handleFindRecipes}
          disabled={searching}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all mb-8"
        >
          {searching ? '🔍 در حال جستجوی دیتابیس...' : '🚀 جستجوی غذاها بر اساس این مواد'}
        </button>

        {/* 🔹 UI State: کنترل دقیق بخش Empty State و نتایج یافته شده */}
        {hasSearched && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-700 border-r-4 border-emerald-500 pr-2">🍲 غذاهای پیشنهادی با مواد شما:</h3>
            {matchedRecipes.length === 0 ? (
              // 🔹 Empty State UI
              <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded-xl text-center">
                🚫 متأسفانه غذایی پیدا نشد که شامل این ترکیب مواد باشد. مواد اولیه دیگری را به یخچال خود اضافه کنید.
              </p>
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
