import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id?: number;
  parent_name?: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

interface Brand {
  brand_id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}
/*
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
*/

interface CategoryFormData {
  name: string;
  slug: string;
  parent_id: number;
}

interface BrandFormData {
  name: string;
  slug: string;
}

const CategoriesBrandsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parent_id: 0
  });

  // Brands state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [showCreateBrandModal, setShowCreateBrandModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandFormData, setBrandFormData] = useState<BrandFormData>({
    name: '',
    slug: ''
  });

  // Add state to track expanded parent categories
  const [expandedParents, setExpandedParents] = useState<number[]>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    return token;
  };

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const params = new URLSearchParams();
      if (categorySearchTerm) params.append('search', categorySearchTerm);

      const response = await fetch(`${API_BASE}/categories?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, [categorySearchTerm]);

  // Load brands
  const loadBrands = useCallback(async () => {
    try {
      setBrandsLoading(true);
      const params = new URLSearchParams();
      if (brandSearchTerm) params.append('search', brandSearchTerm);

      const response = await fetch(`${API_BASE}/brands?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        toast.error('Failed to load brands');
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setBrandsLoading(false);
    }
  }, [brandSearchTerm]);

  // Load data when tab changes or search terms change
  useEffect(() => {
    if (activeTab === 'categories') {
      loadCategories();
    } else {
      loadBrands();
    }
  }, [activeTab, loadCategories, loadBrands]);

  // Category handlers
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: name === 'parent_id' ? Number(value) : value
    }));
  };

  const handleCreateCategory = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...categoryFormData,
          parent_id: categoryFormData.parent_id || null
        })
      });

      if (response.ok) {
        toast.success('Category created successfully');
        setShowCreateCategoryModal(false);
        setCategoryFormData({ name: '', slug: '', parent_id: 0 });
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/categories/${editingCategory.category_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...categoryFormData,
          parent_id: categoryFormData.parent_id || null
        })
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        setCategoryFormData({ name: '', slug: '', parent_id: 0 });
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || 0
    });
    setShowEditCategoryModal(true);
  };

  // Helper: get parent and subcategories
  const parentCategories = categories.filter(cat => !cat.parent_id);
  const getSubcategories = (parentId: number) =>
    categories.filter(cat => cat.parent_id === parentId);

  // Toggle expand/collapse for parent
  const toggleExpandParent = (parentId: number) => {
    setExpandedParents(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  // Modified openCreateCategoryModal to accept parentId
  const openCreateCategoryModal = (parentId: number = 0) => {
    setCategoryFormData({ name: '', slug: '', parent_id: parentId });
    setShowCreateCategoryModal(true);
  };

  // Brand handlers
  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBrandFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateBrand = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(brandFormData)
      });

      if (response.ok) {
        toast.success('Brand created successfully');
        setShowCreateBrandModal(false);
        setBrandFormData({ name: '', slug: '' });
        loadBrands();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create brand');
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/brands/${editingBrand.brand_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(brandFormData)
      });

      if (response.ok) {
        toast.success('Brand updated successfully');
        setShowEditBrandModal(false);
        setEditingBrand(null);
        setBrandFormData({ name: '', slug: '' });
        loadBrands();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update brand');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    }
  };

  const handleDeleteBrand = async (brandId: number) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Brand deleted successfully');
        loadBrands();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  const openEditBrandModal = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandFormData({
      name: brand.name,
      slug: brand.slug
    });
    setShowEditBrandModal(true);
  };

  const openCreateBrandModal = () => {
    setBrandFormData({ name: '', slug: '' });
    setShowCreateBrandModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories & Brands</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'brands'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Brands
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'categories' ? (
            // Categories Tab
            <div>
              {/* Search and Filters */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                  <div>
                    <input
                      type="text"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      placeholder="Search categories..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => openCreateCategoryModal(0)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
              </div>

              {/* Parent Categories Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {categoriesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading categories...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="space-y-4 p-4">
                      {parentCategories.map((category) => (
                        <React.Fragment key={category.category_id}>
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {/* Arrow for expand/collapse */}
                              <button
                                onClick={() => toggleExpandParent(category.category_id)}
                                className="focus:outline-none mr-2"
                                aria-label={expandedParents.includes(category.category_id) ? 'Collapse' : 'Expand'}
                              >
                                <span className={`inline-block transition-transform ${expandedParents.includes(category.category_id) ? 'rotate-90' : ''}`}>▶</span>
                              </button>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">Slug: {category.slug}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openCreateCategoryModal(category.category_id)}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                              >
                                + Subcategory
                              </button>
                              <button
                                onClick={() => openEditCategoryModal(category)}
                                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.category_id)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {/* Subcategories (indented) */}
                          {expandedParents.includes(category.category_id) && (
                            getSubcategories(category.category_id).length > 0 ? (
                              getSubcategories(category.category_id).map(sub => (
                                <div
                                  key={sub.category_id}
                                  className="ml-8 mt-2 border border-gray-100 rounded-lg p-4 bg-gray-50 flex items-center justify-between"
                                >
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-semibold text-gray-800">{sub.name}</h4>
                                    <p className="text-xs text-gray-500">Slug: {sub.slug}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => openEditCategoryModal(sub)}
                                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs hover:bg-yellow-200 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(sub.category_id)}
                                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="ml-8 mt-2 text-gray-400 text-sm">No subcategories</div>
                            )
                          )}
                        </React.Fragment>
                      ))}
                      {parentCategories.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No parent categories found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Brands Tab
            <div>
              {/* Search and Filters */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <input
                    type="text"
                    value={brandSearchTerm}
                    onChange={(e) => setBrandSearchTerm(e.target.value)}
                    placeholder="Search brands..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={openCreateBrandModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Brand
                </button>
              </div>

              {/* Brands Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {brandsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading brands...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="space-y-4 p-4">
                      {brands.map((brand) => (
                        <div key={brand.brand_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {brand.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Slug: {brand.slug}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Products: {brand.product_count || 0}</span>
                                <span>Created: {new Date(brand.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditBrandModal(brand)}
                                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBrand(brand.brand_id)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {brands.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No brands found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Create Category</h2>
              <button
                onClick={() => setShowCreateCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={categoryFormData.slug}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  name="parent_id"
                  value={categoryFormData.parent_id}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value={0}>No Parent (Main Category)</option>
                  {parentCategories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={categoryFormData.slug}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  name="parent_id"
                  value={categoryFormData.parent_id}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value={0}>No Parent (Main Category)</option>
                  {parentCategories
                    .filter(cat => cat.category_id !== editingCategory?.category_id)
                    .map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Brand Modal */}
      {showCreateBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Create Brand</h2>
              <button
                onClick={() => setShowCreateBrandModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={brandFormData.name}
                  onChange={handleBrandInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={brandFormData.slug}
                  onChange={handleBrandInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateBrandModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBrand}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Brand</h2>
              <button
                onClick={() => {
                  setShowEditBrandModal(false);
                  setEditingBrand(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={brandFormData.name}
                  onChange={handleBrandInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={brandFormData.slug}
                  onChange={handleBrandInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBrandModal(false);
                    setEditingBrand(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateBrand}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesBrandsPage; 