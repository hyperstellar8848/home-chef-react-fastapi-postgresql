import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Recipes from './pages/Recipes';
import AdminPanel from './pages/AdminPanel';

const Home = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold text-orange-600 shadow-sm">🍳 HomeChef is Ready!</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recipes />} />
        <Route path="/admin" element={<AdminPanel />} /> {/* <--- تعریف آدرس /admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
