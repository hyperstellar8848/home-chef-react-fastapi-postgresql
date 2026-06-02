import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import Navbar from '../components/Navbar';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', instructions: '', cookingTime: '' });
  const [ingredientsText, setIngredientsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 🔍 سیستم هوشمند تشخیص علائم جداکننده اشتباه
    const invalidSeparators = /[-/|._]/; 
    if (invalidSeparators.test(ingredientsText)) {
      setError("❌ خطا: لطفاً مواد اولیه را فقط با علامت ویرگول فارسی ( ، ) یا کاما انگلیسی ( , ) از هم جدا کنید. از گذاشتن خط تیره (-) یا خط کج (/) خودداری کنید.");
      setLoading(false);
      return;
    }

    // بررسی اینکه آیا اصلاً جداکننده‌ای وارد شده اگر چند ماده هست
    if (ingredientsText.includes(' ') && !ingredientsText.includes('،') && !ingredientsText.includes(',')) {
      setError("💡 یادآوری: لطفاً بین هر ماده اولیه از علامت ویرگول فارسی یعنی ( ، ) استفاده کنید تا سیستم بتواند آن‌ها را تفکیک کند.");
      setLoading(false);
      return;
    }

    try {
      await recipeService.createRecipe({
        title: formData.title,
        description: ingredientsText,
        instructions: formData.instructions,
        cooking_time: parseInt(formData.cookingTime)
      });
      alert("دستور پخت شما با موفقیت ثبت شد.");
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "خطا در ثبت. لطفاً مجدداً لاگین کنید.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-sm border" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👩‍🍳 اشتراک‌گذاری دستور جدید</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm border-r-4 border-red-500 leading-relaxed">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="نام غذا" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <input 
            type="number" placeholder="زمان نیاز برای پخت (دقیقه)" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.cookingTime} onChange={e => setFormData({...formData, cookingTime: e.target.value})}
          />
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              مواد اولیه لازم <span className="text-orange-600 font-bold">(حتماً با علامت ویرگول « ، » جدا کنید):</span>
            </label>
            <input 
              type="text" 
              placeholder="مثال: مرغ ، پیاز ، سیب زمینی" required
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-right"
              value={ingredientsText} onChange={e => setIngredientsText(e.target.value)}
            />
          </div>

          <textarea 
            placeholder="مراحل تهیه را گام به گام بنویسید..." required
            className="w-full p-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
          />
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-md transition-all"
          >
            {loading ? 'در حال ارسال...' : '🚀 ارسال جهت بررسی ادمین'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
