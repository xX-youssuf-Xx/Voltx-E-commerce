import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import logo from '/voltx.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    // Note: We don't validate password format on login, only on registration

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      // Error is handled by the AuthContext
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 py-4 px-4">
        <div className="bg-white rounded-xl shadow-lg px-4 py-6 w-full max-w-xs sm:max-w-sm border-t-4 border-blue-500">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Voltx Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Voltx</h1>
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
            Welcome Back
          </h2>
          
          {error && (
            <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-2 sm:px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm transition-colors text-gray-900 ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-2 sm:px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm transition-colors text-gray-900 ${
                  errors.password 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg shadow transition-colors text-xs sm:text-sm mt-4 sm:mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login; 