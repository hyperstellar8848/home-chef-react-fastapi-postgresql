import api from './api';

export const recipeService = {
  // دریافت لیست تمام دستور غذاها
  getAllRecipes: async () => {
    const response = await api.get('/recipes');
    return response.data;
  },

  // جستجوی مواد اولیه بر اساس کلمه کلیدی
  searchIngredients: async (query) => {
    const response = await api.get(`/ingredients?q=${query}`);
    return response.data;
  },

  // ثبت یک دستور غذای جدید
  createRecipe: async (recipeData) => {
    const response = await api.post('/recipes', recipeData);
    return response.data;
  },

  // ارسال درخواست پشتیبانی یا اعلام ماده مفقوده به ادمین
  sendSupportMessage: async (content) => {
    const response = await api.post('/support', { email: "user@example.com", content });
    return response.data;
  }
};
