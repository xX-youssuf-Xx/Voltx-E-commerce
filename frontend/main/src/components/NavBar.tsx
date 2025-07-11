import React from 'react';
import logo from '/voltx.jpg';
const NavBar: React.FC = () => (
  <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-blue-200 px-4 md:px-10 py-3 shadow-sm bg-blue-50" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
    <div className="flex items-center gap-4 md:gap-8">
      <div className="flex items-center gap-2 text-blue-900">
        <img src={logo} alt="logo" className="h-8 w-8 text-blue-600" />
        <h1 className="hidden md:block text-blue-900 text-xl font-bold leading-tight tracking-tight">Voltx</h1>
      </div>
      <nav className="hidden md:flex items-center gap-6 lg:gap-8">
        <a className="text-blue-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" href="#">Shop</a>
        <a className="text-blue-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" href="#">Learn</a>
        <a className="text-blue-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" href="#">Community</a>
        <a className="text-blue-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" href="#">Support</a>
      </nav>
    </div>
    <div className="flex items-center gap-2 md:gap-6 w-full max-w-xs md:max-w-md">
      <label className="relative flex items-center w-full !h-10">
        <div className="absolute left-3 text-blue-400">
          <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
          </svg>
        </div>
        <input className="form-input w-full rounded-lg border border-blue-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 h-full placeholder:text-blue-400 pl-10 pr-4 py-2 text-sm font-normal leading-normal text-blue-900 transition-colors" placeholder="Search products..." />
      </label>
      <button aria-label="Shopping Cart" className="hidden md:flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-blue-900 hover:bg-blue-100 hover:text-blue-600 transition-colors">
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
        </svg>
      </button>
      <button aria-label="Menu" className="md:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-blue-900 hover:bg-blue-100 hover:text-blue-600 transition-colors">
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,88H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
      </button>
    </div>
  </header>
);

export default NavBar; 