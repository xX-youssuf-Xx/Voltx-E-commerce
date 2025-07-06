import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

const HomePage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', pass: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { post } = useApi();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await post('/auth/register', {
        name: form.name,
        email: form.email,
        pass: form.pass,
      });
      if (res.ok) {
        setSuccess('Thank you for signing up! You will receive a 10% coupon when the store opens.');
        setForm({ name: '', email: '', pass: '' });
      } else {
        const data = await res.json();
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('VOLTX10');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-blue-700 via-blue-400 to-blue-900">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-md mx-auto text-center p-4 sm:p-8 rounded-lg shadow-lg border border-gray-100 bg-white">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-3 sm:mb-4 tracking-wide uppercase">Coming Soon</h2>
        <img
          src="/voltx.jpg"
          alt="VoltX Logo"
          className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6 rounded-lg object-contain bg-white"
        />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">VoltX Store</h1>
        <p className="mb-4 sm:mb-6 text-gray-700 text-base sm:text-lg font-medium">
          Sign up now and get a <span className="text-blue-600 font-bold">15% coupon</span> when the store opens!
        </p>
        {success ? (
          <div className="flex flex-col items-center justify-center mt-6 sm:mt-8">
            <div className="text-base sm:text-lg text-green-700 font-semibold mb-3 sm:mb-4">{success}</div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shadow-lg w-full max-w-xs mx-auto">
              <span className="text-lg sm:text-2xl font-mono font-bold text-white tracking-widest select-all">VOLTX15</span>
              <button
                onClick={handleCopy}
                className={`mt-2 sm:mt-0 ml-0 sm:ml-2 px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow transition-all duration-200 hover:bg-blue-100 active:scale-95 border border-blue-200 flex items-center gap-2`}
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><rect x="3" y="3" width="13" height="13" rx="2" /></svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 sm:mt-4 text-blue-700 text-xs sm:text-sm">Use this code for 10% off when we launch!</div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                required
              />
              <input
                type="password"
                name="pass"
                placeholder="Password"
                value={form.pass}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                required
              />
              <button
                type="submit"
                className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Sign Up Early'}
              </button>
            </form>
            {error && <div className="mt-3 sm:mt-4 text-red-600 font-semibold text-sm sm:text-base">{error}</div>}
          </>
        )}
      </div>
      {/*
        To display the logo, place your logo image as 'frontend/main/public/voltx.jpg'.
        The public folder is where Vite serves static assets from.
      */}
    </div>
  );
};

export default HomePage; 