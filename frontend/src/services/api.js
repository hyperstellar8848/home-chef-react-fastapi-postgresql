import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// این بخش توکن را به تمام درخواست‌ها الصاق می‌کند
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // مطمئن شو در Login هم اسمش 'token' است
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // این بخش برای مدیریت خطاهای احتمالی قبل از ارسال درخواست است
    return Promise.reject(error);
  }
);

export default api;
