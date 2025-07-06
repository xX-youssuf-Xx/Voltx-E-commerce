import React from 'react';

const CartsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Carts</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Shopping Carts Management</h2>
          <p className="text-gray-500">This page will contain shopping cart management functionality including:</p>
          <ul className="text-gray-500 mt-2 space-y-1">
            <li>• View all active shopping carts</li>
            <li>• Cart abandonment tracking</li>
            <li>• Shareable cart management</li>
            <li>• Cart analytics and insights</li>
            <li>• Cart recovery campaigns</li>
            <li>• Customer cart history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CartsPage; 