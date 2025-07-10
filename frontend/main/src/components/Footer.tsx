import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-300 py-8 md:py-12" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Voltx Electronics</h3>
          <p className="text-sm">Your source for Arduino, Raspberry Pi, and ESP32 products.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-blue-400 transition-colors" href="#">Shop All</a></li>
            <li><a className="hover:text-blue-400 transition-colors" href="#">About Us</a></li>
            <li><a className="hover:text-blue-400 transition-colors" href="#">Contact</a></li>
            <li><a className="hover:text-blue-400 transition-colors" href="#">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connect With Us</h3>
          <div className="flex space-x-4">
            <a aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors" href="#">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path></svg>
            </a>
            <a aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors" href="#">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
            </a>
            <a aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors" href="#">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.379.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.379.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.379-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fillRule="evenodd"></path></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-8 text-center">
        <p className="text-sm text-gray-400">© 2024 Voltx Electronics. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer; 