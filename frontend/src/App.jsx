import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SearchByIngredients from './pages/SearchByIngredients';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search-ingredients" element={<SearchByIngredients />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} /> 
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
