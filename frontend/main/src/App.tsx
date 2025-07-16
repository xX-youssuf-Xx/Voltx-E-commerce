import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartWishlistProvider } from './contexts/CartWishlistContext';
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import Services from './pages/Services';
import LinktreePage from './pages/LinktreePage';
import ViewProductPage from './pages/viewProductPage';
import CartPage from './pages/Cart';
import SharedCartPage from './pages/SharedCartPage';
import CheckoutPage from './pages/Checkout';

function App() {
  return (
    <AuthProvider>
      <CartWishlistProvider>
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
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/cart/:cartId" element={<SharedCartPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/linktree" element={<LinktreePage />} />
            <Route path="/product/:slug" element={<ViewProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Router>
      </CartWishlistProvider>
    </AuthProvider>
  );
}

export default App; 