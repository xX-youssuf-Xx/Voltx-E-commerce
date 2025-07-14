import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import logo from '/voltx.jpg';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const socialLinks = [
  {
    href: 'https://www.facebook.com/share/1Ax66TcXgd/',
    label: 'Facebook',
    icon: <FaFacebook size={20} color="#1877F3" style={{ marginRight: 8 }} />,
  },
  {
    href: 'https://www.instagram.com/voltx.electronics?igsh=MWwweTRuMzF1eXQ1MQ==',
    label: 'Instagram',
    icon: <FaInstagram size={20} color="#E4405F" style={{ marginRight: 8 }} />,
  },
  {
    href: 'https://wa.me/201031367325',
    label: 'WhatsApp',
    icon: <FaWhatsapp size={20} color="#25D366" style={{ marginRight: 8 }} />,
  },
  {
    href: 'https://voltx-store.com',
    label: 'Website',
    icon: <img src={logo} alt="Voltx Logo" className="w-5 h-5 mr-2 rounded-full" />,
  },
];

const LinktreePage: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 sm:h-36 sm:w-36 mb-5 border-4 border-blue-100 shadow-lg">
            <img src={logo} alt="Voltx Logo" className="h-full w-full object-cover rounded-full" />
          </div>
          <h1 className="text-blue-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">Voltx Electronics</h1>
          <p className="text-blue-700 text-base sm:text-lg font-normal leading-normal max-w-md">Your one-stop shop for Arduino, Raspberry Pi, ESP32 products, and More.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-xl">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-white text-blue-900 text-base font-semibold leading-normal tracking-[0.015em] w-full transition-colors duration-300 ease-in-out hover:bg-blue-100 hover:text-blue-700 border border-blue-100"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>
        <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-lg mb-10">
          <iframe
            title="Voltx Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4655.873751385271!2d31.3651372!3d31.0412413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f79d00389f50ff%3A0xdb26a929f5307f9f!2sVoltx%20store!5e1!3m2!1sen!2seg!4v1752217849073!5m2!1sen!2seg"
            width="100%"
            height="320"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LinktreePage; 