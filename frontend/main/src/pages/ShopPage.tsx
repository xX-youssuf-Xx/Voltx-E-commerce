import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, Heart, ShoppingCart, Filter, X } from 'lucide-react';
import './ShopPage.css';
import { useCartWishlist } from '../contexts/CartWishlistContext';

// Types
interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  subcategories?: Category[];
}

interface Product {
  product_id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  sell_price: string;
  offer_price?: string | null;
  is_offer: boolean;
  status: string;
  is_custom_status?: boolean;
  custom_status?: string | null;
  custom_status_color?: string | null;
  brand_name?: string;
  category_name?: string;
  primary_media?: string;
  badge?: string;
}

interface ShopProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3000';

const ShopPage: React.FC = () => {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [appliedPriceMin, setAppliedPriceMin] = useState<number | null>(null);
  const [appliedPriceMax, setAppliedPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>('latest');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ShopProductsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true);
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});
  const [cartLoading, setCartLoading] = useState<Record<string, boolean>>({});
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState<boolean>(false);

  const { cart, wishlist, addToCart, addToWishlist } = useCartWishlist();

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/categories/with-subcategories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Fetch products with all filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(pageSize));
    
    // Add selected categories
    if (selectedCategories.size > 0) {
      Array.from(selectedCategories).forEach(catId => {
        params.append('category_ids', String(catId));
      });
    }
    
    if (appliedPriceMin !== null) params.append('price_min', String(appliedPriceMin));
    if (appliedPriceMax !== null) params.append('price_max', String(appliedPriceMax));
    
    if (sortBy === 'price_asc') {
      params.append('sort_by', 'sell_price');
      params.append('sort_order', 'ASC');
    } else if (sortBy === 'price_desc') {
      params.append('sort_by', 'sell_price');
      params.append('sort_order', 'DESC');
    } else {
      params.append('sort_by', 'created_at');
      params.append('sort_order', 'DESC');
    }
    
    fetch(`${API_BASE}/products/shop?${params.toString()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ShopProductsResponse) => {
        setProducts(data.products || []);
        setPagination(data.pagination || null);
        
        // Fetch wishlist status for products
        if (data.products && data.products.length > 0) {
          // fetchWishlistStatus(data.products.map(p => Number(p.product_id))); // Removed backend call
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setProducts([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [selectedCategories, appliedPriceMin, appliedPriceMax, sortBy, pageSize, page]);

  // Fetch featured products (from homepage endpoint)
  useEffect(() => {
    setLoadingFeatured(true);
    fetch(`${API_BASE}/homepage`)
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.featured_products || []);
      })
      .catch(() => setFeaturedProducts([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  // Fetch wishlist status for products
  const fetchWishlistStatus = async (productIds: number[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      productIds.forEach(id => params.append('product_ids', String(id)));
      
      const response = await fetch(`${API_BASE}/wishlist/status?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const status = await response.json();
        setWishlistStatus(status);
      }
    } catch (error) {
      console.error('Error fetching wishlist status:', error);
    }
  };

  // Handlers
  const handleCategoryToggle = (catId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(catId)) newSet.delete(catId);
      else newSet.add(catId);
      return newSet;
    });
  };

  const handleCategorySelect = (catId: number | null) => {
    if (catId === null) {
      // "All Products" selected - clear all categories and collapse all expanded
      setSelectedCategories(new Set());
      setExpandedCategories(new Set());
    } else {
      setSelectedCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(catId)) {
          newSet.delete(catId);
        } else {
          newSet.add(catId);
        }
        return newSet;
      });
    }
    setPage(1);
  };

  const handleMainCategorySelect = (catId: number) => {
    const category = categories.find(cat => cat.category_id === catId);
    if (category && category.subcategories) {
      setSelectedCategories(prev => {
        const newSet = new Set(prev);
        // Add all subcategories
        category.subcategories!.forEach(sub => newSet.add(sub.category_id));
        return newSet;
      });
    }
    setPage(1);
  };

  const handleApplyPriceFilter = () => {
    setAppliedPriceMin(priceMin ? Number(priceMin) : null);
    setAppliedPriceMax(priceMax ? Number(priceMax) : null);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'latest' | 'price_asc' | 'price_desc');
    setPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategories(new Set());
    setPriceMin('');
    setPriceMax('');
    setAppliedPriceMin(null);
    setAppliedPriceMax(null);
    setPage(1);
    setIsFilterSidebarOpen(false);
  };

  const handleApplyFilters = () => {
    handleApplyPriceFilter();
    setIsFilterSidebarOpen(false);
  };

  // Cart and Wishlist handlers
  const handleAddToCart = async (productId: string) => {
    setCartLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      const response = await fetch(`${API_BASE}/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          products: { [productId]: 1 }
        })
      });

      if (response.ok) {
        alert('Added to cart successfully!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    setWishlistLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to manage wishlist');
        return;
      }

      const isInWishlist = wishlistStatus[productId];
      const url = isInWishlist 
        ? `${API_BASE}/wishlist/${productId}`
        : `${API_BASE}/wishlist`;
      
      const method = isInWishlist ? 'DELETE' : 'POST';
      const body = isInWishlist ? undefined : JSON.stringify({ product_id: productId });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });

      if (response.ok) {
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: !isInWishlist
        }));
      } else {
        alert(isInWishlist ? 'Failed to remove from wishlist' : 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Error managing wishlist');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Product Card
  const ProductCard = ({ product }: { product: Product }) => {
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    const isInWishlist = wishlist.includes(product.product_id);
    const cartItem = cart.find(item => item.productId === product.product_id);

    // Calculate text color for custom status
    const getContrastColor = (backgroundColor: string) => {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    };

    return (
      <div className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:scale-105 hover:-translate-y-1 relative group cursor-pointer" onClick={() => window.location.href = `/product/${product.slug}`}>
        {/* Custom Status Badge - Top Left */}
        {product.is_custom_status && product.custom_status && product.custom_status_color && (
          <div className="absolute top-2 left-2 z-10">
            <span 
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ 
                backgroundColor: product.custom_status_color,
                color: getContrastColor(product.custom_status_color)
              }}
            >
              {product.custom_status}
            </span>
          </div>
        )}
        
        {/* Badge - Top Right */}
        {product.badge && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {product.badge}
            </span>
          </div>
        )}

        <div className="w-full aspect-[4/3] bg-gray-50 p-1 md:p-2 relative">
          <img
            src={product.primary_media ? `${MEDIA_BASE}${product.primary_media}` : placeholderImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).src = placeholderImage; }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              addToWishlist(product.product_id);
            }}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart 
              size={16} 
              className={isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'} 
            />
          </button>
        </div>
        
        <div className="p-2 md:p-3 lg:p-4 border-t border-gray-100">
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              <span className="text-black font-medium">
                {(product.is_offer && product.offer_price ? (Number(product.offer_price) || 0).toFixed(2) : (Number(product.sell_price) || 0).toFixed(2))}
              </span>
              <span className="text-gray-500 ml-1">EGP</span>
            </span>
            
            {/* Add to Cart Button */}
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.product_id);
              }}
              className={`bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition flex items-center justify-center shadow-md ${cartItem ? 'ring-2 ring-blue-400' : ''}`}
              title="Add to Cart"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
              {cartItem && <span className="ml-1 text-xs font-bold">{cartItem.quantity}</span>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Category Tree
  const renderCategoryTree = (cats: Category[]) => (
    <ul className="space-y-1">
      <li key="all">
        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 py-1 px-2 rounded">
          <input 
            type="checkbox" 
            checked={selectedCategories.size === 0} 
            onChange={() => handleCategorySelect(null)} 
            className="w-3 h-3 accent-blue-500 flex-shrink-0" 
          />
          <span className="text-xs text-gray-700 font-medium">All Products</span>
        </label>
      </li>
      {cats.map(cat => (
        <li key={cat.category_id}>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 py-1 px-2 rounded min-w-0 flex-1">
              <input 
                type="checkbox" 
                checked={selectedCategories.has(cat.category_id)} 
                onChange={() => handleCategorySelect(cat.category_id)} 
                className="w-3 h-3 accent-blue-500 flex-shrink-0" 
              />
              <span className="text-xs text-gray-700 truncate" title={cat.name}>{cat.name}</span>
            </label>
            {cat.subcategories && cat.subcategories.length > 0 && (
              <button 
                className="ml-1 text-gray-400 hover:text-blue-500 flex-shrink-0" 
                onClick={() => handleCategoryToggle(cat.category_id)}
              >
                {expandedCategories.has(cat.category_id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
          {cat.subcategories && cat.subcategories.length > 0 && expandedCategories.has(cat.category_id) && (
            <ul className="pl-4 mt-1 space-y-1">
              <li>
                <button
                  onClick={() => handleMainCategorySelect(cat.category_id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-2 truncate block w-full text-left"
                  title={`Select All ${cat.name}`}
                >
                  Select All {cat.name}
                </button>
              </li>
              {cat.subcategories.map(sub => (
                <li key={sub.category_id}>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 py-1 px-2 rounded min-w-0">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.has(sub.category_id)} 
                      onChange={() => handleCategorySelect(sub.category_id)} 
                      className="w-3 h-3 accent-blue-500 flex-shrink-0" 
                    />
                    <span className="text-xs text-gray-500 truncate" title={sub.name}>{sub.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  // Pagination
  const renderPagination = () => {
    if (!pagination) return null;
    const { page, totalPages } = pagination;
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div className="flex justify-center mt-8 gap-2">
        {pages.map(p => (
          <button
            key={p}
            className={`px-3 py-1 rounded ${p === page ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
      </div>
    );
  };

  // Filter Sidebar for Mobile
  const FilterSidebar = () => (
    <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isFilterSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isFilterSidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`} onClick={() => setIsFilterSidebarOpen(false)}></div>
      <div className={`absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${isFilterSidebarOpen ? 'translate-x-0' : '-translate-x-full'} scrollbar-hide`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button 
              onClick={() => setIsFilterSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (EGP)</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
            {categories && categories.length > 0 ? renderCategoryTree(categories) : (
              <div className="text-center text-gray-400 py-4">Loading categories...</div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded transition"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
            <button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-2 rounded transition"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  // Calculate showing range
  let showingStart = 0, showingEnd = 0, totalResults = 0;
  if (pagination) {
    totalResults = pagination.total || 0;
    showingStart = totalResults === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    showingEnd = Math.min(pagination.page * pagination.limit, totalResults);
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavBar />
      
      {/* Mobile Filter Sidebar */}
      <FilterSidebar />
      
      <div className="container mx-auto px-2 md:px-6 py-8 flex-1">
        {/* Featured Products */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
          {loadingFeatured ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredProducts && featuredProducts.length > 0 ? featuredProducts.map(product => (
                <ProductCard key={product.product_id} product={product} />
              )) : (
                <div className="col-span-full text-center text-gray-400 py-8">No featured products available</div>
              )}
            </div>
          )}
        </section>
        
        {/* Mobile Toolbox */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Show</label>
              <select value={pageSize} onChange={handlePageSizeChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                {[10, 20, 40, 80].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-400">per page</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Sort by</label>
              <select value={sortBy} onChange={handleSortChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black w-32">
                <option value="latest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            <button
              onClick={() => setIsFilterSidebarOpen(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded transition"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
          <hr className="border-gray-300" />
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24">
              <div className="mb-2 text-xs text-gray-500 font-medium">
                {`Showing ${showingStart}-${showingEnd} of ${totalResults} results`}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              
              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (EGP)</label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded transition"
                  onClick={handleApplyPriceFilter}
                >
                  Apply Price Filter
                </button>
              </div>
              
              {categories && categories.length > 0 ? renderCategoryTree(categories) : (
                <div className="text-center text-gray-400 py-4">Loading categories...</div>
              )}
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Desktop Toolbox */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Show</label>
                <select value={pageSize} onChange={handlePageSizeChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                  {[10, 20, 40, 80].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-400">per page</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Sort by</label>
                <select value={sortBy} onChange={handleSortChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black w-32">
                  <option value="latest">Latest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-4 py-2 rounded transition"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
            
            {/* All Products */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {products && products.length > 0 ? products.map(product => (
                    <ProductCard key={product.product_id} product={product} />
                  )) : (
                    <div className="col-span-full text-center text-gray-400 py-8">No products found</div>
                  )}
                </div>
              )}
              {renderPagination()}
            </section>
          </main>
        </div>
        
        {/* Mobile All Products */}
        <div className="lg:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products && products.length > 0 ? products.map(product => (
                <ProductCard key={product.product_id} product={product} />
              )) : (
                <div className="col-span-full text-center text-gray-400 py-8">No products found</div>
              )}
            </div>
          )}
          {renderPagination()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopPage; 