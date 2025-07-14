import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { TipTapEditor } from '../components/TipTapEditor'; // Corrected import path
import { MediaDocsModal } from '../components/MediaDocsModal';

interface Product {
  product_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  sell_price: number;
  offer_price?: number;
  is_offer: boolean;
  status: string;
  stock_quantity: number;
  box_number?: string;
  brand_name?: string;
  category_name?: string;
  primary_media?: string;
  created_at: string;
  updated_at: string;
  bought_price?: number;
  min_stock_level?: number;
  is_custom_status?: boolean;
  custom_status?: string;
  custom_status_color?: string;
  parent_category_id?: number;
  search_keywords?: string[];
  brand_id?: number;
  category_id?: number;
  meta_title?: string;
  meta_description?: string;
  long_description?: any;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Category {
  category_id: number;
  name: string;
  parent_id?: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  long_description: string;
  bought_price: string;
  sell_price: string;
  is_offer: boolean;
  offer_price: string;
  status: string;
  stock_quantity: string;
  min_stock_level: string;
  is_custom_status: boolean;
  custom_status: string;
  custom_status_color: string;
  box_number: string;
  brand_id: number;
  category_id: number;
  meta_title: string;
  meta_description: string;
  search_keywords: string[];
  image: File | null;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderBy, setOrderBy] = useState('created_at');
  const [orderDirection, setOrderDirection] = useState('DESC');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Array<{ brand_id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number>(0);
  const [longDescriptionContent, setLongDescriptionContent] = useState<string>('');
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [mediaDocsProductId, setMediaDocsProductId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    sku: '',
    short_description: '',
    long_description: '',
    bought_price: '',
    sell_price: '',
    is_offer: false,
    offer_price: '',
    status: 'on_sale',
    stock_quantity: '',
    min_stock_level: '',
    is_custom_status: false,
    custom_status: '',
    custom_status_color: '#FF0000',
    box_number: '',
    brand_id: 1, // Default to brand_id 1
    category_id: 0,
    meta_title: '',
    meta_description: '',
    search_keywords: [],
    image: null
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL;

  // Color options for custom status
  const colorOptions = [
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Purple', value: '#800080' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Brown', value: '#A52A2A' },
    { name: 'Gray', value: '#808080' },
    { name: 'Black', value: '#000000' }
  ];

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    console.log('Current token:', token);
    return token;
  };

  // Load brands and categories
  useEffect(() => {
    const loadBrandsAndCategories = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE}/brands`),
          fetch(`${API_BASE}/categories`)
        ]);
        
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData);
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          // Filter main categories (no parent_id)
          const mainCats = categoriesData.filter((cat: Category) => !cat.parent_id);
          setMainCategories(mainCats);
        }
      } catch (error) {
        console.error('Error loading brands/categories:', error);
        toast.error('Failed to load brands and categories');
      }
    };

    loadBrandsAndCategories();
  }, []);

  // Update subcategories when main category changes
  useEffect(() => {
    if (selectedMainCategory) {
      const subs = categories.filter(cat => cat.parent_id === selectedMainCategory);
      setSubCategories(subs);
    } else {
      setSubCategories([]);
    }
  }, [selectedMainCategory, categories]);

  // Generate SKU from backend
  const generateSKU = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/products/generate-sku`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, sku: data.sku }));
        toast.success('SKU generated successfully');
      } else {
        toast.error('Failed to generate SKU');
      }
    } catch (error) {
      console.error('Error generating SKU:', error);
      toast.error('Error generating SKU');
    }
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(searchBy && { searchBy }),
        ...(brandFilter && { brand: brandFilter }),
        ...(categoryFilter && { categoryid: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(orderBy && { orderBy }),
        ...(orderDirection && { orderDirection })
      });
      const response = await fetch(`${API_BASE}/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data); // Handle both new and old format
        if (data.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }));
        } else {
          // Fallback for old format
          setPagination(prev => ({ 
            ...prev, 
            total: data.length || 0, 
            totalPages: 1, 
            hasNext: false, 
            hasPrev: false 
          }));
        }
        const productCount = data.products ? data.products.length : data.length;
        toast.success(`Loaded ${productCount} products`);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      toast.error('Error loading products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, brandFilter, categoryFilter, statusFilter, orderBy, orderDirection, pagination.page, pagination.limit, API_BASE]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Save pagination settings to localStorage
  useEffect(() => {
    localStorage.setItem('productsPerPage', pagination.limit.toString());
  }, [pagination.limit]);

  // Load pagination settings from localStorage
  useEffect(() => {
    const savedLimit = localStorage.getItem('productsPerPage');
    if (savedLimit) {
      setPagination(prev => ({ ...prev, limit: parseInt(savedLimit) }));
    }
  }, []);

  // Function to get contrast color for custom status badges
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Function to convert product name to slug
  const convertNameToSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[\/\?&%$#@!*()+=]/g, '-') // Replace special characters with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'search_keywords') {
      // Handle keywords as comma-separated string, convert to array
      const keywords = value.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
      setFormData(prev => ({ ...prev, [name]: keywords }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-generate slug from name if slug is empty and name is being changed
        if (name === 'name' && value && !prev.slug) {
          newData.slug = convertNameToSlug(value);
        }
        
        return newData;
      });
    }
  };

  // Add keyword
  const addKeyword = () => {
    if (newKeyword.trim() && !formData.search_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        search_keywords: [...prev.search_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  // Remove keyword
  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      search_keywords: prev.search_keywords.filter(kw => kw !== keywordToRemove)
    }));
  };

  // Handle keyword input key press
  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  // Handle main category change
  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setSelectedMainCategory(value);
    // Assign main category ID to product form if no subcategory is selected
    setFormData(prev => ({ ...prev, category_id: value }));
  };

  // Handle subcategory change
  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, category_id: value }));
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  // Add YouTube video to long description
  const addYoutubeVideo = () => {
    if (youtubeUrl) {
      const videoId = extractYoutubeId(youtubeUrl);
      if (videoId) {
        const videoBlock = {
          type: "video",
          provider: "youtube",
          id: videoId
        };
        
        const currentContent = longDescriptionContent ? JSON.parse(longDescriptionContent) : [];
        const newContent = [...currentContent, videoBlock];
        setLongDescriptionContent(JSON.stringify(newContent, null, 2));
        setYoutubeUrl('');
        setShowYoutubeModal(false);
        toast.success('YouTube video added');
      } else {
        toast.error('Invalid YouTube URL');
      }
    }
  };

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Create product
  const handleCreateProduct = async () => {
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value) {
          formDataToSend.append('image', value);
        } else if (key === 'search_keywords') {
          // Convert array to JSON string
          const jsonString = JSON.stringify(value);
          console.log('Sending search_keywords:', jsonString);
          formDataToSend.append(key, jsonString);
        } else if (key === 'long_description') {
          formDataToSend.append(key, longDescriptionContent);
        } else if (key === 'slug' && (!value || value.trim() === '')) {
          // Auto-generate slug from name if empty
          const generatedSlug = convertNameToSlug(formData.name);
          formDataToSend.append(key, generatedSlug);
        } else if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const token = getAuthToken();
      console.log('Using token for create:', token);
      
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('Product created successfully');
        setShowCreateModal(false);
        resetForm();
        loadProducts();
      } else {
        const error = await response.json();
        console.log('Create product error:', error);
        toast.error(error.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error('Error creating product');
      console.error('Error:', error);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const formDataToSend = new FormData();
      
      // Add all form data to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value) {
          formDataToSend.append('image', value);
        } else if (key === 'search_keywords') {
          // Convert array to JSON string
          const jsonString = JSON.stringify(value);
          console.log('Sending search_keywords:', jsonString);
          formDataToSend.append(key, jsonString);
        } else if (key === 'long_description') {
          formDataToSend.append(key, longDescriptionContent);
        } else if (key === 'slug' && (!value || value.trim() === '')) {
          // Auto-generate slug from name if empty
          const generatedSlug = convertNameToSlug(formData.name);
          formDataToSend.append(key, generatedSlug);
        } else if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/products/${editingProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('Product updated successfully');
        setShowEditModal(false);
        setEditingProduct(null);
        resetForm();
        loadProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update product');
      }
    } catch (error) {
      toast.error('Error updating product');
      console.error('Error:', error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        loadProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
      console.error('Error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      sku: '',
      short_description: '',
      long_description: '',
      bought_price: '',
      sell_price: '',
      is_offer: false,
      offer_price: '',
      status: 'on_sale',
      stock_quantity: '',
      min_stock_level: '',
      is_custom_status: false,
      custom_status: '',
      custom_status_color: '#FF0000',
      box_number: '',
      brand_id: 1, // Default to brand_id 1
      category_id: 0,
      meta_title: '',
      meta_description: '',
      search_keywords: [],
      image: null
    });
    setLongDescriptionContent('');
    setSelectedMainCategory(0);
    setSubCategories([]);
    setNewKeyword('');
  };

  // Open edit modal
  const openEditModal = async (product: Product) => {
    try {
      // Fetch complete product data
      const response = await fetch(`${API_BASE}/products/${product.product_id}`);
      if (response.ok) {
        const fullProduct = await response.json();
        
        setEditingProduct(fullProduct);
        setFormData({
          name: fullProduct.name,
          slug: fullProduct.slug,
          sku: fullProduct.sku,
          short_description: fullProduct.short_description || '',
          long_description: '',
          bought_price: fullProduct.bought_price?.toString() || '',
          sell_price: fullProduct.sell_price.toString(),
          is_offer: fullProduct.is_offer,
          offer_price: fullProduct.offer_price?.toString() || '',
          status: fullProduct.status,
          stock_quantity: fullProduct.stock_quantity.toString(),
          min_stock_level: fullProduct.min_stock_level?.toString() || '',
          is_custom_status: fullProduct.is_custom_status || false,
          custom_status: fullProduct.custom_status || '',
          custom_status_color: fullProduct.custom_status_color || '#FF0000',
          box_number: fullProduct.box_number || '',
          brand_id: fullProduct.brand_id || 1,
          category_id: fullProduct.category_id || 0,
          meta_title: fullProduct.meta_title || '',
          meta_description: fullProduct.meta_description || '',
          search_keywords: fullProduct.search_keywords || [],
          image: null
        });
        
        // Set long description content
        setLongDescriptionContent(fullProduct.long_description ? JSON.stringify(fullProduct.long_description, null, 2) : '');
        
        // Set category hierarchy
        if (fullProduct.parent_category_id) {
          setSelectedMainCategory(fullProduct.parent_category_id);
        } else if (fullProduct.category_id) {
          setSelectedMainCategory(fullProduct.category_id);
        } else {
          setSelectedMainCategory(0);
        }
        
        setShowEditModal(true);
      } else {
        toast.error('Failed to load product data');
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      toast.error('Error loading product data');
    }
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    generateSKU();
    setShowCreateModal(true);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  // Handle product name click
  const handleProductNameClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const productUrl = `https://voltx-store.com/product/${product.slug}`;
    window.open(productUrl, '_blank');
  };

  // Test token storage
  const testToken = () => {
    const token = localStorage.getItem('authToken');
    console.log('Stored token:', token);
    toast.success(`Token: ${token ? token.substring(0, 20) + '...' : 'null'}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex space-x-2">
          <button
            onClick={testToken}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Test Token
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex">
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="border border-gray-300 rounded-l-lg px-3 py-2 text-sm"
              >
                <option value="name">Name</option>
                <option value="sku">SKU</option>
                <option value="brand">Brand</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.brand_id} value={brand.brand_id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="on_sale">On Sale</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="pre_order">Pre Order</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        {/* Ordering and Pagination Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order By</label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="created_at">Created Date</option>
              <option value="name">Name</option>
              <option value="sku">SKU</option>
              <option value="sell_price">Price</option>
              <option value="stock_quantity">Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Direction</label>
            <select
              value={orderDirection}
              onChange={(e) => setOrderDirection(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="space-y-4 p-4">
                {products.map((product) => (
                  <div key={product.product_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {product.primary_media ? (
                          <img
                            src={`${MEDIA_BASE}${product.primary_media}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 
                              className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                              onClick={(e) => handleProductNameClick(e, product)}
                            >
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              SKU: {product.sku}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.short_description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Brand: {product.brand_name || 'N/A'}</span>
                              <span>Category: {product.category_name || 'N/A'}</span>
                              <span>Stock: {product.stock_quantity}</span>
                              <span>Box: {product.box_number || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Price and Status */}
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-gray-900">
                              ${product.sell_price}
                            </div>
                            {product.is_offer && product.offer_price && (
                              <div className="text-sm text-red-600">
                                Offer: ${product.offer_price}
                              </div>
                            )}
                            {product.is_custom_status ? (
                              <span 
                                className="inline-block px-2 py-1 text-xs rounded-full mt-1 text-white"
                                style={{ backgroundColor: product.custom_status_color || '#000', color: getContrastColor(product.custom_status_color || '#000') }}
                              >
                                {product.custom_status}
                              </span>
                            ) : (
                              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                product.status === 'on_sale' ? 'bg-green-100 text-green-800' :
                                product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                                product.status === 'pre_order' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {product.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.product_id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setMediaDocsProductId(product.product_id)}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
                        >
                          Media & Docs
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Create Product' : 'Edit Product'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateSKU}
                      className="bg-gray-100 border border-gray-300 rounded-r-lg px-3 py-2 text-sm hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Box Number</label>
                  <input
                    type="text"
                    name="box_number"
                    value={formData.box_number}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Auto-generated from product name if left empty"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from product name</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
                  <select
                    value={selectedMainCategory}
                    onChange={handleMainCategoryChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={0}>Select Main Category</option>
                    {mainCategories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMainCategory > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                    <select
                      value={formData.category_id}
                      onChange={handleSubCategoryChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value={0}>Select Sub Category</option>
                      {subCategories.map(category => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Pricing Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price *</label>
                    <input
                      type="text"
                      name="sell_price"
                      value={formData.sell_price}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bought Price</label>
                    <input
                      type="text"
                      name="bought_price"
                      value={formData.bought_price}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_offer"
                      checked={formData.is_offer}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Is Offer</label>
                  </div>

                  {formData.is_offer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price</label>
                      <input
                        type="text"
                        name="offer_price"
                        value={formData.offer_price}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="text"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                    <input
                      type="text"
                      name="min_stock_level"
                      value={formData.min_stock_level}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_custom_status"
                      checked={formData.is_custom_status}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Custom Status</label>
                  </div>

                  {!formData.is_custom_status ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="on_sale">On Sale</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="pre_order">Pre Order</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Status Text</label>
                        <input
                          type="text"
                          name="custom_status"
                          value={formData.custom_status}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Color</label>
                        <select
                          name="custom_status_color"
                          value={formData.custom_status_color}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          {colorOptions.map(color => (
                            <option key={color.value} value={color.value}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Meta Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO & Meta Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords</label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={handleKeywordKeyPress}
                          placeholder="Enter a keyword"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={addKeyword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {formData.search_keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.search_keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                              onClick={() => removeKeyword(keyword)}
                            >
                              {keyword}
                              <span className="ml-2 text-blue-600 hover:text-blue-800">×</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Descriptions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                    <div className="border border-gray-300 rounded-lg">
                      {/* Content Area */}
                      <TipTapEditor
                        content={longDescriptionContent}
                        onUpdate={(newContent: any) => setLongDescriptionContent(JSON.stringify(newContent, null, 2))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required={showCreateModal}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showCreateModal ? handleCreateProduct : handleUpdateProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showCreateModal ? 'Create Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Modal */}
      {showYoutubeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add YouTube Video</h3>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowYoutubeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addYoutubeVideo}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaDocsModal
        open={mediaDocsProductId !== null}
        onClose={() => setMediaDocsProductId(null)}
        productId={mediaDocsProductId ?? 0}
      />
    </div>
  );
};

export default ProductsPage; 