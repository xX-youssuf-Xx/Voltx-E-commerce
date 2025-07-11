import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
    alert('Thank you for contacting us!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      <NavBar />
      <main className="min-h-[80vh] flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 py-8">
        <div className="w-full md:w-1/3 flex flex-col items-center px-4 md:px-4 mb-24 md:mb-0">
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200">
            <iframe
              title="Voltx Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.0123456789!2d31.235711315115!3d30.0444199818797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840c123456789%3A0xabcdefabcdefabcd!2sCairo%2C%20Egypt!5e0!3m2!1sen!2seg!4v1680000000000!5m2!1sen!2seg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center px-4 md:px-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl px-8 py-10 w-full max-w-md flex flex-col gap-6 border-t-4 border-blue-500">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center tracking-tight drop-shadow">Contact Us</h1>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="rounded-lg border border-blue-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg placeholder-gray-400 bg-gray-50"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="rounded-lg border border-blue-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg placeholder-gray-400 bg-gray-50"
              required
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={5}
              className="rounded-lg border border-blue-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg resize-none placeholder-gray-400 bg-gray-50"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg transition-colors text-lg mt-2"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact; 