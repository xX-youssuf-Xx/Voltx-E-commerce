import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Discount and usage types
interface Discount {
  discount_id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  value: string;
  minimum_order_amount: string | null;
  maximum_discount_amount: string | null;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  applies_to: string;
  created_at: string;
  created_by: number | null;
  usage_count?: number;
}

interface DiscountUsage {
  usage_id: number;
  discount_id: number;
  order_id: number;
  user_id: number | null;
  discount_amount: string;
  used_at: string;
}

interface DiscountFormData {
  code: string;
  name: string;
  description: string;
  type: string;
  value: string;
  minimum_order_amount: string;
  maximum_discount_amount: string;
  usage_limit: string;
  usage_limit_per_user: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: string;
  application_id?: number | null;
}

const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minimum_order_amount: '',
    maximum_discount_amount: '',
    usage_limit: '',
    usage_limit_per_user: '1',
    start_date: '',
    end_date: '',
    is_active: true,
    applies_to: 'all',
  });
  const [expandedDiscounts, setExpandedDiscounts] = useState<number[]>([]);
  const [usages, setUsages] = useState<Record<number, DiscountUsage[]>>({});
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // State for dynamic selects
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [parentCategory, setParentCategory] = useState('');
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // For product SKU lookup
  const [productSkuInput, setProductSkuInput] = useState('');
  const [productSkuError, setProductSkuError] = useState('');

  // Get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Load all discounts
  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/discounts`);
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      } else {
        toast.error('Failed to load discounts');
      }
    } catch (err) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDiscounts(); }, [loadDiscounts]);

  // Fetch categories and brands on mount
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      fetch(`${API_BASE}/categories`).then(r => r.json()).then(setCategories);
      fetch(`${API_BASE}/brands`).then(r => r.json()).then(setBrands);
    }
  }, [showCreateModal, showEditModal]);

  // Update subcategories when parent changes
  useEffect(() => {
    if (formData.applies_to === 'categories' && parentCategory) {
      setSubCategories(categories.filter(cat => cat.parent_id === Number(parentCategory)));
    } else {
      setSubCategories([]);
    }
  }, [formData.applies_to, parentCategory, categories]);

  // Product search
  // Removed useEffect for productSearch and setProducts

  // Expand/collapse discount for usages
  const toggleExpand = async (discountId: number) => {
    if (expandedDiscounts.includes(discountId)) {
      setExpandedDiscounts(expandedDiscounts.filter(id => id !== discountId));
    } else {
      setExpandedDiscounts([...expandedDiscounts, discountId]);
      // Load usages if not already loaded
      if (!usages[discountId]) {
        try {
          const res = await fetch(`${API_BASE}/discounts/${discountId}/usages`);
          if (res.ok) {
            const data = await res.json();
            setUsages(prev => ({ ...prev, [discountId]: data }));
          }
        } catch {}
      }
    }
  };

  // Generate unique code
  const generateCode = async () => {
    try {
      const res = await fetch(`${API_BASE}/discounts/generate-code`);
      if (res.ok) {
        const data = await res.json();
        setFormData(f => ({ ...f, code: data.code }));
      } else {
        toast.error('Failed to generate code');
      }
    } catch {
      toast.error('Failed to generate code');
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value
    }));
  };

  // Create discount
  const handleCreate = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          value: formData.value || '0',
          minimum_order_amount: formData.minimum_order_amount || null,
          maximum_discount_amount: formData.maximum_discount_amount || null,
          usage_limit: formData.usage_limit || null,
          usage_limit_per_user: formData.usage_limit_per_user || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          application_id: formData.application_id || null,
        })
      });
      if (res.ok) {
        toast.success('Discount created');
        setShowCreateModal(false);
        setFormData({
          code: '', name: '', description: '', type: 'percentage', value: '', minimum_order_amount: '', maximum_discount_amount: '', usage_limit: '', usage_limit_per_user: '1', start_date: '', end_date: '', is_active: true, applies_to: 'all',
        });
        loadDiscounts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create discount');
      }
    } catch {
      toast.error('Failed to create discount');
    }
  };

  // Edit discount
  const openEditModal = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      minimum_order_amount: discount.minimum_order_amount || '',
      maximum_discount_amount: discount.maximum_discount_amount || '',
      usage_limit: discount.usage_limit?.toString() || '',
      usage_limit_per_user: discount.usage_limit_per_user?.toString() || '1',
      start_date: discount.start_date ? discount.start_date.slice(0, 16) : '',
      end_date: discount.end_date ? discount.end_date.slice(0, 16) : '',
      is_active: discount.is_active,
      applies_to: discount.applies_to,
    });
    setShowEditModal(true);
  };

  // Update discount
  const handleUpdate = async () => {
    if (!editingDiscount) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/discounts/${editingDiscount.discount_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          value: formData.value || '0',
          minimum_order_amount: formData.minimum_order_amount || null,
          maximum_discount_amount: formData.maximum_discount_amount || null,
          usage_limit: formData.usage_limit || null,
          usage_limit_per_user: formData.usage_limit_per_user || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          application_id: formData.application_id || null,
        })
      });
      if (res.ok) {
        toast.success('Discount updated');
        setShowEditModal(false);
        setEditingDiscount(null);
        loadDiscounts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update discount');
      }
    } catch {
      toast.error('Failed to update discount');
    }
  };

  // Delete discount
  const handleDelete = async (discountId: number) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/discounts/${discountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Discount deleted');
        loadDiscounts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete discount');
      }
    } catch {
      toast.error('Failed to delete discount');
    }
  };

  // Open create modal
  const openCreateModal = async () => {
    // Auto-generate code
    try {
      const res = await fetch(`${API_BASE}/discounts/generate-code`);
      let code = '';
      if (res.ok) {
        const data = await res.json();
        code = data.code;
      }
      setFormData({
        code,
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        minimum_order_amount: '',
        maximum_discount_amount: '',
        usage_limit: '',
        usage_limit_per_user: '1',
        start_date: '',
        end_date: '',
        is_active: true,
        applies_to: 'all',
      });
      setShowCreateModal(true);
    } catch {
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        minimum_order_amount: '',
        maximum_discount_amount: '',
        usage_limit: '',
        usage_limit_per_user: '1',
        start_date: '',
        end_date: '',
        is_active: true,
        applies_to: 'all',
      });
      setShowCreateModal(true);
    }
  };

  // Discount type options
  const typeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount' },
  ];
  const appliesToOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'products', label: 'Specific Products' },
    { value: 'categories', label: 'Specific Categories' },
  ];

  // Product SKU lookup
  const handleProductSkuBlur = async () => {
    if (productSkuInput.trim()) {
      try {
        const res = await fetch(`${API_BASE}/products?sku=${encodeURIComponent(productSkuInput.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFormData(f => ({ ...f, application_id: data[0].product_id }));
            setProductSkuError('');
          } else {
            setFormData(f => ({ ...f, application_id: null }));
            setProductSkuError('No product found for this SKU');
          }
        } else {
          setProductSkuError('Error searching for product');
        }
      } catch {
        setProductSkuError('Error searching for product');
      }
    } else {
      setFormData(f => ({ ...f, application_id: null }));
      setProductSkuError('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Discount
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading discounts...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discounts.map(discount => (
              <React.Fragment key={discount.discount_id}>
                <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <button
                      onClick={() => toggleExpand(discount.discount_id)}
                      className="focus:outline-none mr-2"
                      aria-label={expandedDiscounts.includes(discount.discount_id) ? 'Collapse' : 'Expand'}
                    >
                      <span className={`inline-block transition-transform ${expandedDiscounts.includes(discount.discount_id) ? 'rotate-90' : ''}`}>▶</span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{discount.name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{discount.type === 'percentage' ? '%' : 'Fixed'}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{discount.value}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{discount.is_active ? 'Active' : 'Inactive'}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">Usages: {discount.usage_count || 0}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{discount.start_date ? new Date(discount.start_date).toLocaleDateString() : ''} - {discount.end_date ? new Date(discount.end_date).toLocaleDateString() : ''}</span>
                        <button
                          type="button"
                          onClick={() => {navigator.clipboard.writeText(discount.code); toast.success('Discount code copied!')}}
                          className="ml-2 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          title="Copy code"
                        >
                          Copy Code
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xl">{discount.description}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(discount)}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(discount.discount_id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Usage records (thin cards) */}
                {expandedDiscounts.includes(discount.discount_id) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {(usages[discount.discount_id]?.length ?? 0) === 0 ? (
                      <div className="text-gray-400 text-xs">No usage records</div>
                    ) : (
                      usages[discount.discount_id].map(u => (
                        <div key={u.usage_id} className="border border-gray-100 rounded bg-gray-50 flex items-center px-3 py-1 text-xs text-gray-700" style={{ minHeight: 28 }}>
                          <span className="font-mono text-blue-700 mr-2">#{u.usage_id}</span>
                          <span className="mr-2">Order: {u.order_id}</span>
                          <span className="mr-2">User: {u.user_id ?? 'Guest'}</span>
                          <span className="mr-2">Amount: {u.discount_amount}</span>
                          <span className="mr-2">{new Date(u.used_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
            {discounts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No discounts found</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Create Discount' : 'Edit Discount'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingDiscount(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <div className="flex min-w-0">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 border border-gray-300 rounded-l-lg px-3 py-2 text-base font-mono"
                      required
                      maxLength={50}
                      style={{ maxWidth: 160 }}
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="bg-gray-100 border border-gray-300 rounded-r-lg px-3 py-2 text-sm hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    name="minimum_order_amount"
                    value={formData.minimum_order_amount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount</label>
                  <input
                    type="number"
                    name="maximum_discount_amount"
                    value={formData.maximum_discount_amount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit Per User</label>
                  <input
                    type="number"
                    name="usage_limit_per_user"
                    value={formData.usage_limit_per_user}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
                  <select
                    name="applies_to"
                    value={formData.applies_to}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {appliesToOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {formData.applies_to === 'categories' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                    <select
                      value={parentCategory}
                      onChange={e => { setParentCategory(e.target.value); setFormData(f => ({ ...f, application_id: null })); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                    >
                      <option value="">Select Parent Category</option>
                      {categories.filter(cat => !cat.parent_id).map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                      ))}
                    </select>
                    {parentCategory && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                        <select
                          value={formData.application_id || ''}
                          onChange={e => setFormData(f => ({ ...f, application_id: Number(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">Select Subcategory</option>
                          {subCategories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </>
                )}
                {formData.applies_to === 'brands' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={formData.application_id || ''}
                      onChange={e => setFormData(f => ({ ...f, application_id: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.brand_id} value={brand.brand_id}>{brand.name}</option>
                      ))}
                    </select>
                  </>
                )}
                {formData.applies_to === 'products' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product SKU</label>
                    <input
                      type="text"
                      value={productSkuInput}
                      onChange={e => setProductSkuInput(e.target.value)}
                      onBlur={handleProductSkuBlur}
                      placeholder="Enter product SKU"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                    />
                    {productSkuError && <div className="text-xs text-red-500 mb-2">{productSkuError}</div>}
                    {formData.application_id && !productSkuError && (
                      <div className="text-xs text-green-600 mb-2">Product found and selected</div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingDiscount(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showCreateModal ? handleCreate : handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showCreateModal ? 'Create Discount' : 'Update Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage; 