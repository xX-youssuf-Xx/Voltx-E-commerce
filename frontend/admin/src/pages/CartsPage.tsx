import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-hot-toast';

interface Cart {
  cart_id: number;
  shareable_code: string;
  user_id?: number;
  products: Record<string, number>;
  created_at: string;
  updated_at: string;
}

interface Product {
  product_id: number;
  name: string;
  sku: string;
  sell_price: number;
  stock_quantity: number;
}

const CartsPage: React.FC = () => {
  const { get, post, put, delete: del } = useApi();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCart, setEditingCart] = useState<Cart | null>(null);
  const [cartProducts, setCartProducts] = useState<{ product: Product; quantity: number }[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load all carts
  const loadCarts = async () => {
    setLoading(true);
    try {
      const res = await get('/carts');
      if (res.ok) {
        const data = await res.json();
        setCarts(data);
      } else {
        toast.error('Failed to load carts');
      }
    } catch {
      toast.error('Failed to load carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCarts(); }, []);

  // Product search
  useEffect(() => {
    if (productSearch.length > 1) {
      get(`/products?search=${encodeURIComponent(productSearch)}`)
        .then(res => res.ok ? res.json() : [])
        .then(setProductResults);
    } else {
      setProductResults([]);
    }
  }, [productSearch]);

  // Add product to cart
  const handleAddProduct = () => {
    if (!selectedProduct || quantity < 1) return;
    setCartProducts(prev => {
      // If already in cart, update quantity
      const idx = prev.findIndex(p => p.product.product_id === selectedProduct.product_id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product: selectedProduct, quantity }];
    });
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
    setProductResults([]);
  };

  // Remove product from cart
  const handleRemoveProduct = (product_id: number) => {
    setCartProducts(prev => prev.filter(p => p.product.product_id !== product_id));
  };

  // Open modal for create/edit
  const openModal = (cart?: Cart) => {
    if (cart) {
      setEditingCart(cart);
      // Convert products object to array
      setCartProducts(
        Object.entries(cart.products).map(([pid, qty]) => ({
          product: { product_id: Number(pid), name: `Product #${pid}`, sku: '', sell_price: 0, stock_quantity: 0 },
          quantity: Number(qty)
        }))
      );
    } else {
      setEditingCart(null);
      setCartProducts([]);
    }
    setShowModal(true);
  };

  // Create or update cart
  const handleSaveCart = async () => {
    if (cartProducts.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    const productsObj: Record<string, number> = {};
    cartProducts.forEach(({ product, quantity }) => {
      productsObj[product.product_id] = quantity;
    });
    try {
      let res;
      if (editingCart) {
        res = await put(`/carts/${editingCart.cart_id}`, { products: productsObj });
      } else {
        res = await post('/carts', { products: productsObj });
      }
      if (res.ok) {
        toast.success(editingCart ? 'Cart updated' : 'Cart created');
        setShowModal(false);
        loadCarts();
      } else {
        toast.error('Failed to save cart');
      }
    } catch {
      toast.error('Failed to save cart');
    }
  };

  // Delete cart
  const handleDeleteCart = async (cart_id: number) => {
    if (!window.confirm('Delete this cart?')) return;
    try {
      const res = await del(`/carts/${cart_id}`);
      if (res.ok) {
        toast.success('Cart deleted');
        loadCarts();
      } else {
        toast.error('Failed to delete cart');
      }
    } catch {
      toast.error('Failed to delete cart');
    }
  };

  // Copy shareable link
  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/cart/${code}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(null), 1500);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Carts</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Cart
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading carts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Shareable Code</th>
                  <th className="px-4 py-2 text-left">Products</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {carts.map(cart => (
                  <tr key={cart.cart_id} className="border-b">
                    <td className="px-4 py-2">{cart.cart_id}</td>
                    <td className="px-4 py-2 font-mono">
                      {cart.shareable_code}
                      <button
                        className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                        onClick={() => handleCopyLink(cart.shareable_code)}
                      >
                        {copySuccess === cart.shareable_code ? 'Copied!' : 'Copy Link'}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {Object.entries(cart.products).map(([pid, qty]) => {
                        const prod = cartProducts.find(p => p.product.product_id === Number(pid));
                        return (
                          <span key={pid} className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded">
                            {prod ? prod.product.name : `Product`} : {qty}
                          </span>
                        );
                      })}
                    </td>
                    <td className="px-4 py-2">{new Date(cart.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs hover:bg-yellow-200"
                        onClick={() => openModal(cart)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200"
                        onClick={() => handleDeleteCart(cart.cart_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {carts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No carts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal for create/edit cart */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingCart ? 'Edit Cart' : 'Create Cart'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Product search and add */}
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                  placeholder="Search products..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-2/3"
                  onFocus={() => setProductResults(productResults)}
                />
                <input
                  type="text"
                  value={quantity}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
                  placeholder="Qty"
                  maxLength={4}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  disabled={!selectedProduct || quantity < 1}
                  onClick={handleAddProduct}
                >
                  Add
                </button>
              </div>
              {/* Product results */}
              {productResults.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded p-2 max-h-40 overflow-y-auto mt-2">
                  {productResults.map(prod => (
                    <div
                      key={prod.product_id}
                      className={`flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-blue-100 rounded ${selectedProduct?.product_id === prod.product_id ? 'bg-blue-200' : ''}`}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setProductSearch(prod.name);
                        setProductResults([]);
                      }}
                    >
                      <span>{prod.name}</span>
                      <span className="text-xs text-gray-500">Stock: {prod.stock_quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Cart products list */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Cart Products</h3>
                {cartProducts.length === 0 ? (
                  <div className="text-gray-400 text-sm">No products added</div>
                ) : (
                  <ul className="space-y-2">
                    {cartProducts.map(({ product, quantity }) => (
                      <li key={product.product_id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <span>{product.name}</span>
                        <span className="font-mono">Qty: {quantity}</span>
                        <button
                          className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          onClick={() => handleRemoveProduct(product.product_id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCart}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCart ? 'Update Cart' : 'Create Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartsPage; 