import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CartsPage from './pages/CartsPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow mb-6 px-4 py-3 flex gap-4">
          <Link to="/" className="font-semibold text-blue-700 hover:underline">Home</Link>
          <Link to="/carts" className="font-semibold text-blue-700 hover:underline">Carts</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/carts" element={<CartsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 