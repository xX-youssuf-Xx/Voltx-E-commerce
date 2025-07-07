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
  sell_price: number;
  primary_media?: string;
  sort_order: number;
  sku?: string;
}

const HomepagePage: React.FC = () => {
  const { get, post, put, delete: del } = useApi();
  const [activeTab, setActiveTab] = useState(SECTIONS[0].key);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [adding, setAdding] = useState(false);

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
          toast.error('No product found for this SKU');
        } else {
          const product = data[0];
          // Check if already in section
          if ((products[activeTab] || []).some(p => p.product_id === product.product_id)) {
            toast.error('Product already in this section');
          } else {
            const addRes = await post(`/homepage/${activeTab}`, { product_id: product.product_id });
            if (addRes.ok) {
              toast.success('Product added');
              setSkuInput('');
              loadSection(activeTab);
            } else {
              toast.error('Failed to add product');
            }
          }
        }
      } else {
        toast.error('Failed to search for product');
      }
    } catch {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
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
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              value={skuInput}
              onChange={e => setSkuInput(e.target.value)}
              placeholder="Enter product SKU to add..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-2/3"
              autoComplete="off"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              disabled={!skuInput.trim() || adding}
              style={{ minWidth: 120 }}
              onClick={handleAddProduct}
            >
              {adding ? 'Adding...' : 'Add Product'}
            </button>
          </div>
          {/* List products with drag-and-drop */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
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
                            className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 shadow-sm"
                          >
                            <span className="flex items-center gap-3">
                              {prod.primary_media && (
                                <img src={prod.primary_media} alt={prod.name} className="w-12 h-12 object-cover rounded" />
                              )}
                              <span className="font-semibold">{prod.name}</span>
                              <span className="text-blue-700 font-bold">${prod.sell_price}</span>
                            </span>
                            <button
                              className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                              onClick={() => handleRemoveProduct(prod.id)}
                            >
                              Remove
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomepagePage; 