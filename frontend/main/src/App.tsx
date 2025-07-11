import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import HomePage from './pages/HomePage'
import CartsPage from './pages/CartsPage'
import ViewProductPage from './pages/viewProductPage'
import LinktreePage from './pages/LinktreePage'
import Services from './pages/Services';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/carts" element={<CartsPage />} />
          <Route path="/products/:slug" element={<ViewProductPage />} />
          <Route path="/linktree" element={<LinktreePage />} />
          <Route path="/services" element={<Services />} />
        </Routes>
    </Router>
  )
}

export default App 