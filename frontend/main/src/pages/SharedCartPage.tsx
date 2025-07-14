import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useCartWishlist } from '../contexts/CartWishlistContext';
import {  ShoppingCart } from 'lucide-react';

interface CartProduct {
  product_id: string;
  name: string;
  primary_media?: string;
  sell_price: string;
  offer_price?: string | null;
  is_offer: boolean;
  status: string;
  is_custom_status?: boolean;
  custom_status?: string | null;
  custom_status_color?: string | null;
  category_name?: string;
  short_description?: string;
  slug: string;
}

interface SharedCartItem {
  product_id: string;
  quantity: number;
}

interface CartData {
  cart_id: string;
  shareable_code: string;
  user_id: number | null;
  products: Record<string, number>;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3000';

const SharedCartPage = () => {
  const { cartId } = useParams<{ cartId: string }>();
  const navigate = useNavigate();
  const {  clearCart, addToCart } = useCartWishlist();
  const [sharedCartItems, setSharedCartItems] = useState<SharedCartItem[]>([]);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  // Fetch shared cart data
  useEffect(() => {
    if (!cartId) {
      setError('Invalid cart ID');
      setLoading(false);
      return;
    }

    const fetchSharedCart = async () => {
      try {
        const res = await fetch(`${API_BASE}/carts/code/${cartId}`);
        if (!res.ok) {
          throw new Error('Cart not found');
        }
        const cartData: CartData = await res.json();
        
        // Convert products object to array format
        const productsArray: SharedCartItem[] = Object.entries(cartData.products).map(([productId, quantity]) => ({
          product_id: productId,
          quantity: quantity
        }));
        
        setSharedCartItems(productsArray);
      } catch (err) {
        setError('Failed to load shared cart');
        setLoading(false);
      }
    };

    fetchSharedCart();
  }, [cartId]);

  // Fetch product details when shared cart items are loaded
  useEffect(() => {
    if (sharedCartItems.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const ids = sharedCartItems.map(item => item.product_id);
        const res = await fetch(`${API_BASE}/products/by-ids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await res.json();
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          throw new Error('Invalid products data');
        }
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sharedCartItems]);

  // Calculate subtotal
  const subtotal = products.reduce((sum, product) => {
    const cartItem = sharedCartItems.find(item => item.product_id === product.product_id);
    const qty = cartItem?.quantity || 0;
    const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
    return sum + price * qty;
  }, 0);

  // Copy shared cart to user's cart
  const handleCopyToCart = () => {
    setCopying(true);
    
    // Clear current cart
    clearCart();
    
    // Add all products from shared cart to user's cart
    sharedCartItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product_id);
      }
    });
    
    setCopying(false);
    
    // Navigate to user's cart
    navigate('/cart');
  };

  // Get quantity for a product
  const getProductQuantity = (productId: string) => {
    const item = sharedCartItems.find(item => item.product_id === productId);
    return item?.quantity || 0;
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8 bg-[#f8f9fa] min-h-screen">
          <div className="flex justify-center items-center h-40 text-lg text-gray-400">
            Loading shared cart...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8 bg-[#f8f9fa] min-h-screen">
          <div className="flex flex-col items-center justify-center h-40 text-lg text-red-500">
            <p>{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8 bg-[#f8f9fa] min-h-screen" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        <div className="flex flex-col max-w-6xl w-full flex-1">
          <div className="flex flex-wrap justify-between items-center gap-4 p-6 mb-8">
            <h2 className="text-blue-600 text-4xl font-bold leading-tight tracking-tight">Shared Cart</h2>
          </div>
          
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-6">
              {products.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-lg text-gray-400">
                  This shared cart is empty.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-8 py-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-2/5">Product</th>
                          <th className="px-8 py-6 text-center text-sm font-medium text-gray-500 uppercase tracking-wider w-1/5">Quantity</th>
                          <th className="px-8 py-6 text-right text-sm font-medium text-gray-500 uppercase tracking-wider w-1/5">Unit Price</th>
                          <th className="px-8 py-6 text-right text-sm font-medium text-gray-500 uppercase tracking-wider w-1/5">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => {
                          const qty = getProductQuantity(product.product_id);
                          const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
                          return (
                            <tr key={product.product_id}>
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-900">
                                <div className="flex items-center space-x-4">
                                  <img
                                    alt={product.name}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                    src={product.primary_media ? MEDIA_BASE + product.primary_media : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                  />
                                  <div>
                                    <div className="font-semibold text-lg">{product.name}</div>
                                    {product.category_name && (
                                      <div className="text-sm text-gray-500">{product.category_name}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-center">
                                <span className="text-xl font-semibold text-black">{qty}</span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-right text-base text-gray-900">
                                <div className="font-semibold">{price.toFixed(2)} EGP</div>
                                {product.is_offer && product.offer_price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {Number(product.sell_price).toFixed(2)} EGP
                                  </div>
                                )}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-right font-bold text-lg text-blue-600">
                                {(price * qty).toFixed(2)} EGP
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {products.map(product => {
                      const qty = getProductQuantity(product.product_id);
                      const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
                      return (
                        <div key={product.product_id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <img
                              alt={product.name}
                              className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                              src={product.primary_media ? MEDIA_BASE + product.primary_media : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-lg text-gray-900 mb-1">{product.name}</div>
                              {product.category_name && (
                                <div className="text-sm text-gray-500 mb-2">{product.category_name}</div>
                              )}
                              <div className="font-semibold text-blue-600 mb-2">{price.toFixed(2)} EGP</div>
                              {product.is_offer && product.offer_price && (
                                <div className="text-sm text-gray-500 line-through mb-2">
                                  {Number(product.sell_price).toFixed(2)} EGP
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-semibold text-black">Qty: {qty}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg text-blue-600">{(price * qty).toFixed(2)} EGP</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            
            {products.length > 0 && (
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h3 className="text-blue-600 text-2xl font-semibold leading-tight mb-6">Cart Summary</h3>
                <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-6">
                  <p className="text-lg text-gray-600">Subtotal</p>
                  <p className="text-2xl font-bold text-blue-600">{subtotal.toFixed(2)} EGP</p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleCopyToCart}
                    disabled={copying}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart size={20} />
                    {copying ? 'Copying to Cart...' : 'Copy to My Cart'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SharedCartPage; 