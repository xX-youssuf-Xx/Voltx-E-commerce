import React, { useState, useEffect } from 'react';
import { useCartWishlist } from '../contexts/CartWishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

interface Product {
  product_id: string;
  name: string;
  sell_price: string;
  offer_price?: string | null;
  is_offer: boolean;
  primary_media?: string;
  category_name?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3000';

const CheckoutPage: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useCartWishlist();
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [shippingLocation, setShippingLocation] = useState('');
  const [isShipping, setIsShipping] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Fetch product details for cart items
  useEffect(() => {
    const ids = cart.map(item => item.productId);
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/products/by-ids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [cart]);

  // Move subtotal calculation above coupon validation useEffect
  const subtotal = products.reduce((sum, product) => {
    const cartItem = cart.find(item => item.productId === product.product_id);
    const qty = cartItem?.quantity || 0;
    const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
    return sum + price * qty;
  }, 0);

  // Validate coupon when changed
  useEffect(() => {
    if (!coupon) {
      setDiscount(0);
      return;
    }
    let cancelled = false;
    setValidatingCoupon(true);
    const productsObj = cart.reduce((obj: Record<string, number>, item) => {
      obj[item.productId] = item.quantity;
      return obj;
    }, {} as Record<string, number>);
    api.post('/products/validate-coupon', {
      coupon,
      products: productsObj,
      price: subtotal
    })
      .then((res: any) => {
        // Accept both res.discount and res.data.discount
        let discount = 0;
        if (typeof res?.discount === 'number') discount = res.discount;
        else if (res?.data && typeof res.data.discount === 'number') discount = res.data.discount;
        if (!cancelled) setDiscount(discount);
      })
      .catch(() => {
        if (!cancelled) setDiscount(0);
      })
      .finally(() => {
        if (!cancelled) setValidatingCoupon(false);
      });
    return () => { cancelled = true; };
  }, [coupon, cart, subtotal]);

  const total = subtotal - discount;

  // Only clear cart if backend confirms order (success and order/order_id present)
  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to proceed to checkout.');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const productsObj = cart.reduce((obj: Record<string, number>, item) => {
        obj[item.productId] = item.quantity;
        return obj;
      }, {} as Record<string, number>);
      const payload = {
        products: productsObj,
        price: subtotal,
        discount_code: coupon || null,
        is_shipping: isShipping,
        shipping_location: isShipping ? shippingLocation : null,
        total_price: total,
        order_type: user && user.role_id === 3 ? 'cashier' : 'customer',
        customer_id: user ? user.user_id : null,
        cashier_id: user && user.role_id === 3 ? user.user_id : null,
        payment_method: 'unpaid',
        price_paid: 0
      };
      const res: any = await api.post('/products/checkout', payload);
      let order = null;
      if (res?.order) order = res.order;
      else if (res?.data?.order) order = res.data.order;
      if (order && order.order_id) {
        setSuccess('Order placed successfully! Discount applied: ' + (order?.discount || 0));
        clearCart();
      } else {
        setError('Order could not be confirmed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError(null);
    setValidatingCoupon(true);
    const productsObj = cart.reduce((obj: Record<string, number>, item) => {
      obj[item.productId] = item.quantity;
      return obj;
    }, {} as Record<string, number>);
    try {
      const res: any = await api.post('/products/validate-coupon', {
        coupon,
        products: productsObj,
        price: subtotal
      });
      let discount = 0;
      if (typeof res?.discount === 'number') discount = res.discount;
      else if (res?.data && typeof res.data.discount === 'number') discount = res.data.discount;
      if (discount > 0) {
        setDiscount(discount);
        setCouponError(null);
      } else {
        setDiscount(0);
        setCouponError('Coupon is not valid or does not apply.');
      }
    } catch {
      setDiscount(0);
      setCouponError('Coupon is not valid or does not apply.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8 bg-[#f8f9fa] min-h-screen" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        <div className="flex flex-col max-w-6xl w-full flex-1">
          <div className="flex flex-wrap justify-between items-center gap-4 p-6 mb-8">
            <h2 className="text-blue-600 text-4xl font-bold leading-tight tracking-tight">Checkout</h2>
          </div>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-6">
              {cart.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-lg text-gray-400">Your cart is empty.</div>
              ) : loading ? (
                <div className="flex justify-center items-center h-40 text-lg text-gray-400">Loading products...</div>
              ) : (
                <>
                  {/* Product List */}
                  <div className="space-y-4 mb-8">
                    {products.map(product => {
                      const cartItem = cart.find(item => item.productId === product.product_id);
                      if (!cartItem) return null;
                      return (
                        <div key={product.product_id} className="flex items-center justify-between border-b py-4">
                          <div className="flex items-center gap-4">
                            <img
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                              src={product.primary_media ? MEDIA_BASE + product.primary_media : '/placeholder.png'}
                              onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                            />
                            <div>
                              <div className="font-semibold text-lg">{product.name}</div>
                              {product.category_name && <div className="text-sm text-gray-500">{product.category_name}</div>}
                              <div className="text-xs text-gray-500">Qty: {cartItem.quantity}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateCartQuantity(product.product_id, cartItem.quantity - 1)} disabled={cartItem.quantity <= 1} className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-bold text-lg flex items-center justify-center transition-colors">-</button>
                            <input
                              type="number"
                              min={1}
                              value={cartItem.quantity}
                              onChange={e => updateCartQuantity(product.product_id, Math.max(1, Number(e.target.value)))}
                              className="w-12 text-lg font-semibold text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                              style={{ minWidth: 0 }}
                            />
                            <button onClick={() => updateCartQuantity(product.product_id, cartItem.quantity + 1)} className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-bold text-lg flex items-center justify-center transition-colors">+</button>
                            <button onClick={() => removeFromCart(product.product_id)} className="text-red-500 ml-2">Remove</button>
                          </div>
                          <div className="font-semibold text-blue-600 text-lg">
                            {((product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price)) * cartItem.quantity).toFixed(2)} EGP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Shipping/Pickup */}
                  <div className="mb-4">
                    <label className="block font-medium mb-1 text-black">Shipping or Pickup</label>
                    <div className="flex gap-4 mb-2">
                      <label className="text-black">
                        <input type="radio" checked={isShipping} onChange={() => setIsShipping(true)} /> Shipping
                      </label>
                      <label className="text-black">
                        <input type="radio" checked={!isShipping} onChange={() => setIsShipping(false)} /> Pickup
                      </label>
                    </div>
                    {isShipping && (
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 bg-white text-black"
                        placeholder="Enter shipping location"
                        value={shippingLocation}
                        onChange={e => setShippingLocation(e.target.value)}
                      />
                    )}
                  </div>
                  {/* Coupon */}
                  <div className="mb-4">
                    <label className="block font-medium mb-1 text-black">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 bg-white text-black"
                        placeholder="Enter coupon code"
                        value={coupon}
                        onChange={e => setCoupon(e.target.value)}
                      />
                      <button
                        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !coupon}
                      >
                        {validatingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <div className="text-red-600 mt-1">{couponError}</div>}
                  </div>
                </>
              )}
            </div>
            {/* Order Summary */}
            <div className="p-8 bg-gray-50 border-t border-gray-200">
              <h3 className="text-blue-600 text-2xl font-semibold leading-tight mb-6">Order Summary</h3>
              <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-6">
                <p className="text-lg text-gray-600">Subtotal</p>
                <p className="text-2xl font-bold text-blue-600">{subtotal.toFixed(2)} EGP</p>
              </div>
              <div className="flex justify-between mb-2">
                <span>Discount</span>
                <span>-{discount.toFixed(2)}{validatingCoupon && ' (checking...)'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>{total.toFixed(2)} EGP</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
              {success && <div className="mt-4 text-green-600">{success}</div>}
              {error && <div className="mt-4 text-red-600">{error}</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage; 