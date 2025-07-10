import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CartsPage from './pages/CartsPage'
import ViewProductPage from './pages/viewProductPage'

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/carts" element={<CartsPage />} />
          <Route path="/products/:slug" element={<ViewProductPage />} />
        </Routes>
    </Router>
  )
}

export default App 