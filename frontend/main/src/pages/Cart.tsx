import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useCartWishlist } from '../contexts/CartWishlistContext';
import { Trash2, Share2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3000';

interface ProductRowProps {
  product: CartProduct;
  quantity: number;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
  onCommitQuantity: (productId: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ 
  product, 
  quantity, 
  onQuantityChange, 
  onRemove,
  onCommitQuantity 
}) => {
  const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
  const total = price * quantity;

  const handleQuantityUpdate = useCallback((change: number) => {
    const newQty = Math.max(1, quantity + change);
    onQuantityChange(product.product_id, newQty);
  }, [quantity, onQuantityChange, product.product_id]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Number(e.target.value));
    onQuantityChange(product.product_id, val);
  }, [onQuantityChange, product.product_id]);

  const handleInputBlur = useCallback(() => {
    onCommitQuantity(product.product_id);
  }, [onCommitQuantity, product.product_id]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommitQuantity(product.product_id);
    }
  }, [onCommitQuantity, product.product_id]);

  const handleRemove = useCallback(() => {
    onRemove(product.product_id);
  }, [onRemove, product.product_id]);

  return (
    <tr>
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
        <div className="flex items-center justify-center gap-3">
          <button
            className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-bold text-xl flex items-center justify-center transition-colors"
            onClick={() => handleQuantityUpdate(-1)}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-16 text-xl font-semibold text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            style={{ minWidth: 0 }}
          />
          <button
            className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-bold text-xl flex items-center justify-center transition-colors"
            onClick={() => handleQuantityUpdate(1)}
          >
            +
          </button>
        </div>
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
        {total.toFixed(2)} EGP
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <button
          className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
          onClick={handleRemove}
          aria-label="Remove from cart"
        >
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
};

interface ProductCardProps {
  product: CartProduct;
  quantity: number;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
  onCommitQuantity: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  quantity, 
  onQuantityChange, 
  onRemove,
  onCommitQuantity 
}) => {
  const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
  const total = price * quantity;

  const handleQuantityUpdate = useCallback((change: number) => {
    const newQty = Math.max(1, quantity + change);
    onQuantityChange(product.product_id, newQty);
  }, [quantity, onQuantityChange, product.product_id]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Number(e.target.value));
    onQuantityChange(product.product_id, val);
  }, [onQuantityChange, product.product_id]);

  const handleInputBlur = useCallback(() => {
    onCommitQuantity(product.product_id);
  }, [onCommitQuantity, product.product_id]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommitQuantity(product.product_id);
    }
  }, [onCommitQuantity, product.product_id]);

  const handleRemove = useCallback(() => {
    onRemove(product.product_id);
  }, [onRemove, product.product_id]);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
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
              <button
                className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-bold text-lg flex items-center justify-center transition-colors"
                onClick={() => handleQuantityUpdate(-1)}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-12 text-lg font-semibold text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                style={{ minWidth: 0 }}
              />
              <button
                className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-bold text-lg flex items-center justify-center transition-colors"
                onClick={() => handleQuantityUpdate(1)}
              >
                +
              </button>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-blue-600">{total.toFixed(2)} EGP</div>
              <button
                className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50 mt-1"
                onClick={handleRemove}
                aria-label="Remove from cart"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the components to prevent unnecessary re-renders
const MemoizedProductRow = React.memo(ProductRow);
const MemoizedProductCard = React.memo(ProductCard);

const CartPage = () => {
  const { cart, removeFromCart, updateCartQuantity } = useCartWishlist();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [creatingShare, setCreatingShare] = useState(false);

  // Local state for quantities with localStorage persistence
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  
  // Debounced localStorage save
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Load quantities from localStorage on mount
  useEffect(() => {
    const savedQuantities = localStorage.getItem('cart_quantities');
    if (savedQuantities) {
      try {
        const parsed = JSON.parse(savedQuantities);
        setLocalQuantities(parsed);
      } catch (error) {
        console.error('Error parsing saved quantities:', error);
      }
    }
  }, []);

  // Save quantities to localStorage whenever localQuantities changes
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('cart_quantities', JSON.stringify(localQuantities));
    }, 500); // Debounce for 500ms

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localQuantities]);

  // Sync localQuantities with cart when cart changes
  useEffect(() => {
    const map: Record<string, number> = { ...localQuantities };
    
    cart.forEach(item => {
      // Use saved quantity if available, otherwise use cart quantity
      if (!(item.productId in map)) {
        map[item.productId] = item.quantity;
      }
    });
    
    // Remove quantities for products no longer in cart
    const cartProductIds = new Set(cart.map(item => item.productId));
    Object.keys(map).forEach(productId => {
      if (!cartProductIds.has(productId)) {
        delete map[productId];
      }
    });
    
    setLocalQuantities(map);
  }, [cart]);

  // Memoized quantity change handler to prevent re-renders
  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  }, []);

  // Commit quantity to context (and backend)
  const commitQuantity = useCallback((productId: string) => {
    const local = localQuantities[productId];
    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem && local !== cartItem.quantity) {
      updateCartQuantity(productId, local);
    }
  }, [localQuantities, cart, updateCartQuantity]);

  // Memoized remove handler
  const handleRemove = useCallback((productId: string) => {
    removeFromCart(productId);
    // Also remove from localStorage
    setLocalQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  }, [removeFromCart]);

  // Fetch products when cart changes
  useEffect(() => {
    const ids = cart.map(item => item.productId);
    if (ids.length === 0) {
      setProducts([]);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`${API_BASE}/products/by-ids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          setError('Unexpected response from server.');
          setProducts([]);
        } else {
          setProducts(data);
        }
      })
      .catch(() => {
        setError('Failed to load cart products.');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [cart]);

  // Memoized subtotal calculation
  const subtotal = useMemo(() => {
    return products.reduce((sum, product) => {
      const qty = localQuantities[product.product_id] || 0;
      const price = product.is_offer && product.offer_price ? Number(product.offer_price) : Number(product.sell_price);
      return sum + price * qty;
    }, 0);
  }, [products, localQuantities]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    // TODO: Implement checkout functionality
    toast('Checkout functionality will be implemented here');
  }, []);

  // Handle share cart
  const handleShareCart = useCallback(async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setCreatingShare(true);
    const productsObj: Record<string, number> = {};
    cart.forEach(item => {
      productsObj[item.productId] = localQuantities[item.productId] || item.quantity;
    });
    
    try {
      const res = await fetch(`${API_BASE}/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsObj }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setShareableLink(`https://voltx-store.com/cart/${data.shareable_code}`);
        setShowSharePopup(true);
      } else {
        toast.error('Failed to create shareable cart');
      }
    } catch {
      toast.error('Failed to create shareable cart');
    } finally {
      setCreatingShare(false);
    }
  }, [cart, localQuantities]);

  // Copy link to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(shareableLink);
    toast.success('Link copied to clipboard!');
  }, [shareableLink]);

  // Share to WhatsApp
  const shareToWhatsApp = useCallback(() => {
    const text = `Check out this cart: ${shareableLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }, [shareableLink]);

  const handleContinueShopping = useCallback(() => {
    window.location.href = '/shop';
  }, []);

  return (
    <>
      <NavBar />
      <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8 bg-[#f8f9fa] min-h-screen" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        <div className="flex flex-col max-w-6xl w-full flex-1">
          <div className="flex flex-wrap justify-between items-center gap-4 p-6 mb-8">
            <h2 className="text-blue-600 text-4xl font-bold leading-tight tracking-tight">Shopping Cart</h2>
          </div>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-6">
              {error ? (
                <div className="flex justify-center items-center h-40 text-lg text-red-500">{error}</div>
              ) : loading ? (
                <div className="flex justify-center items-center h-40 text-lg text-gray-400">Loading...</div>
              ) : products.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-lg text-gray-400">Your cart is empty.</div>
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
                          <th className="px-8 py-6"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                          <MemoizedProductRow
                            key={product.product_id}
                            product={product}
                            quantity={localQuantities[product.product_id] || 1}
                            onQuantityChange={handleQuantityChange}
                            onRemove={handleRemove}
                            onCommitQuantity={commitQuantity}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {products.map(product => (
                      <MemoizedProductCard
                        key={product.product_id}
                        product={product}
                        quantity={localQuantities[product.product_id] || 1}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                        onCommitQuantity={commitQuantity}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-200">
              <h3 className="text-blue-600 text-2xl font-semibold leading-tight mb-6">Order Summary</h3>
              <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-6">
                <p className="text-lg text-gray-600">Subtotal</p>
                <p className="text-2xl font-bold text-blue-600">{subtotal.toFixed(2)} EGP</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors flex-1 sm:flex-none"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                    onClick={handleShareCart}
                    disabled={creatingShare}
                  >
                    <Share2 size={20} />
                    {creatingShare ? 'Creating...' : 'Share Cart'}
                  </button>
                </div>
                <button
                  className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-lg transition-colors w-full sm:w-auto"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Cart Popup */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Share Your Cart</h3>
              <button
                onClick={() => setShowSharePopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Share this link with others to let them see your cart:</p>
              <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between">
                <p className="text-sm font-mono text-gray-800 break-all flex-1">{shareableLink}</p>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={shareToWhatsApp}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
              <button
                onClick={() => setShowSharePopup(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CartPage;