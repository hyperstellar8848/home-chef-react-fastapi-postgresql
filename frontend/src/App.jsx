import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold text-orange-600 shadow-sm">🍳 HomeChef is Ready!</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
