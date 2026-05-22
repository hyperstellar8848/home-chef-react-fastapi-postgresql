import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition" dir="rtl">
      <div className="flex justify-between items-center mb-2">
        <Link to={`/recipe/${recipe.id}`} className="text-xl font-bold text-orange-600 hover:underline">
          {recipe.title}
        </Link>
        <span className="text-sm bg-gray-100 px-3 py-1 rounded-lg">⏱ {recipe.cooking_time} دقیقه</span>
      </div>
      <p className="text-gray-700 text-sm mb-2"><strong>مواد لازم:</strong> {recipe.description}</p>
    </div>
  );
};

export default RecipeCard;
