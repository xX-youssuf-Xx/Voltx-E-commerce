import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { useCartWishlist } from '../contexts/CartWishlistContext';

// Types for product and banner
interface Product {
  id: number;
  product_id: string; // Changed from number to string since API returns string
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  sell_price: string; // Changed from number to string since API returns string
  offer_price?: string | null; // Changed from number to string since API returns string
  is_offer: boolean;
  status: string;
  is_custom_status?: boolean;
  custom_status?: string | null;
  custom_status_color?: string | null;
  brand_name?: string;
  category_name?: string;
  primary_media?: string;
  badge?: string;
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

interface HomepageData {
  best_sellers: Product[];
  new_arrivals: Product[];
  featured_products: Product[];
}

const Home = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const [currentBestSellersIndex, setCurrentBestSellersIndex] = useState<number>(0);
  const [currentNewArrivalsIndex, setCurrentNewArrivalsIndex] = useState<number>(0);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [homepageData, setHomepageData] = useState<HomepageData>({
    best_sellers: [],
    new_arrivals: [],
    featured_products: []
  });
  const [loading, setLoading] = useState(true);

  // Dummy data for banners
  const banners: Banner[] = [
    {
      id: 1,
      title: "Discover the New Raspberry Pi 5!",
      subtitle: "Faster, more powerful, and ready for your projects.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDizvBfnZgkMpN1bGJ1QGNHOeDhQl-KhkBF7WRVhswIlmHuzQsKspcD_a2fj3oXO5HRmcGa7epyOFVznLArl4n0vJAvkte_RkZbaP1gihYl-3RU3OtW9rAmWcNGthsC9CMhivu1T_YeImYwwdDoMacxC4M7nDsoXh6ijaV1e0eqzBHriT88pvLpfJgZBI7sSpfJcsrYvYrTSacu8amdJPUWKEtmUOVDvzAEqupgqVeCSwIRg5CEcYhaTPFQa_9QcMSuomsDeAnhdCyi",
      cta: "Shop Now"
    },
    {
      id: 2,
      title: "Arduino Project Kits on Sale!",
      subtitle: "Everything you need to start building today.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUOw45-DZ15spJasV-TsxoeHymvC6UE8ERN8kBbHdB3GEvd0tbN5kNowUaBthI6__itOJ5ThbW6bS0JnICN73zrT5lA70rlAMe1251AV9mT5rFu3XDDcm68X8zMZMlxcjDbu-wbaM2XAumIZ6AAKa56Nf4la01uj-t0JaKJPJdEd7fqqzb8CIrcXsFqTm7A3kCID-jSzOfqyYfUlxXI_tKWTnoA5eIz7noGpvxe00dA_cYsrdNV9_WyTtkl_E5asjeLWOzUaziKwIB",
      cta: "Explore Kits"
    },
    {
      id: 3,
      title: "IoT Development Made Easy!",
      subtitle: "Start your smart home projects with our ESP32 modules.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlWR9czUusrVPTblZnMLtq4vtKZuwD6oUjIMU0tv-LnkVfkrBNvNta7ogC_pCfR6gM7xbP6THs_YDdM7bU0nrlV3S2gvx0Vflu2sRGopCESLRQUZSUlIXrpoe6ip_bHSVST-VLVAtt3E92m54PVHZn7MkBEtEDY_PN3jOiMBX-0q5MtAAXoItEE9Qwdq5L6ltUTgUtwe4-MWNVZrIRZfQO_XeDTLn0aodvPldUyvVYvOJXouG-lX8ykBxrpdoucRs6Zr5Jf5CQKnFU",
      cta: "Get Started"
    }
  ];

  const { cart, wishlist, addToCart, addToWishlist } = useCartWishlist();

  // Load homepage data from API
  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api';
        const response = await fetch(`${API_BASE}/homepage`);
        if (response.ok) {
          const data = await response.json();
          setHomepageData(data);
        } else {
          console.error('Failed to load homepage data');
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageData();
  }, []);

  const getItemsPerSlide = (): number => {
    // Ensure window is defined (for server-side rendering)
    if (typeof window === 'undefined') {
      return 5;
    }
    if (window.innerWidth >= 1024) return 5; // lg - 5 products per row
    if (window.innerWidth >= 768) return 3;  // md
    if (window.innerWidth >= 640) return 2;  // sm
    return 2; // xs
  };
  
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll effects (only for desktop)
  useEffect(() => {
    if (banners.length === 0) return;

    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev: number) => (prev + 1) % banners.length);
    }, 5000);

    // Only auto-scroll on desktop (lg and above)
    if (window.innerWidth >= 1024) {
      const bestSellersInterval = setInterval(() => {
        if (homepageData.best_sellers.length > 0) {
          setCurrentBestSellersIndex((prev: number) => (prev + 1) % Math.ceil(homepageData.best_sellers.length / itemsPerSlide));
        }
      }, 3000);

      const newArrivalsInterval = setInterval(() => {
        if (homepageData.new_arrivals.length > 0) {
          setCurrentNewArrivalsIndex((prev: number) => (prev + 1) % Math.ceil(homepageData.new_arrivals.length / itemsPerSlide));
        }
      }, 3000);

      const featuredInterval = setInterval(() => {
        if (homepageData.featured_products.length > 0) {
          setCurrentFeaturedIndex((prev: number) => (prev + 1) % Math.ceil(homepageData.featured_products.length / itemsPerSlide));
        }
      }, 3000);

      return () => {
        clearInterval(bannerInterval);
        clearInterval(bestSellersInterval);
        clearInterval(newArrivalsInterval);
        clearInterval(featuredInterval);
      };
    }

    return () => {
      clearInterval(bannerInterval);
    };
  }, [banners.length, homepageData.best_sellers.length, homepageData.new_arrivals.length, homepageData.featured_products.length, itemsPerSlide]);

  const ProductCard = ({ product }: { product: Product }) => {
    if (!product || !product.product_id) {
      return null;
    }
    const isInWishlist = wishlist.includes(product.product_id);
    const cartItem = cart.find(item => item.productId === product.product_id);
    const isHovered = hoveredCard === product.product_id;
    const badgeText = getBadgeText(product);
    const badgeClasses = getBadgeClasses(product);
    const badgeStyle = getBadgeStyle(product);
    const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3005';
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    return (
      <div
        className={`relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:scale-105 hover:-translate-y-1 cursor-pointer ${isHovered ? 'shadow-xl scale-105 -translate-y-1' : ''}`}
        onMouseEnter={() => handleCardMouseEnter(product.product_id)}
        onMouseLeave={() => handleCardMouseLeave(product.product_id)}
        onClick={() => window.location.href = `/product/${product.slug}`}
      >
        {/* Badge */}
        {badgeText && (
          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded uppercase z-10 ${badgeClasses}`} style={badgeStyle}>
            {badgeText}
          </span>
        )}
        {/* Heart Button */}
        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            addToWishlist(product.product_id);
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 z-10"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 ${isInWishlist ? 'text-blue-500' : 'text-blue-400'} transition-colors`}
            fill={isInWishlist ? '#3B82F6' : 'none'}
          />
        </button>
        <div className="w-full aspect-[4/3] bg-gray-50 p-1 md:p-2">
          <img
            src={product.primary_media ? `${MEDIA_BASE}${product.primary_media}` : placeholderImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderImage;
            }}
          />
        </div>
        <div className="p-2 md:p-3 lg:p-4 border-t border-gray-100">
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {product.is_offer && product.offer_price && (
                <span className="text-xs text-gray-400 line-through">
                  <span className="text-black">{(Number(product.sell_price) || 0).toFixed(2)}</span>
                  <span className="text-gray-500 ml-1">EGP</span>
                </span>
              )}
              <span className="text-sm">
                <span className="text-black font-medium">
                  {(product.is_offer && product.offer_price 
                    ? (Number(product.offer_price) || 0).toFixed(2) 
                    : (Number(product.sell_price) || 0).toFixed(2)
                  )}
                </span>
                <span className="text-gray-500 ml-1">EGP</span>
              </span>
            </div>
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.product_id);
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${cartItem ? 'bg-blue-500 text-white' : 'bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-400'}`}
              aria-label="Add to cart"
            >
              <ShoppingCart
                className="w-4 h-4"
                fill={cartItem ? 'currentColor' : 'none'}
              />
              {cartItem && <span className="ml-1 text-xs font-bold">{cartItem.quantity}</span>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  interface ProductCarouselProps {
    products: Product[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    title: string;
  }

  const ProductCarousel = ({ products, currentIndex, setCurrentIndex, title }: ProductCarouselProps) => {
    if (!products || products.length === 0) {
      return null;
    }

    const totalSlides = Math.ceil(products.length / itemsPerSlide);

    const nextSlide = () => {
      setCurrentIndex((prev: number) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
      setCurrentIndex((prev: number) => (prev - 1 + totalSlides) % totalSlides);
    };

    return (
      <section className="mb-10 md:mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          {/* Only show navigation on desktop */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-black"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-black"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Desktop: Carousel */}
        <div className="hidden lg:block relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
                width: `${totalSlides * 100}%`,
                transform: `translateX(-${(currentIndex / totalSlides) * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex: number) => (
              <div key={slideIndex} style={{ width: `${100 / totalSlides}%` }} className="flex-shrink-0">
                <div className="grid grid-cols-5 gap-4">
                  {products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((product: Product) => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mobile: Grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-2 gap-3">
            {products.map((product: Product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </div>
        
        {/* Product Carousel Navigation Dots (desktop only) */}
        {totalSlides > 1 && (
          <div className="hidden lg:flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  // Banner swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // swipe left
          setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        } else {
          // swipe right
          setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
        }
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="bg-white">
        {/* Hero Banner Carousel */}
        {banners.length > 0 && (
          <section
            className="relative w-full h-64 md:h-96 overflow-hidden bg-gray-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}>
              {banners.map((banner: Banner) => (
                <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                      {banner.title}
                    </h2>
                    <p className="text-base md:text-lg text-gray-200 mb-4">
                      {banner.subtitle}
                    </p>
                    <button className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors">
                      {banner.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Banner Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_: Banner, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Product Sections */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-8 md:py-12">
          <ProductCarousel
            products={homepageData.best_sellers}
            currentIndex={currentBestSellersIndex}
            setCurrentIndex={setCurrentBestSellersIndex}
            title="Best Sellers"
          />
          <ProductCarousel
            products={homepageData.new_arrivals}
            currentIndex={currentNewArrivalsIndex}
            setCurrentIndex={setCurrentNewArrivalsIndex}
            title="New Arrivals"
          />
          <ProductCarousel
            products={homepageData.featured_products}
            currentIndex={currentFeaturedIndex}
            setCurrentIndex={setCurrentFeaturedIndex}
            title="Featured Products"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;