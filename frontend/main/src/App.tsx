import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import CartsPage from './pages/CartsPage';
import Services from './pages/Services';
import LinktreePage from './pages/LinktreePage';
import ViewProductPage from './pages/viewProductPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/carts" element={<CartsPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/linktree" element={<LinktreePage />} />
          <Route path="/product/:id" element={<ViewProductPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 