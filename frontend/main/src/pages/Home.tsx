import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';

// Types for product and banner
interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
}
interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

const Home = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const [currentBestSellersIndex, setCurrentBestSellersIndex] = useState<number>(0);
  const [currentNewArrivalsIndex, setCurrentNewArrivalsIndex] = useState<number>(0);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

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

  // Dummy data for products
  const bestSellers: Product[] = [
    {
      id: 1,
      title: "Arduino Uno R3",
      price: 25.00,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOEZ6CzeGDeMUvehtZO7cIV9NMXsj3rHoJeUDX_boh7h9Ehglm_iUPEJel-_Z0F_j_b6Dilr3UZyCv_-Fj-J8I1VwbPuwkMUiiAXt6zATVWtGmjlOrBAHXOTWomUK-S511i47evN918K8ArDdEcWfaowoaSvJAb_UC1DD5oFdUshIsmWxOtYc6tReKZtSTAjh6CAvV0eITBM77lEo-mrUHUx6duZo-ON18JGJ-tAR0B7Tg8BV9O4jDdK6zd37jxNfbj0rEW0ftGfLt",
      badge: "New"
    },
    {
      id: 2,
      title: "Raspberry Pi 4 Model B",
      price: 75.00,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5fT7Pi3G2tmcqUL_OK-KzWwbe0QJIeM67gQn4F5Avddvhs0pZGSPAz8Fs-iWjphRiRQ61lD72TOM7GNcchPgsPJwRJKkhhD0Z-EH9sI2lW3T7yAGd4vfHBmlWosLv3YflVyJDzldMdscE6dkeAzTxIE3Osp_nY3Trxj_8Un3Je-7PNlt9mCOgvssjIiJkGiILzQtNyIt73A0G1xwqqvHhcILeNW4NrOgBwJG0TpRLCTxQesxnew4okVqwrDx2R8TC2qV0km-3hXzR",
      badge: null
    },
    {
      id: 3,
      title: "ESP32 Development Kit",
      price: 15.00,
      originalPrice: 20.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlWR9czUusrVPTblZnMLtq4vtKZuwD6oUjIMU0tv-LnkVfkrBNvNta7ogC_pCfR6gM7xbP6THs_YDdM7bU0nrlV3S2gvx0Vflu2sRGopCESLRQUZSUlIXrpoe6ip_bHSVST-VLVAtt3E92m54PVHZn7MkBEtEDY_PN3jOiMBX-0q5MtAAXoItEE9Qwdq5L6ltUTgUtwe4-MWNVZrIRZfQO_XeDTLn0aodvPldUyvVYvOJXouG-lX8ykBxrpdoucRs6Zr5Jf5CQKnFU",
      badge: "Sale"
    },
    {
      id: 4,
      title: "ESP32 WROOM-32",
      price: 12.50,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBc66O7cxeGCSSBEn0gyq08DHs0sdiv_QTgwkXq8Dpb-zQkN7pygfRz9XY69al1dtBOZpT7WRf7ws3m2UZihB1qeeQvcbY2tSrklVDz9Awgeek6l9Li_3u2hy84NBT5kb6-pAbXHZtKTBiay7RHQBZ5Dqr9dWQmWMNQqnVhHJnhAunAvZuXfUtVWj3-siv99McOX2xIJr20SlaiFodX57WAIjHHgZot8RNSP2bEUBwOtjUrwryG7bltbNmStqjK__aju0cZcZXGOe2N",
      badge: "Out of Stock"
    },
    {
      id: 5,
      title: "NodeMCU ESP8266",
      price: 8.99,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlWR9czUusrVPTblZnMLtq4vtKZuwD6oUjIMU0tv-LnkVfkrBNvNta7ogC_pCfR6gM7xbP6THs_YDdM7bU0nrlV3S2gvx0Vflu2sRGopCESLRQUZSUlIXrpoe6ip_bHSVST-VLVAtt3E92m54PVHZn7MkBEtEDY_PN3jOiMBX-0q5MtAAXoItEE9Qwdq5L6ltUTgUtwe4-MWNVZrIRZfQO_XeDTLn0aodvPldUyvVYvOJXouG-lX8ykBxrpdoucRs6Zr5Jf5CQKnFU",
      badge: "Popular"
    }
  ];

  const newArrivals: Product[] = [
    {
      id: 6,
      title: "37-in-1 Sensor Kit",
      price: 40.00,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARGyYW0dZLTZ9Y7UR5QlDpAH_PI1GZOoWlP96ugBfr9xsT3G-UavOKTo2ulTXHtj03V2iCggqXC7iECGzd5MYV19vJMfaCxiOY4Kmc9HQX2STEELsbhix4od7ZgUQp0ScwZcjPl6vCEljuQD4dMMV8Yor2dl0jP0f0fBw_v2DXWAly04o9zoXk_32ljdOydjVKnXIZ5_s2R6KvvfoYhcitlwOiw41X3EiTnijgcT3q9756Z0uUw47H_X3-FI4R7wkl_qSL8NZ9Wwup",
      badge: "New"
    },
    {
      id: 7,
      title: "Advanced Robotics Kit",
      price: 120.00,
      originalPrice: 150.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASGL3awyfF12ZUVS0LYksqYrXzfikcpyi6NLr3QW9yyU9kkRc1nlkJwO7klPWjTpN73PNDAGiv_k1jtg7Ogp2dX_8bxet0qZseitfOJ5gFImiEVlaIwsiw9w5wiRUT1x_NZnh2m94DLGYzFDRSLN6LFAgxJLMc4BBjsvGjFnQrtH8sK62kZ_MThLlgsC3LmDxyqEVxbX7lJjpyBSkU9di3VV2VmBZ5X0GNAQaiqM1ATjRt3eWDazuIE5ve-SEUv8LTzstwMEVLivML",
      badge: "New"
    },
    {
      id: 8,
      title: "IoT Starter Pack",
      price: 65.00,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlWR9czUusrVPTblZnMLtq4vtKZuwD6oUjIMU0tv-LnkVfkrBNvNta7ogC_pCfR6gM7xbP6THs_YDdM7bU0nrlV3S2gvx0Vflu2sRGopCESLRQUZSUlIXrpoe6ip_bHSVST-VLVAtt3E92m54PVHZn7MkBEtEDY_PN3jOiMBX-0q5MtAAXoItEE9Qwdq5L6ltUTgUtwe4-MWNVZrIRZfQO_XeDTLn0aodvPldUyvVYvOJXouG-lX8ykBxrpdoucRs6Zr5Jf5CQKnFU",
      badge: "New"
    },
    {
      id: 9,
      title: "Digital Multimeter",
      price: 28.50,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARGyYW0dZLTZ9Y7UR5QlDpAH_PI1GZOoWlP96ugBfr9xsT3G-UavOKTo2ulTXHtj03V2iCggqXC7iECGzd5MYV19vJMfaCxiOY4Kmc9HQX2STEELsbhix4od7ZgUQp0ScwZcjPl6vCEljuQD4dMMV8Yor2dl0jP0f0fBw_v2DXWAly04o9zoXk_32ljdOydjVKnXIZ5_s2R6KvvfoYhcitlwOiw41X3EiTnijgcT3q9756Z0uUw47H_X3-FI4R7wkl_qSL8NZ9Wwup",
      badge: "New"
    }
  ];

  const featuredProducts: Product[] = [
    {
      id: 10,
      title: "L298N Motor Driver",
      price: 8.50,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_s4Pv2siCBJEmlRmZAI7gpWk54Eb4iyPb6V9f76KCD6I1fYSSV4-0SsTkq6zxqZU4byVFHiHe3gPe1pD8EDl1QHp1aes4OIB0sZnipXgbPG5Byb7hcL7H9wC04Ys9kdzqSxfESTP_--HnqQP6q_HpkyrLmvHOwJA7hiYXzj_nIJYRc-Q5SFdwAtpEClxDmfbFYD6lJgSUVjSdAHxivd02mGigyy0e1uRLEMZUO0XX1pE7e_ymcQUWF-riEescaEyIrD8DBA7C6VHO",
      badge: "Featured"
    },
    {
      id: 11,
      title: "Servo Motor SG90",
      price: 5.99,
      originalPrice: 7.99,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_s4Pv2siCBJEmlRmZAI7gpWk54Eb4iyPb6V9f76KCD6I1fYSSV4-0SsTkq6zxqZU4byVFHiHe3gPe1pD8EDl1QHp1aes4OIB0sZnipXgbPG5Byb7hcL7H9wC04Ys9kdzqSxfESTP_--HnqQP6q_HpkyrLmvHOwJA7hiYXzj_nIJYRc-Q5SFdwAtpEClxDmfbFYD6lJgSUVjSdAHxivd02mGigyy0e1uRLEMZUO0XX1pE7e_ymcQUWF-riEescaEyIrD8DBA7C6VHO",
      badge: "Sale"
    },
    {
      id: 12,
      title: "Breadboard 830 Points",
      price: 4.25,
      originalPrice: null,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARGyYW0dZLTZ9Y7UR5QlDpAH_PI1GZOoWlP96ugBfr9xsT3G-UavOKTo2ulTXHtj03V2iCggqXC7iECGzd5MYV19vJMfaCxiOY4Kmc9HQX2STEELsbhix4od7ZgUQp0ScwZcjPl6vCEljuQD4dMMV8Yor2dl0jP0f0fBw_v2DXWAly04o9zoXk_32ljdOydjVKnXIZ5_s2R6KvvfoYhcitlwOiw41X3EiTnijgcT3q9756Z0uUw47H_X3-FI4R7wkl_qSL8NZ9Wwup",
      badge: "Essential"
    }
  ];
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Set<number>>(new Set());

  const getItemsPerSlide = (): number => {
    // Ensure window is defined (for server-side rendering)
    if (typeof window === 'undefined') {
      return 4;
    }
    if (window.innerWidth >= 1024) return 4; // lg
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


  // Auto-scroll effects
  useEffect(() => {
    if (banners.length === 0) return;

    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev: number) => (prev + 1) % banners.length);
    }, 5000);

    const bestSellersInterval = setInterval(() => {
      if (bestSellers.length > 0) {
        setCurrentBestSellersIndex((prev: number) => (prev + 1) % Math.ceil(bestSellers.length / itemsPerSlide));
      }
    }, 3000);

    const newArrivalsInterval = setInterval(() => {
      if (newArrivals.length > 0) {
        setCurrentNewArrivalsIndex((prev: number) => (prev + 1) % Math.ceil(newArrivals.length / itemsPerSlide));
      }
    }, 3000);

    const featuredInterval = setInterval(() => {
      if (featuredProducts.length > 0) {
        setCurrentFeaturedIndex((prev: number) => (prev + 1) % Math.ceil(featuredProducts.length / itemsPerSlide));
      }
    }, 3000);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(bestSellersInterval);
      clearInterval(newArrivalsInterval);
      clearInterval(featuredInterval);
    };
  }, [banners.length, bestSellers.length, newArrivals.length, featuredProducts.length, itemsPerSlide]);


  const toggleFavorite = (id: number) => {
    setFavorites((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleCart = (id: number) => {
    setCart((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getBadgeClasses = (badge: string | null): string => {
    switch (badge) {
      case 'New':
        return 'bg-green-500 text-white';
      case 'Sale':
        return 'bg-orange-500 text-white';
      case 'Out of Stock':
        return 'bg-gray-500 text-white';
      case 'Popular':
        return 'bg-purple-500 text-white';
      case 'Featured':
        return 'bg-blue-500 text-white';
      case 'Essential':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // ProductCard hover grace period
  const hoverTimeouts = useRef<{ [key: number]: number }>({});
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleCardMouseEnter = (id: number) => {
    if (hoverTimeouts.current[id]) {
      clearTimeout(hoverTimeouts.current[id]);
      delete hoverTimeouts.current[id];
    }
    setHoveredCard(id);
  };
  const handleCardMouseLeave = (id: number) => {
    hoverTimeouts.current[id] = window.setTimeout(() => {
      setHoveredCard((current) => (current === id ? null : current));
      delete hoverTimeouts.current[id];
    }, 200);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const isInFavorites = favorites.has(product.id);
    const isInCart = cart.has(product.id);
    const isHovered = hoveredCard === product.id;
    return (
      <div
        className={`relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:scale-105 hover:-translate-y-1 ${isHovered ? 'shadow-xl scale-105 -translate-y-1' : ''}`}
        onMouseEnter={() => handleCardMouseEnter(product.id)}
        onMouseLeave={() => handleCardMouseLeave(product.id)}
      >
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded uppercase z-10 ${getBadgeClasses(product.badge)}`}>
            {product.badge}
          </span>
        )}
        {/* Heart Button */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart
            className={`w-4 h-4 ${isInFavorites ? 'text-blue-500' : 'text-blue-400'} transition-colors`}
            fill={isInFavorites ? '#3B82F6' : 'none'}
          />
        </button>
        <a href="#" className="block">
          <div className="w-full aspect-[4/3] bg-gray-50 p-2 md:p-3 lg:p-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-2 md:p-3 lg:p-4">
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
              {product.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-bold text-blue-500">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  toggleCart(product.id);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${isInCart ? 'bg-blue-500 text-white' : 'bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-400'}`}
              >
                <ShoppingCart
                  className="w-4 h-4"
                  fill={isInCart ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>
        </a>
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
    if (products.length === 0) return null;

    const totalSlides = Math.ceil(products.length / itemsPerSlide);
    //const maxIndex = Math.max(0, totalSlides - 1);

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
          <div className="flex gap-2">
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
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
                width: `${totalSlides * 100}%`,
                // ✅ CORRECTED THIS LINE
                transform: `translateX(-${(currentIndex / totalSlides) * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex: number) => (
              <div key={slideIndex} style={{ width: `${100 / totalSlides}%` }} className="flex-shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
                  {products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Product Carousel Navigation Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
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
            products={bestSellers}
            currentIndex={currentBestSellersIndex}
            setCurrentIndex={setCurrentBestSellersIndex}
            title="Best Sellers"
          />
          <ProductCarousel
            products={newArrivals}
            currentIndex={currentNewArrivalsIndex}
            setCurrentIndex={setCurrentNewArrivalsIndex}
            title="New Arrivals"
          />
          <ProductCarousel
            products={featuredProducts}
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