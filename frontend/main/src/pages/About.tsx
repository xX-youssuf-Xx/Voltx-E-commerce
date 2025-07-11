import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import logo from '/voltx.jpg';

const About = () => (
  <>
    <NavBar />
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 py-8">
      <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center max-w-2xl w-full border-t-4 border-blue-500">
        <img src={logo} alt="Voltx Logo" className="h-20 w-20 mb-6 rounded-xl shadow-md border border-blue-200" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-4 tracking-tight text-center drop-shadow">About Us</h1>
        <p className="text-lg md:text-xl text-gray-700 text-center font-medium leading-relaxed">
          <span className="text-blue-600 font-bold">Voltx Electronics</span> is your trusted partner for quality electronics, components, and custom solutions. We are passionate about empowering makers, students, and professionals with the best products and support. Our mission is to make innovation accessible, whether you’re building your first project or scaling up your business. <br className="hidden md:block" />
          <span className="block mt-4 text-blue-500 font-semibold">Join us on our journey to power the future—one project at a time.</span>
        </p>
      </div>
    </main>
    <Footer />
  </>
);

export default About; 