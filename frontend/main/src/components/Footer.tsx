import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const socialLinks = [
    {
      href: 'https://www.facebook.com/share/1Ax66TcXgd/',
      label: 'Facebook',
      icon: <FaFacebook size={20} color="#1877F3" />,
    },
    {
      href: 'https://www.instagram.com/voltx.electronics?igsh=MWwweTRuMzF1eXQ1MQ==',
      label: 'Instagram',
      icon: <FaInstagram size={20} color="#E4405F" />,
    },
    {
      href: 'https://wa.me/201031367325',
      label: 'WhatsApp',
      icon: <FaWhatsapp size={20} color="#25D366" />,
    },
  ];

  return (
    <footer className="py-6" style={{ background: '#094486', color: 'white', fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="md:flex-shrink-0">
            <h3 className="text-xl font-bold text-white mb-2">Voltx Electronics</h3>
            <p className="text-base text-white/80 ml-0 md:ml-4">Your trusted partner for quality electronics and components.</p>
          </div>
          <div className="md:flex-1 md:ml-44">
            <h3 className="text-xl font-bold text-white mb-2">Quick Links</h3>
            <div className="text-base text-white/80 ml-0 md:ml-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Link className="text-white hover:text-blue-300 transition-colors" to="/">Home</Link>
                <Link className="text-white hover:text-blue-300 transition-colors" to="/shop">Shop</Link>
                <Link className="text-white hover:text-blue-300 transition-colors" to="/about">About Us</Link>
                <Link className="text-white hover:text-blue-300 transition-colors" to="/contact">Contact Us</Link>
                <Link className="text-white hover:text-blue-300 transition-colors" to="/privacy">Privacy Policy</Link>
                <Link className="text-white hover:text-blue-300 transition-colors" to="/services">Services</Link>
              </div>
            </div>
          </div>
          <div className="md:flex-shrink-0 md:mr-24">
            <h3 className="text-xl font-bold text-white mb-2">Connect With Us</h3>
            <div className="flex space-x-4 justify-center md:justify-end ml-0 md:ml-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  aria-label={link.label}
                  className="text-blue-200 hover:text-blue-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-blue-700 pt-4 text-center">
          <p className="text-base text-white/80">
            © 2024 Voltx Electronics. All rights reserved. | Designed and Developed by{' '}
            <a 
              href="https://youssufhosam.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors font-semibold"
            >
              Youssef Hosameldin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;