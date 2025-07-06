import React from 'react';

const DiscountsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎫</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Discount Management</h2>
          <p className="text-gray-500">This page will contain discount management functionality including:</p>
          <ul className="text-gray-500 mt-2 space-y-1">
            <li>• Create and manage discount codes</li>
            <li>• Percentage and fixed amount discounts</li>
            <li>• Usage limits and restrictions</li>
            <li>• Date range management</li>
            <li>• Discount analytics and reporting</li>
            <li>• Bulk discount operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiscountsPage; 