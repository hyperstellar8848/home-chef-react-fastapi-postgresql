import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    api.get(`/recipes`)
      .then(res => {
        const found = res.data.find(item => item.id === parseInt(id));
        setRecipe(found);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!recipe) return <div className="text-center p-10" dir="rtl">در حال بارگذاری جزئیات غذا...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-sm border" dir="rtl">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-sm mb-4 block hover:underline">← بازگشت</button>
        <h1 className="text-3xl font-bold text-orange-600 mb-2">{recipe.title}</h1>
        <div className="bg-gray-50 p-3 rounded-xl inline-block text-sm text-gray-600 mb-6">⏱ زمان پخت: {recipe.cooking_time} دقیقه</div>
        
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2">🥦 مواد اولیه به کار رفته:</h3>
          <p className="text-gray-700 leading-relaxed bg-orange-50/50 p-4 rounded-xl">{recipe.description}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-2">👩‍🍳 دستورالعمل و مراحل پخت:</h3>
          <p className="text-gray-600 whitespace-pre-line leading-loose">{recipe.instructions}</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
