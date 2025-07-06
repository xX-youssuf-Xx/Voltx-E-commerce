import React from 'react';

const CategoriesBrandsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories & Brands</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Categories & Brands Management</h2>
          <p className="text-gray-500">This page will contain category and brand management functionality including:</p>
          <ul className="text-gray-500 mt-2 space-y-1">
            <li>• Create, edit, and delete categories</li>
            <li>• Hierarchical category structure</li>
            <li>• Create, edit, and delete brands</li>
            <li>• Category and brand assignments</li>
            <li>• Bulk operations</li>
            <li>• Category and brand analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoriesBrandsPage; 