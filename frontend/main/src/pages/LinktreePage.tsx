import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const socialLinks = [
  {
    href: 'https://www.facebook.com/share/1Ax66TcXgd/',
    label: 'Facebook',
    icon: (
      <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.03998C6.49999 2.03998 2.04999 6.48998 2.04999 12C2.04999 16.79 5.44999 20.81 9.94999 21.81V14.66H7.24999V12H9.94999V9.79998C9.94999 7.13998 11.59 5.68998 13.99 5.68998C15.13 5.68998 16.11 5.77998 16.35 5.80998V8.20998H15.01C13.71 8.20998 13.45 8.97998 13.45 9.99998V12H16.2L15.79 14.66H13.45V21.88C18.39 21.23 21.95 17.06 21.95 12C21.95 6.48998 17.5 2.03998 12 2.03998Z"></path></svg>
    ),
  },
  {
    href: 'https://www.instagram.com/voltx.electronics?igsh=MWwweTRuMzF1eXQ1MQ==',
    label: 'Instagram',
    icon: (
      <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.835.248 2.32.422.48.174.89.422 1.302.834.412.412.66.822.834 1.302.174.486.368 1.15.422 2.32.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.248 1.835-.422 2.32-.174.48-.422.89-.834 1.302-.412.412-.822.66-1.302.834-.486.174-1.15.368-2.32.422-1.265.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.835-.248-2.32-.422-.48-.174-.89-.422-1.302-.834-.412-.412-.66-.822-.834-1.302-.174-.486-.368-1.15-.422-2.32-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.248-1.835.422-2.32.174-.48.422-.89.834-1.302.412-.412.822-.66 1.302-.834.486-.174 1.15-.368 2.32-.422C8.416 2.175 8.796 2.163 12 2.163m0-1.622c-3.259 0-3.667.014-4.947.072-1.28.058-2.177.248-2.948.556-.78.308-1.458.73-2.028 1.3-.57.57-.992 1.247-1.3 2.028-.308.77-.498 1.667-.556 2.948-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.28.248 2.177.556 2.948.308.78.73 1.458 1.3 2.028.57.57 1.247.992 2.028 1.3.77.308 1.667.498 2.948.556 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.28-.058 2.177-.248 2.948-.556.78-.308 1.458-.73 2.028-1.3.57-.57.992-1.247-1.3-2.028.308-.77.498-1.667.556-2.948.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.28-.248-2.177-.556-2.948-.308-.78-.73-1.458-1.3-2.028-.57-.57-1.247-.992-2.028-1.3-.77-.308-1.667-.498-2.948-.556C15.667.555 15.259.54 12 .541z"></path><path d="M12 6.837c-2.846 0-5.163 2.317-5.163 5.163s2.317 5.163 5.163 5.163 5.163-2.317 5.163-5.163S14.846 6.837 12 6.837zm0 8.687c-1.944 0-3.523-1.579-3.523-3.523s1.579-3.523 3.523-3.523 3.523 1.579 3.523 3.523-1.579 3.523-3.523 3.523zm5.408-8.727c-.588 0-1.064.476-1.064 1.064s.476 1.064 1.064 1.064 1.064-.476 1.064-1.064-.476-1.064-1.064-1.064z"></path></svg>
    ),
  },
  {
    href: 'https://wa.me/201031367325',
    label: 'WhatsApp',
    icon: (
      <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.77 3.05 1.18 4.74 1.18h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm4.64 12.42c-.21.44-.78.71-1.37.79-.52.07-1.01.09-1.58.04-.45-.03-1.08-.2-2.17-1.19s-1.63-2.18-1.79-2.36c-.15-.18-.31-.3-.45-.3s-.3.02-.43.16c-.13.14-.56.59-.71.76-.14.18-.29.2-.43.13-.14-.07-.59-.23-1.12-.7s-.89-.98-1.02-1.15c-.12-.18-.02-.28.08-.38.09-.1.2-.23.29-.35.09-.11.13-.18.19-.31.06-.13.03-.24-.02-.33s-.2-.23-.28-.31c-.08-.08-.17-.1-.25-.1s-.17 0-.25.03c-.08.03-.18.06-.27.11-.45.21-.72.63-.72 1.17 0 .23.06.46.13.68.2.52.67 1.49 1.73 2.47.79.73 1.53 1.18 2.43 1.53.58.22 1.07.33 1.52.42.57.11 1.04.1 1.38.04.4-.07.99-.3 1.22-.78.11-.24.11-.45.08-.68-.03-.22-.08-.28-.15-.33s-.16-.07-.29-.07c-.12 0-.21.01-.3.02-.16.03-.28.04-.41.04-.18 0-.41-.03-.63-.14-.23-.11-.4-.26-.4-.47s.08-.36.2-.49c.12-.13.27-.21.46-.21.14 0 .27.02.39.07.19.08.36.27.41.47.03.11.03.21.01.31z"></path></svg>
    ),
  },
];

const LinktreePage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 sm:h-36 sm:w-36 mb-5 border-4 border-[#e8b4b7] shadow-lg" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAIU9cToJWBwAt2VnSAQ1tbt1pGltC7p_vWqMJKwCNZcUquD7s_Iz7cfCvOXgQtilYOzLm1e4qAS19DWGtcP6u_B0gqFSojwa6zs2rauhgJ2LU2fpS-wS6b8oaYgENHwTQCPPXIK9Hfkj3eyz3aeyZIYv6vC47AGMAYPvUNArTPS6HeiUvO0CKl_pRp1lXMP6LIAwAwyK7tqxEVtrTqlzm8qqUFrku1zDQwD-IgL11PGhYypOX3d--VFBC3O2jX4VtZt0FvMk9Y93tE)' }} />
          <h1 className="text-[#191011] text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">Voltx Electronics</h1>
          <p className="text-[#5c4b4c] text-base sm:text-lg font-normal leading-normal max-w-md">Your one-stop shop for Arduino, Raspberry Pi, ESP32 products , and More.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-xl">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#f1e9ea] text-[#191011] text-base font-semibold leading-normal tracking-[0.015em] w-full transition-colors duration-300 ease-in-out hover:bg-[#e8b4b7] hover:text-white"
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