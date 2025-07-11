import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '/voltx.jpg';

const NavBar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Toggle this to test logged in/out states
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-blue-100 px-6 md:px-10 py-4 shadow-sm bg-white relative z-40" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        {/* Logo */}
        <a href="https://voltx-store.com" className="flex items-center gap-3 text-gray-900" target="_blank" rel="noopener noreferrer">
<img src={logo} alt="logo" className="h-8 w-8 text-blue-600" />
          <h1 className="hidden md:block text-gray-900 text-xl font-bold leading-tight tracking-tight">Voltx</h1>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 ml-12">
          <Link className="text-gray-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" to="/">Home</Link>
        <Link className="text-gray-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" to="/shop">Shop</Link>
          <Link className="text-gray-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" to="/about">About</Link>
          <Link className="text-gray-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" to="/contact">Contact</Link>
          <Link className="text-gray-900 hover:text-blue-600 text-sm font-medium leading-normal transition-colors" to="/services">Services</Link>
      </nav>

        {/* Desktop Search - Centered */}
        <div className="hidden md:flex flex-1 justify-center mx-8">
          <label className="relative flex items-center w-full max-w-md h-10">
            <div className="absolute left-3 text-gray-500">
              <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input className="form-input w-full rounded-lg border border-blue-100 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-full placeholder:text-gray-500 pl-10 pr-4 py-2 text-sm font-normal leading-normal text-gray-900 transition-colors" placeholder="Search products..." />
          </label>
    </div>

        {/* Mobile Search Bar */}
        <div className="flex-1 mx-4 md:hidden">
          <label className="relative flex items-center w-full h-10">
        <div className="absolute left-3 text-gray-500">
          <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
          </svg>
        </div>
        <input className="form-input w-full rounded-lg border border-blue-100 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-full placeholder:text-gray-500 pl-10 pr-4 py-2 text-sm font-normal leading-normal text-gray-900 transition-colors" placeholder="Search products..." />
      </label>
        </div>

        {/* Desktop Right Side - Cart, Wishlist, Profile/Auth */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart */}
          <Link to="/carts" aria-label="Shopping Cart" className="flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors relative">
        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
        </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" aria-label="Wishlist" className="flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors relative">
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.69,146.26,196.16,128,206.8Z"></path>
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
          </Link>

          {/* Profile Dropdown or Auth Buttons */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
                <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 transition-all duration-200 ${
                isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
              }`}>
                <Link to="/my-orders" onClick={handleLinkClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  My Orders
                </Link>
                <button 
                  onClick={toggleLogin}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" onClick={handleLinkClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Login</Link>
              <Link to="/register" onClick={handleLinkClick} className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Burger Menu */}
        <button 
          aria-label="Menu"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
            <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,88H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
          </svg>
        </button>
  </header>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
        isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <a href="https://voltx-store.com" className="flex items-center gap-3 text-gray-900" target="_blank" rel="noopener noreferrer">
                <img src={logo} alt="logo" className="h-8 w-8 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Voltx</h2>
              </a>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <nav className="px-6 py-4 space-y-2">
              <Link to="/" onClick={handleLinkClick} className="block px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">Home</Link>
              <Link to="/shop" onClick={handleLinkClick} className="block px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">Shop</Link>
              <Link to="/about" onClick={handleLinkClick} className="block px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">About</Link>
              <Link to="/contact" onClick={handleLinkClick} className="block px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">Contact</Link>
              <Link to="/services" onClick={handleLinkClick} className="block px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">Services</Link>

              {/* Divider */}
              <hr className="my-4 border-gray-200" />

              {/* My Orders - Only show when logged in */}
              {isLoggedIn && (
                <Link to="/my-orders" onClick={handleLinkClick} className="flex items-center px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
                  <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,48H40A16,16,0,0,0,24,64V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48Zm0,16V88H40V64Zm0,128H40V104H216v88ZM168,144a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,144Zm0,24a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  My Orders
                </Link>
              )}

              {/* Cart */}
              <Link to="/carts" onClick={handleLinkClick} className="flex items-center px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
                <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z"></path>
                </svg>
                Cart
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" onClick={handleLinkClick} className="flex items-center px-4 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
                <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.69,146.26,196.16,128,206.8Z"></path>
                </svg>
                Wishlist
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </Link>
            </nav>

            {/* Auth Buttons - Moved after navigation links */}
            <div className="px-6 py-4 border-t border-gray-200 space-y-3">
              {isLoggedIn ? (
                <button 
                  onClick={() => { toggleLogin(); handleLinkClick(); }}
                  className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={handleLinkClick} className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={handleLinkClick} className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Spacer to push auth buttons away from bottom */}
            <div className="flex-1"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar; 