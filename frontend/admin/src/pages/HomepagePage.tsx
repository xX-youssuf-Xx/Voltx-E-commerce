import React from 'react';

const HomepagePage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Homepage Management</h2>
          <p className="text-gray-500">This page will contain homepage management functionality including:</p>
          <ul className="text-gray-500 mt-2 space-y-1">
            <li>• Featured products management</li>
            <li>• Best sellers configuration</li>
            <li>• New arrivals setup</li>
            <li>• Banner and hero section management</li>
            <li>• Content blocks and widgets</li>
            <li>• Layout customization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomepagePage; 