import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary'); 
  
  // وضعیت‌های داده‌ای (Data States)
  const [stats, setStats] = useState({ total_users: 0, total_recipes: 0, total_ingredients: 0, latest_items: [] });
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: 'سایر' });

  // وضعیت‌های رابط کاربری (UI & Error States)
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // ۱. کنترل دسترسی امنیتی (Client-side Route Protection)
  useEffect(() => {
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminToken || adminToken !== 'SUPER_SECRET_ADMIN_KEY_2026') {
        alert("❌ خطای امنیتی: شما به این صفحه دسترسی ندارید. این بخش مخصوص مدیریت است.");
        navigate('/login');
      }
    }, [navigate]);

  // دریافت تمام داده‌های ادمین با مدیریت خطای کامل
  const fetchAdminData = async () => {
    try {
      setGlobalError('');
      
      const resStats = await api.get('/admin/summary-stats');
      setStats({
        total_users: resStats.data?.total_users || 0,
        total_recipes: resStats.data?.total_recipes || 0,
        total_ingredients: resStats.data?.total_ingredients || 0,
        latest_items: resStats.data?.latest_items || []
      });

      const resPending = await api.get('/admin/pending-recipes');
      setPendingRecipes(resPending.data || []);

      const resAllRecipes = await api.get('/admin/all-recipes');
      setAllRecipes(resAllRecipes.data || []);

      const resUsers = await api.get('/admin/users');
      setUsers(resUsers.data || []);
      
    } catch (err) {
      console.error("خطا در بارگذاری اطلاعات پنل ادمین", err);
      setGlobalError("❌ خطا در برقراری ارتباط با سرور. لطفا اتصال اینترنت یا وضعیت بک‌آند را بررسی کنید.");
    } finally {
      setGlobalLoading(false); // پایان لودینگ اصلی سیستم
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // عملیات تایید و حذف
  const approveRecipe = async (id) => {
    try {
      await api.patch(`/admin/approve-recipe/${id}`);
      fetchAdminData();
    } catch (err) {
      alert("خطا در تایید دستور پخت");
    }
  };

  const deleteRecipe = async (id) => {
    if (window.confirm("آیا از حذف این دستور پخت مطمئن هستید؟")) {
      try {
        await api.delete(`/admin/recipes/${id}`);
        fetchAdminData();
      } catch (err) {
        alert("خطا در حذف دستور پخت");
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("آیا از حذف/مسدودسازی این کاربر مطمئن هستید؟")) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchAdminData();
      } catch (err) {
        alert("خطا در حذف کاربر");
      }
    }
  };

  // افزودن ماده اولیه جدید با کنترل وضعیت لودینگ فرم
  const addIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.name.trim()) return;

    setFormLoading(true);
    try {
      const response = await api.post('/admin/ingredients', null, { 
        params: {
          name: newIngredient.name.trim(),
          category: newIngredient.category.trim()
        } 
      });
      
      alert(response.data?.message || `✅ ماده اولیه "${newIngredient.name}" با موفقیت ذخیره شد!`);
      setNewIngredient({ name: '', category: 'سایر' });
      fetchAdminData(); 
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در ثبت ماده اولیه جدید");
    } finally {
      setFormLoading(false);
    }
  };

  // 🔹 UI State: نمایش حالت لودینگ اولیه کل صفحه به جای صفحه سفید
  if (globalLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">در حال بارگذاری میز کار مدیریت...</p>
      </div>
    );
  }

  // 🔹 UI State: نمایش باکس خطا در صورت عدم دسترسی به سرور/بک‌آند
  if (globalError) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-12 text-center" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl shadow-sm">
          <p className="text-red-700 font-bold text-lg mb-4">{globalError}</p>
          <button onClick={fetchAdminData} className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition">
            🔄 تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      {/* هدر پنل و ناوبری */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">🛠 میز کار مدیریت (Admin)</h1>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('summary')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >📊 نمای خلاصه</button>
          <button 
            onClick={() => setActiveTab('recipes')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'recipes' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >📝 تایید و مدیریت محتوا ({pendingRecipes?.length || 0})</button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >👥 کاربران ({users?.length || 0})</button>
          <button 
            onClick={() => setActiveTab('ingredients')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'ingredients' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >🍎 مواد اولیه</button>
        </div>
      </div>

      {/* زبانه اول: نمای خلاصه داشبورد */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-sm">
              <p className="text-blue-100 font-medium">👥 تعداد کل کاربران</p>
              <h3 className="text-4xl font-black mt-2">{stats?.total_users || 0} <span className="text-sm font-normal">نفر</span></h3>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-sm">
              <p className="text-orange-100 font-medium">🍔 کل دستورهای پخت</p>
              <h3 className="text-4xl font-black mt-2">{stats?.total_recipes || 0} <span className="text-sm font-normal">دستور</span></h3>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-sm">
              <p className="text-emerald-100 font-medium">🌾 کل مواد اولیه بانک دیتابیس</p>
              <h3 className="text-4xl font-black mt-2">{stats?.total_ingredients || 0} <span className="text-sm font-normal">قلم</span></h3>
            </div>
          </div>

          {/* جدول آخرین آیتم‌های ایجاد شده با Optional Chaining دفاعی */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⏱ آخرین آیتم‌های ایجاد شده در سیستم</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3">شناسه</th>
                    <th className="p-3">عنوان آیتم</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3">وضعیت سیستم</th>
                  </tr>
                </thead>
                <tbody>
                  {!stats?.latest_items || stats.latest_items.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-4 text-gray-400">هنوز دیتایی ثبت نشده است.</td></tr>
                  ) : (
                    stats.latest_items.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 transition text-sm">
                        <td className="p-3 text-gray-400 font-mono">#{item.id}</td>
                        <td className="p-3 font-semibold text-gray-700">{item.title}</td>
                        <td className="p-3 text-gray-500">{item.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'منتشر شده' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* زبانه دوم: مدیریت محتوا */}
      {activeTab === 'recipes' && (
        <div>
          <section className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm mb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-4">⏳ دستورهای منتظر بررسی ({pendingRecipes?.length || 0})</h2>
            {!pendingRecipes || pendingRecipes.length === 0 ? <p className="text-gray-500 text-sm">هیچ دستور پختی در صف بررسی نیست.</p> : 
              pendingRecipes.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-xl mb-3 flex justify-between items-center shadow-sm border">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{r.title}</h3>
                    <p className="text-sm text-gray-600 mt-1"><b>مواد اولیه:</b> {r.description}</p>
                    <p className="text-sm text-gray-500 mt-1"><b>طرز تهیه:</b> {r.instructions}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveRecipe(r.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition">✅ تایید</button>
                    <button onClick={() => deleteRecipe(r.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition">حذف</button>
                  </div>
                </div>
              ))
            }
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📚 لیست تمام دستورهای پخت سیستم</h2>
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">عنوان دستور</th>
                  <th className="p-3">دسته‌بندی</th>
                  <th className="p-3">عملیات ادمین</th>
                </tr>
              </thead>
              <tbody>
                {allRecipes?.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{r.title}</td>
                    <td className="p-3 text-gray-500">{r.category}</td>
                    <td className="p-3"><button onClick={() => deleteRecipe(r.id)} className="text-red-500 hover:text-red-700 font-medium">حذف محتوا</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* زبانه سوم: کاربران */}
      {activeTab === 'users' && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">👥 مدیریت کاربران ثبت‌نام شده</h2>
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="p-3">شناسه</th>
                <th className="p-3">ایمیل</th>
                <th className="p-3">اقدامات ادمین</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-gray-400">#{u.id}</td>
                  <td className="p-3 font-medium">{u.email}</td>
                  <td className="p-3">
                    <button onClick={() => deleteUser(u.id)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium">🚫 حذف کاربر</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* زبانه چهارم: افزودن مواد اولیه */}
      {activeTab === 'ingredients' && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🍎 افزودن ماده اولیه جدید</h2>
          <form onSubmit={addIngredient} className="flex gap-4 max-w-xl">
            <input 
              placeholder="نام ماده (مثلاً کلم بروکلی)" 
              className="border p-2 rounded-lg flex-1 text-sm outline-none focus:border-orange-400" required
              value={newIngredient.name}
              onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
              disabled={formLoading}
            />
            <input 
              placeholder="دسته‌بندی (مثلاً صیفی‌جات)" 
              className="border p-2 rounded-lg flex-1 text-sm outline-none focus:border-orange-400"
              value={newIngredient.category}
              onChange={e => setNewIngredient({...newIngredient, category: e.target.value})}
              disabled={formLoading}
            />
            <button 
              type="submit" 
              disabled={formLoading}
              className={`text-white px-6 py-2 rounded-lg text-sm font-bold transition ${formLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {formLoading ? 'در حال ثبت...' : 'ذخیره'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AdminPanel;
