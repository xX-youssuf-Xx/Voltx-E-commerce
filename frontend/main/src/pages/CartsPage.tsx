import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface Product {
  product_id: number;
  name: string;
  sku: string;
  sell_price: number;
  stock_quantity: number;
}

const CartsPage: React.FC = () => {
  const { get, post } = useApi();
  const [cartProducts, setCartProducts] = useState<{ product: Product; quantity: number }[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [showResults, setShowResults] = useState(false);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Product search
  useEffect(() => {
    if (productSearch.length > 1 && !selectedProduct) {
      get(`/products?search=${encodeURIComponent(productSearch)}`)
        .then(res => res.ok ? res.json() : [])
        .then(setProductResults);
      setShowResults(true);
    } else {
      setProductResults([]);
      setShowResults(false);
    }
  }, [productSearch, selectedProduct]);

  // Add product to cart
  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 1000) {
      setError('Quantity must be a positive number (max 1000)');
      return;
    }
    setCartProducts(prev => {
      const idx = prev.findIndex(p => p.product.product_id === selectedProduct.product_id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += qty;
        return updated;
      }
      return [...prev, { product: selectedProduct, quantity: qty }];
    });
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity('1');
    setShowResults(false);
    setError('');
  };

  // Remove product from cart
  const handleRemoveProduct = (product_id: number) => {
    setCartProducts(prev => prev.filter(p => p.product.product_id !== product_id));
  };

  // Handle product selection
  const handleProductSelect = (prod: Product) => {
    setSelectedProduct(prod);
    setProductSearch(prod.name);
    setShowResults(false);
  };

  // Handle quantity input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setQuantity(val);
    if (val && (parseInt(val, 10) < 1 || parseInt(val, 10) > 1000)) {
      setError('Quantity must be between 1 and 1000');
    } else {
      setError('');
    }
  };

  // Create cart
  const handleCreateCart = async () => {
    if (cartProducts.length === 0) {
      setError('Add at least one product');
      return;
    }
    setCreating(true);
    setError('');
    const productsObj: Record<string, number> = {};
    cartProducts.forEach(({ product, quantity }) => {
      productsObj[product.product_id] = quantity;
    });
    try {
      const res = await post('/carts', { products: productsObj });
      if (res.ok) {
        const data = await res.json();
        setShareableLink(`${window.location.origin}/cart/${data.shareable_code}`);
      } else {
        setError('Failed to create cart');
      }
    } catch {
      setError('Failed to create cart');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Create a Shareable Cart</h1>
      {shareableLink ? (
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <div className="text-lg font-semibold mb-2">Your shareable cart link:</div>
          <div className="font-mono bg-white rounded px-2 py-1 inline-block mb-2">{shareableLink}</div>
          <button
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {navigator.clipboard.writeText(shareableLink)}}
          >Copy Link</button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2 items-center mb-4">
            <input
              type="text"
              value={productSearch}
              onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
              placeholder="Search products..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-2/3"
              onFocus={() => setShowResults(!!productResults.length)}
            />
            <input
              type="text"
              value={quantity}
              onChange={handleQuantityChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
              placeholder="Qty"
              maxLength={4}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              disabled={!selectedProduct || !quantity || !!error}
              onClick={handleAddProduct}
            >
              Add
            </button>
          </div>
          {/* Product results */}
          {showResults && productResults.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2 max-h-40 overflow-y-auto mb-2">
              {productResults.map(prod => (
                <div
                  key={prod.product_id}
                  className={`flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-blue-100 rounded ${selectedProduct?.product_id === prod.product_id ? 'bg-blue-200' : ''}`}
                  onClick={() => handleProductSelect(prod)}
                >
                  <span>{prod.name} <span className="text-xs text-gray-400">(SKU: {prod.sku})</span></span>
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
          {error && <div className="text-red-600 font-semibold mt-2 text-sm">{error}</div>}
          <div className="flex justify-end mt-6">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              onClick={handleCreateCart}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Shareable Cart'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartsPage; 