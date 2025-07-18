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
  sku?: string;
  box_number?: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [printMode, setPrintMode] = useState(false);

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
  }, [token]);

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
    setSelectedReceipt(null);
    setCustomer(null);
    setProductsInfo([]);
    setModalLoading(true);
    setModalError(null);
    try {
      // Fetch all details in one request (order, customer, receipt)
      const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') + '/products';
      const res = await fetch(`${apiBase}/orders/${order.order_id}/details`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load order details');
      const data = await res.json();
      setSelectedOrder(data.order);
      setCustomer(data.customer);
      setSelectedReceipt(data.receipt);
      setEditLocation(data.order.shipping_location || '');
      setEditPricePaid(data.receipt && data.receipt.price_paid ? String(data.receipt.price_paid) : '');
      setEditPaymentMethod(data.receipt && data.receipt.payment_method ? data.receipt.payment_method : '');
      // Fetch product details separately for the products section
      const productIds = Object.keys(data.order.products).map(Number);
      if (productIds.length > 0) {
        const byIdsRes = await fetch(`${apiBase}/by-ids`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ ids: productIds })
        });
        if (byIdsRes.ok) {
          const products = await byIdsRes.json();
          setProductsInfo(products);
        } else {
          setProductsInfo([]);
        }
      } else {
        setProductsInfo([]);
      }
      setModalLoading(false);
    } catch (err: any) {
      setModalError('Failed to load order details.');
      setModalLoading(false);
    }
  };

  const handleEdit = () => setShowEditModal(true);
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditLocation(selectedOrder?.shipping_location || '');
    setEditPricePaid(selectedReceipt && selectedReceipt.price_paid ? String(selectedReceipt.price_paid) : '');
    setEditPaymentMethod(selectedReceipt && selectedReceipt.payment_method ? selectedReceipt.payment_method : '');
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder || !selectedReceipt) return;
    setSaving(true);
    try {
      await put(`/orders/${selectedOrder.order_id}`, { shipping_location: editLocation });
      await put(`/receipts/${selectedReceipt.receipt_id}`, { price_paid: Number(editPricePaid), payment_method: editPaymentMethod });
      const res = await get('/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setShowEditModal(false);
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

  // Print only the modal
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 500);
    }, 100);
  };

  return (
    <div className="p-6">
      <style>{`
        .modal-scrollbar::-webkit-scrollbar { display: none; }
        .modal-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        @media print {
          body * { visibility: hidden !important; }
          #order-modal-print, #order-modal-print * { visibility: visible !important; }
          #order-modal-print { position: absolute !important; left: 0; top: 0; width: 80mm !important; min-width: 80mm !important; max-width: 80mm !important; background: white; box-shadow: none; border: none; }
          #order-modal-print .print-hide, .print-hide { display: none !important; }
          #order-modal-print .print-receipt { display: block !important; width: 100% !important; }
          #order-modal-print .print-products { display: none !important; }
        }
      `}</style>
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
        <div className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 print:bg-transparent print:relative print:inset-auto ${printMode ? 'print:bg-white' : ''}`}>
          <div
            id="order-modal-print"
            className="bg-white rounded-xl shadow-xl p-0 min-w-[350px] max-w-md w-full relative border border-blue-200 flex flex-col modal-scrollbar"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 print:hidden text-3xl font-bold z-10 print-hide"
              onClick={() => setShowDetails(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* Order Info Section */}
            <div className="bg-white rounded-lg shadow border border-blue-100 mb-3 mx-4 mt-6 p-4 flex flex-col gap-1 print-hide">
              <div className="text-base font-semibold text-blue-700 mb-1 flex items-center gap-2"><span className="i-heroicons-clipboard-document text-blue-400" />Order Info</div>
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                <span className="font-semibold">Order ID:</span> <span>{selectedOrder.order_id}</span>
              </div>
              {selectedReceipt && (
                <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                  <span className="font-semibold">Receipt ID:</span> <span>{selectedReceipt.receipt_id}</span>
                </div>
              )}
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                <span className="font-semibold">Created At:</span> <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              {selectedReceipt && (
                <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                  <span className="font-semibold">Receipt Created:</span> <span>{new Date(selectedReceipt.created_at).toLocaleString()}</span>
                </div>
              )}
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                <span className="font-semibold">Order Type:</span> <span>{selectedOrder.order_type}</span>
              </div>
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                <span className="font-semibold">Customer:</span> <span className="text-blue-700 font-medium">{customer ? customer.name : (selectedOrder.customer_id ?? '-')}</span>
                {customer && <span className="ml-2 text-gray-500 text-xs">({customer.email})</span>}
              </div>
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                <span className="font-semibold">Shipping Location:</span> <span>{selectedOrder.shipping_location || '-'}</span>
              </div>
            </div>
            {/* Products Section (hide for print) */}
            <div className="bg-white rounded-lg shadow border border-blue-100 mb-3 mx-4 p-4 flex flex-col gap-2 print-products print-hide">
              <div className="text-base font-semibold text-blue-700 mb-1 flex items-center gap-2"><span className="i-heroicons-cube text-blue-400" />Products</div>
              <ul className="space-y-2">
                {Object.entries(selectedOrder.products).map(([pid, qty]) => {
                  const prod = productsInfo.find(p => p.product_id === Number(pid));
                  // Debug log for image path
                  if (prod) console.log('Product image path:', prod.primary_media);
                  return (
                    <li key={pid} className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                      {prod && prod.primary_media ? (
                        <img
                          src={prod.primary_media}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded border border-blue-200 bg-white"
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-400">No Image</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-blue-800 text-sm">{prod ? prod.name : `Product #${pid}`}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* Payment Section (print only this) */}
            <div className="bg-white rounded-lg shadow border border-blue-100 mb-3 mx-4 p-4 flex flex-col gap-1 print-receipt" style={{ width: '100%' }}>
              <div className="text-base font-semibold text-blue-700 mb-1 flex items-center gap-2"><span className="i-heroicons-credit-card text-blue-400" />Payment</div>
              {selectedReceipt && (
                <>
                  <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                    <span className="font-semibold">Payment Method:</span> <span>{selectedReceipt.payment_method || '-'}</span>
                  </div>
                  <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm">
                    <span className="font-semibold">Price Paid:</span> <span className="text-blue-700 font-bold">{
                      typeof selectedReceipt.price_paid === 'number' && !isNaN(selectedReceipt.price_paid)
                        ? selectedReceipt.price_paid.toFixed(2)
                        : (Number.isFinite(Number(selectedReceipt.price_paid)) && !isNaN(Number(selectedReceipt.price_paid))
                            ? Number(selectedReceipt.price_paid).toFixed(2)
                            : '-')
                    }</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 text-sm mt-2">
                <span className="font-semibold text-blue-700">Discount:</span> {selectedOrder.discount_code ? (
                  <span className="text-green-700 font-semibold">{selectedOrder.discount_code} ({selectedOrder.discount} EGP)</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-blue-700">Total Price:</span> <span className="text-blue-700 font-bold">{
                  typeof selectedOrder.total_price === 'number' && !isNaN(selectedOrder.total_price)
                    ? selectedOrder.total_price.toFixed(2)
                    : (Number.isFinite(Number(selectedOrder.total_price)) && !isNaN(Number(selectedOrder.total_price))
                        ? Number(selectedOrder.total_price).toFixed(2)
                        : '-')
                }</span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 mt-2 print:hidden justify-end sticky bottom-0 bg-white py-2 border-t border-blue-100 px-6 print-hide">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all duration-150"
                onClick={handleEdit}
              >
                Edit
              </button>
              <button
                className="bg-gray-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 font-semibold shadow-md transition-all duration-150"
                onClick={handlePrint}
              >
                Print Receipt
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold shadow-md transition-all duration-150"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && selectedOrder && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative flex flex-col gap-4">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={handleCancelEdit}
              aria-label="Close Edit Modal"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold text-blue-700 mb-2">Edit Order</h3>
            <label className="text-sm font-semibold text-gray-700">Shipping Location
              <input
                className="border rounded px-2 py-1 text-sm w-full mt-1 focus:ring-2 focus:ring-blue-300"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">Payment Method
              <input
                className="border rounded px-2 py-1 text-sm w-full mt-1 focus:ring-2 focus:ring-blue-300"
                value={editPaymentMethod}
                onChange={e => setEditPaymentMethod(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">Price Paid
              <input
                className="border rounded px-2 py-1 text-sm w-full mt-1 focus:ring-2 focus:ring-blue-300"
                value={editPricePaid}
                onChange={e => setEditPricePaid(e.target.value)}
                type="number"
              />
            </label>
            <div className="flex gap-2 mt-2 justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all duration-150"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold shadow-md transition-all duration-150"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 