import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const SECTIONS = [
  { key: 'best_sellers', label: 'Best Sellers' },
  { key: 'new_arrivals', label: 'New Arrivals' },
  { key: 'featured_products', label: 'Featured' },
];

interface Product {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  sell_price: number;
  status: string;
  stock_quantity: number;
  brand_name?: string;
  category_name?: string;
  primary_media?: string;
  sort_order: number;
}

const HomepagePage: React.FC = () => {
  const { get, post, put, delete: del } = useApi();
  const [activeTab, setActiveTab] = useState(SECTIONS[0].key);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [adding, setAdding] = useState(false);

  const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL;

  // Load products for section
  const loadSection = async (section: string) => {
    setLoading(true);
    try {
      const res = await get(`/homepage/${section}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => ({ ...prev, [section]: data }));
      } else {
        toast.error('Failed to load section');
        setProducts(prev => ({ ...prev, [section]: [] }));
      }
    } catch {
      toast.error('Failed to load section');
      setProducts(prev => ({ ...prev, [section]: [] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSection(activeTab); }, [activeTab]);

  // Add product by SKU
  const handleAddProduct = async () => {
    const sku = skuInput.trim();
    if (!sku) return;
    setAdding(true);
    try {
      // Search for product by SKU
      const res = await get(`/products?sku=${encodeURIComponent(sku)}`);
      if (res.ok) {
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          toast.error(`No product found with SKU: ${sku}`);
        } else {
          const product = data[0];
          console.log('Found product:', product); // Debug log
          
          // Check if already in section
          if ((products[activeTab] || []).some(p => p.product_id === product.product_id)) {
            toast.error('Product already in this section');
          } else {
            const addRes = await post(`/homepage/${activeTab}`, { product_id: product.product_id });
            if (addRes.ok) {
              toast.success(`Product "${product.name}" added to ${SECTIONS.find(s => s.key === activeTab)?.label}`);
              setSkuInput('');
              loadSection(activeTab);
            } else {
              const errorData = await addRes.json();
              toast.error(errorData.error || 'Failed to add product');
            }
          }
        }
      } else {
        toast.error('Failed to search for product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  // Remove product from section
  const handleRemoveProduct = async (id: number) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      const res = await del(`/homepage/${activeTab}/${id}`);
      if (res.ok) {
        toast.success('Product removed');
        loadSection(activeTab);
      } else {
        toast.error('Failed to remove product');
      }
    } catch {
      toast.error('Failed to remove product');
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sectionProducts = products[activeTab] || [];
    const reordered = Array.from(sectionProducts);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setProducts(prev => ({ ...prev, [activeTab]: reordered }));
    // Send new order to backend
    try {
      await put(`/homepage/${activeTab}/order`, { order: reordered.map(p => p.id) });
      toast.success('Order updated');
      loadSection(activeTab);
    } catch {
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_sale': return 'text-green-600 bg-green-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'discontinued': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-gray-600 mt-1">Manage products displayed on the homepage</p>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <nav className="border-b border-gray-200 flex space-x-8 px-6">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => { setActiveTab(s.key); setSkuInput(''); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === s.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="p-6">
          {/* Add product by SKU */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Add Product by SKU</h3>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={skuInput}
                onChange={e => setSkuInput(e.target.value)}
                placeholder="Enter product SKU to add..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-2/3"
                autoComplete="off"
                onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400"
                disabled={!skuInput.trim() || adding}
                style={{ minWidth: 120 }}
                onClick={handleAddProduct}
              >
                {adding ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
          
          {/* List products with drag-and-drop */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Products in {SECTIONS.find(s => s.key === activeTab)?.label} 
                <span className="text-sm text-gray-500 ml-2">
                  ({(products[activeTab] || []).length} products)
                </span>
              </h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="section-products">
                  {provided => (
                    <ul
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {(products[activeTab] || []).map((prod, idx) => (
                        <Draggable key={prod.id} draggableId={prod.id.toString()} index={idx}>
                          {providedDraggable => (
                            <li
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 shadow-sm border border-gray-200"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                {prod.primary_media && (
                                  <img src={MEDIA_BASE + prod.primary_media} alt={prod.name} className="w-12 h-12 object-cover rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 truncate">{prod.name}</span>
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">SKU: {prod.sku}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span className="text-blue-700 font-bold">${prod.sell_price}</span>
                                    {prod.brand_name && (
                                      <span className="text-gray-500">Brand: {prod.brand_name}</span>
                                    )}
                                    {prod.category_name && (
                                      <span className="text-gray-500">Category: {prod.category_name}</span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prod.status)}`}>
                                      {prod.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-gray-500">Stock: {prod.stock_quantity}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors"
                                onClick={() => handleRemoveProduct(prod.id)}
                              >
                                Remove
                              </button>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {(products[activeTab] || []).length === 0 && (
                        <li className="text-center py-8 text-gray-500">
                          No products in this section. Add products using the SKU search above.
                        </li>
                      )}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomepagePage; 