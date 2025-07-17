import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

interface Order {
  order_id: number;
  customer_id: number | null;
  cashier_id: number | null;
  order_type: string;
  products: Record<string, number>;
  price: number;
  discount: number;
  discount_code: string | null;
  is_shipping: boolean;
  shipping_location: string | null;
  total_price: number;
  created_at: string;
  receipt_id: number | null;
}

interface Receipt {
  receipt_id: number;
  order_id: number;
  payment_method: string;
  price_paid: number;
  created_at: string;
}

interface ProductInfo {
  product_id: number;
  name: string;
  sell_price: number;
  offer_price?: number;
  is_offer?: boolean;
  status?: string;
  primary_media?: string;
}

interface UserInfo {
  user_id: number;
  name: string;
  email: string;
}

const LOGO_URL = '/voltx.jpg';

const OrdersPage: React.FC = () => {
  const { token } = useAuth();
  const { get, put, delete: del } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [customer, setCustomer] = useState<UserInfo | null>(null);
  const [productsInfo, setProductsInfo] = useState<ProductInfo[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editPricePaid, setEditPricePaid] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Add loading/error states for modal data
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('You must be logged in as admin to view orders.');
      setLoading(false);
      return;
    }
    get('/orders')
      .then(res => {
        if (res.status === 401) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [token, get]);

  // Fetch customer and product info when details modal opens
  useEffect(() => {
    if (!showDetails || !selectedOrder) return;
    setCustomer(null);
    setProductsInfo([]);
    // Fetch customer name
    if (selectedOrder.customer_id) {
      get(`/users/${selectedOrder.customer_id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setCustomer(data))
        .catch(() => setCustomer(null));
    }
    // Fetch product names
    const productIds = Object.keys(selectedOrder.products).map(Number);
    if (productIds.length > 0) {
      fetch('/api/products/by-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: productIds })
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => setProductsInfo(data))
        .catch(() => setProductsInfo([]));
    }
    // Set edit fields
    setEditLocation(selectedOrder.shipping_location || '');
    setEditPricePaid(selectedReceipt && selectedReceipt.price_paid ? String(selectedReceipt.price_paid) : '');
    setEditPaymentMethod(selectedReceipt && selectedReceipt.payment_method ? selectedReceipt.payment_method : '');
  }, [showDetails, selectedOrder, selectedReceipt, get, token]);

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
    setSelectedReceipt(null);
    setCustomer(null);
    setProductsInfo([]);
    setModalLoading(true);
    setModalError(null);
    try {
      // Fetch receipt
      let receiptData: Receipt | null = null;
      if (order.receipt_id) {
        const res = await get(`/receipts/${order.receipt_id}`);
        if (res.ok) {
          receiptData = await res.json();
          setSelectedReceipt(receiptData);
          setEditPricePaid(receiptData.price_paid ? String(receiptData.price_paid) : '');
          setEditPaymentMethod(receiptData.payment_method || '');
        }
      }
      // Fetch customer name
      if (order.customer_id) {
        const res = await get(`/users/${order.customer_id}`);
        if (res.ok) {
          const data = await res.json();
          setCustomer(data);
        } else {
          setCustomer(null);
        }
      }
      // Fetch product names
      const productIds = Object.keys(order.products).map(Number);
      if (productIds.length > 0) {
        const res = await fetch('/api/products/by-ids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ ids: productIds })
        });
        if (res.ok) {
          const data = await res.json();
          setProductsInfo(data);
        } else {
          setProductsInfo([]);
        }
      }
      setEditLocation(order.shipping_location || '');
      setModalLoading(false);
    } catch (err: any) {
      setModalError('Failed to load order details.');
      setModalLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditLocation(selectedOrder?.shipping_location || '');
    setEditPricePaid(selectedReceipt && selectedReceipt.price_paid ? String(selectedReceipt.price_paid) : '');
    setEditPaymentMethod(selectedReceipt && selectedReceipt.payment_method ? selectedReceipt.payment_method : '');
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder || !selectedReceipt) return;
    setSaving(true);
    try {
      // Update order location
      await put(`/orders/${selectedOrder.order_id}`, { shipping_location: editLocation });
      // Update receipt
      await put(`/receipts/${selectedReceipt.receipt_id}`, { price_paid: Number(editPricePaid), payment_method: editPaymentMethod });
      // Refresh order list
      const res = await get('/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setEditMode(false);
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Are you sure you want to delete this order and its receipt?')) return;
    setDeleting(true);
    try {
      await del(`/orders/${selectedOrder.order_id}`);
      setShowDetails(false);
      // Refresh order list
      const res = await get('/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Orders</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-8">
        {loading ? (
          <div>Loading orders...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id} className="hover:bg-blue-50 transition text-center align-middle">
                  <td className="px-4 py-2 font-semibold align-middle">{order.order_id}</td>
                  <td className="px-4 py-2 align-middle">{order.customer_id ?? '-'}</td>
                  <td className="px-4 py-2 align-middle">{order.order_type}</td>
                  <td className="px-4 py-2 align-middle">{
                    typeof order.total_price === 'number' && !isNaN(order.total_price)
                      ? order.total_price.toFixed(2)
                      : (Number.isFinite(Number(order.total_price)) && !isNaN(Number(order.total_price))
                          ? Number(order.total_price).toFixed(2)
                          : '-')
                  }</td>
                  <td className="px-4 py-2 align-middle">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 align-middle">
                    <button
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md transition-all duration-150"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 print:bg-transparent print:relative print:inset-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[400px] max-w-2xl w-full relative print:shadow-none print:p-0 print:rounded-none border border-blue-100">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 print:hidden text-3xl font-bold"
              onClick={() => setShowDetails(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-blue-700 font-semibold">Loading order details...</div>
              </div>
            ) : modalError ? (
              <div className="text-red-600 font-semibold text-center min-h-[200px] flex items-center justify-center">{modalError}</div>
            ) : (
              <>
                <div className="flex items-center mb-6 border-b pb-4 gap-4">
                  <img src={LOGO_URL} alt="Logo" className="h-16 w-16 rounded-lg border border-blue-200 bg-white object-contain shadow" onError={e => (e.currentTarget.style.display = 'none')} />
                  <div>
                    <h2 className="text-2xl font-bold text-blue-800">Order #{selectedOrder.order_id}</h2>
                    <div className="text-gray-500 text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mb-3 text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">Customer:</span> <span className="text-blue-700 font-medium">{customer ? customer.name : (selectedOrder.customer_id ?? '-')}</span>
                </div>
                <div className="mb-3 text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">Order Type:</span> <span>{selectedOrder.order_type}</span>
                </div>
                <div className="mb-3 text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">Shipping Location:</span> {editMode ? (
                    <input
                      className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                    />
                  ) : (
                    <span>{selectedOrder.shipping_location || '-'}</span>
                  )}
                </div>
                <div className="mb-3 text-gray-700">
                  <span className="font-semibold">Products:</span>
                  <ul className="ml-4 mt-2 space-y-2">
                    {Object.entries(selectedOrder.products).map(([pid, qty]) => {
                      const prod = productsInfo.find(p => p.product_id === Number(pid));
                      return (
                        <li key={pid} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-100">
                          {prod && prod.primary_media ? (
                            <img
                              src={prod.primary_media.startsWith('http') ? prod.primary_media : prod.primary_media.startsWith('/') ? prod.primary_media : `/api/media/${prod.primary_media}`}
                              alt={prod.name}
                              className="w-12 h-12 object-cover rounded border border-gray-200 bg-white"
                              onError={e => (e.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-blue-800">{prod ? prod.name : `Product #${pid}`}</span> x {qty}
                            {prod && (
                              <span className="ml-2 text-xs text-gray-500">@ {typeof prod.sell_price === 'number' && !isNaN(prod.sell_price) ? prod.sell_price.toFixed(2) : '-' } EGP</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mb-3 text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">Discount:</span> {selectedOrder.discount_code ? (
                    <span className="text-green-700 font-semibold">{selectedOrder.discount_code} ({selectedOrder.discount} EGP)</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
                <div className="mb-3 text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">Total Price:</span> <span className="text-blue-700 font-bold">{
                    typeof selectedOrder.total_price === 'number' && !isNaN(selectedOrder.total_price)
                      ? selectedOrder.total_price.toFixed(2)
                      : (Number.isFinite(Number(selectedOrder.total_price)) && !isNaN(Number(selectedOrder.total_price))
                          ? Number(selectedOrder.total_price).toFixed(2)
                          : '-')
                  }</span>
                </div>
                {selectedReceipt && (
                  <>
                    <div className="mb-3 text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">Payment Method:</span> {editMode ? (
                        <input
                          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"
                          value={editPaymentMethod}
                          onChange={e => setEditPaymentMethod(e.target.value)}
                        />
                      ) : (
                        <span>{selectedReceipt.payment_method || '-'}</span>
                      )}
                    </div>
                    <div className="mb-3 text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">Price Paid:</span> {editMode ? (
                        <input
                          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"
                          value={editPricePaid}
                          onChange={e => setEditPricePaid(e.target.value)}
                          type="number"
                        />
                      ) : (
                        <span className="text-blue-700 font-bold">{
                          typeof selectedReceipt.price_paid === 'number' && !isNaN(selectedReceipt.price_paid)
                            ? selectedReceipt.price_paid.toFixed(2)
                            : (Number.isFinite(Number(selectedReceipt.price_paid)) && !isNaN(Number(selectedReceipt.price_paid))
                                ? Number(selectedReceipt.price_paid).toFixed(2)
                                : '-')
                        }</span>
                      )}
                    </div>
                    <div className="mb-3 text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">Receipt ID:</span> <span>{selectedReceipt.receipt_id}</span>
                    </div>
                    <div className="mb-3 text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">Receipt Created At:</span> <span>{new Date(selectedReceipt.created_at).toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex gap-3 mt-8 print:hidden justify-end">
                  {!editMode ? (
                    <>
                      <button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all duration-150"
                        onClick={handleEdit}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold shadow-md transition-all duration-150"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold shadow-md transition-all duration-150"
                        onClick={handlePrint}
                      >
                        Print Receipt
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all duration-150"
                        onClick={handleSaveEdit}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold shadow-md transition-all duration-150"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 