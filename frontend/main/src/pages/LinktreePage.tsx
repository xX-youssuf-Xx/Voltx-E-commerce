import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import logo from '/voltx.jpg';

const socialLinks = [
  {
    href: 'https://www.facebook.com/share/1Ax66TcXgd/',
    label: 'Facebook',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F3" xmlns="http://www.w3.org/2000/svg"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
    ),
  },
  {
    href: 'https://www.instagram.com/voltx.electronics?igsh=MWwweTRuMzF1eXQ1MQ==',
    label: 'Instagram',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#E4405F" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.835.248 2.32.422.48.174.89.422 1.302.834.412.412.66.822.834 1.302.174.486.368 1.15.422 2.32.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.248 1.835-.422 2.32-.174.48-.422.89-.834 1.302-.412.412-.822.66-1.302.834-.486.174-1.15.368-2.32.422-1.265.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.835-.248-2.32-.422-.48-.174-.89-.422-1.302-.834-.412-.412-.66-.822-.834-1.302-.174-.486-.368-1.15-.422-2.32-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.248-1.835.422-2.32.174-.48.422-.89.834-1.302.412-.412.822-.66 1.302-.834.486-.174 1.15-.368 2.32-.422C8.416 2.175 8.796 2.163 12 2.163m0-1.622c-3.259 0-3.667.014-4.947.072-1.28.058-2.177.248-2.948.556-.78.308-1.458.73-2.028 1.3-.57.57-.992 1.247-1.3 2.028-.308.77-.498 1.667-.556 2.948-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.28.248 2.177.556 2.948.308.78.73 1.458 1.3 2.028.57.57 1.247.992 2.028 1.3.77.308 1.667.498 2.948.556 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.28-.058 2.177-.248 2.948-.556.78-.308 1.458-.73 2.028-1.3.57-.57.992-1.247-1.3-2.028.308-.77.498-1.667.556-2.948.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.28-.248-2.177-.556-2.948-.308-.78-.73-1.458-1.3-2.028-.57-.57-1.247-.992-2.028-1.3-.77-.308-1.667-.498-2.948-.556C15.667.555 15.259.54 12 .541z"/><path d="M12 6.837a5.163 5.163 0 100 10.326 5.163 5.163 0 000-10.326zm0 8.488a3.325 3.325 0 110-6.65 3.325 3.325 0 010 6.65zm6.406-8.845a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0"/></svg>
    ),
  },
  {
    href: 'https://wa.me/201031367325',
    label: 'WhatsApp',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 32 32" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M16 2.938c-7.284 0-13.188 5.904-13.188 13.188 0 2.325.617 4.594 1.789 6.594L2 30l7.469-2.031c1.938 1.063 4.094 1.625 6.281 1.625 7.284 0 13.188-5.904 13.188-13.188S23.284 2.938 16 2.938zm0 23.938c-2.031 0-4.031-.531-5.781-1.531l-.406-.25-4.438 1.188 1.188-4.313-.25-.438c-1.125-1.844-1.719-3.938-1.719-6.094 0-6.094 4.969-11.063 11.063-11.063 6.094 0 11.063 4.969 11.063 11.063 0 6.094-4.969 11.063-11.063 11.063zm6.094-8.344c-.344-.172-2.031-1-2.344-1.125-.313-.125-.531-.188-.75.188-.219.375-.875 1.125-1.063 1.344-.188.219-.375.25-.719.094-.344-.172-1.438-.531-2.75-1.688-1.016-.906-1.703-2.031-1.906-2.375-.188-.344-.02-.531.141-.719.141-.141.313-.375.469-.563.156-.188.219-.313.344-.531.125-.219.063-.406-.031-.563-.094-.156-.844-2.031-1.156-2.781-.305-.734-.617-.625-.844-.625-.219 0-.469-.031-.719-.031-.25 0-.531.078-.813.391-.281.313-1.063 1.031-1.063 2.5 0 1.469 1.094 2.875 1.25 3.063.156.188 2.156 3.281 5.25 4.469.734.313 1.313.5 1.75.641.734.234 1.406.203 1.938.125.594-.094 1.813-.75 2.063-1.469.25-.719.25-1.344.188-1.469-.063-.125-.25-.188-.531-.313z"/></svg>
    ),
  },
];

const LinktreePage: React.FC = () => {
  return (
    <div className="bg-blue-50 min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 sm:h-36 sm:w-36 mb-5 border-4 border-blue-200 shadow-lg">
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
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-blue-100 text-blue-900 text-base font-semibold leading-normal tracking-[0.015em] w-full transition-colors duration-300 ease-in-out hover:bg-blue-300 hover:text-white"
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