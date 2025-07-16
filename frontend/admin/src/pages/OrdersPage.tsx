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

const OrdersPage: React.FC = () => {
  const { token } = useAuth();
  const { get } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

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

  const handleViewReceipt = (receipt_id: number | null) => {
    if (!receipt_id || !token) return;
    get(`/receipts/${receipt_id}`)
      .then(res => {
        if (res.status === 401) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setSelectedReceipt(data);
        setShowReceipt(true);
      })
      .catch((err) => setError(err.message || 'Failed to load receipt'));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
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
                <th className="px-4 py-2">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id}>
                  <td className="px-4 py-2">{order.order_id}</td>
                  <td className="px-4 py-2">{order.customer_id ?? '-'}</td>
                  <td className="px-4 py-2">{order.order_type}</td>
                  <td className="px-4 py-2">{order.total_price.toFixed(2)}</td>
                  <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {order.receipt_id ? (
                      <button className="text-blue-600 underline" onClick={() => handleViewReceipt(order.receipt_id)}>View Receipt</button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showReceipt && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowReceipt(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Receipt #{selectedReceipt.receipt_id}</h2>
            <div className="mb-2">Order ID: {selectedReceipt.order_id}</div>
            <div className="mb-2">Payment Method: {selectedReceipt.payment_method}</div>
            <div className="mb-2">Price Paid: {selectedReceipt.price_paid.toFixed(2)}</div>
            <div className="mb-2">Created At: {new Date(selectedReceipt.created_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 