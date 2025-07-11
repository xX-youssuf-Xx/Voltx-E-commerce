import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import logo from '/voltx.jpg';

const Services = () => (
  <>
    <NavBar />
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center max-w-md w-full">
        <img src={logo} alt="Voltx Logo" className="h-20 w-20 mb-6 rounded-xl shadow-md border border-blue-200" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2 tracking-tight text-center drop-shadow">Services</h1>
        <p className="text-lg md:text-2xl text-gray-700 text-center font-medium">
          custom 3d printing <span className="text-blue-600 font-bold">and More</span> coming soon
        </p>
      </div>
    </main>
    <Footer />
  </>
);

export default Services; 