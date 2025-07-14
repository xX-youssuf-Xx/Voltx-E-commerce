import React, { useEffect, useState } from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { FaFacebook, FaWhatsapp, FaTelegram, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useCartWishlist } from '../contexts/CartWishlistContext';


const DescriptionRenderer = ({ description }: { description: any }) => {
  const renderContent = (content: any[]) => {
    if (!content || !Array.isArray(content)) return null;

    return content.map((item, index) => {
      switch (item.type) {
        case 'paragraph':
          if (!item.content || item.content.length === 0) {
            return <br key={index} />;
          }
          return (
            <p key={index} className="mb-4">
              {item.content.map((textItem: any, textIndex: number) => renderText(textItem, textIndex))}
            </p>
          );
        
        case 'heading':
          const HeadingTag = `h${item.attrs.level}`;
          const headingClasses: { [key: number]: string } = {
            1: 'text-2xl font-bold text-gray-900',
            2: 'text-xl font-semibold text-gray-800',
            3: 'text-lg font-semibold text-gray-700',
            4: 'text-base font-semibold text-gray-600',
            5: 'text-base font-semibold text-gray-500',
            6: 'text-base font-semibold text-gray-400',
          }; 
          return React.createElement(
            HeadingTag,
            { key: index, className: headingClasses[item.attrs.level as number] },
            item.content?.map((textItem: any, textIndex: number) => renderText(textItem, textIndex))
          );
        
        case 'bulletList':
          return (
            <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
              {item.content.map((listItem: any, listIndex: number) => (
                <li key={listIndex}>
                  {renderContent(listItem.content)}
                </li>
              ))}
            </ul>
          );
        
        case 'orderedList':
          return (
            <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">
              {item.content.map((listItem: any, listIndex: number) => (
                <li key={listIndex}>
                  {renderContent(listItem.content)}
                </li>
              ))}
            </ol>
          );
        
        case 'horizontalRule':
          return <hr key={index} className="my-6 border-gray-300" />;
        
        case 'table':
          return (
            <div key={index} className="w-full flex justify-center mb-4">
              <table className="w-4/5 max-w-4xl mx-auto border border-gray-200 divide-y divide-gray-200 bg-white text-center">
                <tbody>
                  {item.content.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.content.map((cell: any, cellIndex: number) => {
                        const CellTag = cell.type === 'tableHeader' ? 'th' : 'td';
                        const cellClasses = cell.type === 'tableHeader' 
                          ? 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50'
                          : 'px-6 py-4 text-sm text-gray-900 align-top';
                        return (
                          <CellTag key={cellIndex} className={cellClasses} style={{ minHeight: '2.5rem' }}>
                            {renderContent(cell.content)}
                          </CellTag>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        
        case 'youtube':
          // Centered responsive YouTube embed
          return (
            <div key={index} className="flex justify-center my-8">
              <div style={{ width: '80%', maxWidth: 640 }}>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={item.attrs.src.replace('watch?v=', 'embed/')}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          );
        
        default:
          return null;
      }
    });
  };

  const renderText = (textItem: any, index: number) => {
    if (!textItem.text) return null;
    
    let element = textItem.text;
    
    if (textItem.marks) {
      textItem.marks.forEach((mark: any) => {
        switch (mark.type) {
          case 'bold':
            element = <strong key={index}>{element}</strong>;
            break;
          case 'italic':
            element = <em key={index}>{element}</em>;
            break;
          case 'underline':
            element = <u key={index}>{element}</u>;
            break;
          case 'link':
            element = (
              <a
                key={index}
                href={mark.attrs.href}
                target={mark.attrs.target || '_blank'}
                rel={mark.attrs.rel || 'noopener noreferrer'}
                className="text-blue-600 underline hover:text-blue-800"
              >
                {element}
              </a>
            );
            break;
          default:
            break;
        }
      });
    }
    
    return element;
  };

  return (
    <div className="prose max-w-none text-black">
      {renderContent(description.content)}
    </div>
  );
};

// Related Products Section (reuse homepage carousel/grid logic)
const RelatedProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 5 : 2;
  useEffect(() => {
    const fetchHomepage = async () => {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api';
      const res = await fetch(`${API_BASE}/homepage`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.best_sellers || []);
      }
    };
    fetchHomepage();
  }, []);
  if (!products.length) return null;
  const totalSlides = Math.ceil(products.length / itemsPerSlide);
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
      {/* Desktop: Carousel */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ width: `${totalSlides * 100}%`, transform: `translateX(-${(currentIndex / totalSlides) * 100}%)` }}>
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} style={{ width: `${100 / totalSlides}%` }} className="flex-shrink-0">
              <div className="grid grid-cols-5 gap-4">
                {products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((product: any) => (
                  <RelatedProductCard key={product.product_id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Carousel navigation */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-2 h-2 rounded-full transition-colors duration-300 ${idx === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`} />
            ))}
          </div>
        )}
      </div>
      {/* Mobile: Grid */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-3">
          {products.map((product: any) => (
            <RelatedProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const RelatedProductCard = ({ product }: { product: any }) => {
  const { cart, wishlist, addToCart, addToWishlist } = useCartWishlist();
  const isInWishlist = wishlist.includes(product.product_id);
  const cartItem = cart.find((item) => item.productId === product.product_id);
  const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3005';
  const handleCardClick = () => {
    window.location.href = `/product/${product.slug}`;
  };
  return (
    <div className="relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:scale-105 hover:-translate-y-1 cursor-pointer" onClick={handleCardClick}>
      {/* Badge */}
      {product.status === 'on_sale' && (
        <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded uppercase z-10 bg-green-500 text-white">In Stock</span>
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
        <Heart className={`w-4 h-4 ${isInWishlist ? 'text-blue-500' : 'text-blue-400'} transition-colors`} fill={isInWishlist ? '#3B82F6' : 'none'} />
      </button>
      <div className="w-full aspect-[4/3] bg-gray-50 p-1 md:p-2">
        <img
          src={product.primary_media ? `${MEDIA_BASE}${product.primary_media}` : ''}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-2 md:p-3 lg:p-4 border-t border-gray-100">
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
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
            <svg className="w-4 h-4" fill={cartItem ? 'currentColor' : 'none'} viewBox="0 0 24 24"><path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zM7.334 16h9.332c.822 0 1.542-.502 1.847-1.267l3.326-7.661A1 1 0 0 0 21 6H5.21l-.94-2.342A1 1 0 0 0 3.333 3H1a1 1 0 1 0 0 2h1.333l3.6 8.982A2.992 2.992 0 0 0 7.334 16zM6.16 8h13.534l-2.667 6.142A1 1 0 0 1 16.134 15H7.334a1 1 0 0 1-.947-.684L6.16 8z"/></svg>
            {cartItem && <span className="ml-1 text-xs font-bold">{cartItem.quantity}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Product Page Component
const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { get } = useApi();
  const { cart, wishlist, addToCart, addToWishlist, updateCartQuantity } = useCartWishlist();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    get(`/products/slug/${slug}`)
      .then(async (res: Response) => {
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data);
        setSelectedImage(0);
        // Fetch documents after product is loaded
        if (data.product_id) {
          get(`/products/${data.product_id}/docs`).then(async (docRes: Response) => {
            if (docRes.ok) {
              const docs = await docRes.json();
              setDocuments(Array.isArray(docs) ? docs : []);
            } else {
              setDocuments([]);
            }
          }).catch(() => setDocuments([]));
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading product...</p>
      </div>
    </div>
  );
  
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <a href="/shop" className="text-blue-600 hover:text-blue-800 underline">Back to Shop</a>
      </div>
    </div>
  );

  // Breadcrumbs logic
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(product.parent_category_name ? [
      { label: product.parent_category_name, href: '#' }
    ] : []),
    { label: product.category_name, href: '#' },
    { label: product.name, href: null }
  ];

  // Cart/Wishlist logic
  const isWishlisted = wishlist.includes(product.product_id);
  const cartItem = cart.find((item) => item.productId === product.product_id);

  const handleAddToCart = () => {
    if (cartItem) {
      updateCartQuantity(product.product_id, cartItem.quantity + quantity);
    } else {
      for (let i = 0; i < quantity; i++) addToCart(product.product_id);
    }
  };

  const handleWishlist = () => {
    addToWishlist(product.product_id);
  };

  // Social share handlers
  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(`Check out this product: ${product?.name}`);
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const whatsappShare = `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
  const linkedinShare = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${shareText}`;
  const instagramShare = `https://www.instagram.com/`;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <NavBar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500" role="list">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight size={16} />}
                    {crumb.href ? (
                      <a className="hover:text-gray-700" href={crumb.href}>{crumb.label}</a>
                    ) : (
                      <span className="font-medium text-gray-900">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </ol>
            </nav>
          </div>

          {/* Main layout: gallery left, details right (desktop); stacked (mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Gallery */}
            <div className="flex flex-col items-center">
              <div className="w-[70%] mx-auto aspect-square overflow-hidden rounded-xl flex items-center justify-center bg-white shadow-sm">
                {product.media[selectedImage]?.image_url && product.media[selectedImage].image_url.endsWith('.mp4') ? (
                  <video
                    controls
                    className="h-full w-full object-contain object-center rounded-xl"
                    src={`${import.meta.env.VITE_API_MEDIA_URL}${product.media[selectedImage].image_url}`}
                  />
                ) : (
                  <img 
                    alt={`${product.name} main image`} 
                    className="h-full w-full object-contain object-center"
                    src={product.media[selectedImage]?.image_url ? `${import.meta.env.VITE_API_MEDIA_URL}${product.media[selectedImage]?.image_url}` : ''} 
                  />
                )}
                </div>
              <div className="flex flex-row justify-center gap-2 mt-6 flex-wrap"> {/* Increased mt-6 for more space */}
                  {product.media.map((media: any, index: number) => (
                    <div 
                      key={media.media_id}
                      className={`h-14 w-14 cursor-pointer overflow-hidden rounded-lg border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'opacity-70 hover:opacity-100 border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                    {media.image_url.endsWith('.mp4') ? (
                      <video
                        className="h-full w-full object-cover object-center"
                        src={`${import.meta.env.VITE_API_MEDIA_URL}${media.image_url}`}
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img  
                        alt={`${product.name} thumbnail ${index + 1}`} 
                        className="h-full w-full object-cover object-center" 
                        src={media.image_url ? `${import.meta.env.VITE_API_MEDIA_URL}${media.image_url}` : ''} 
                      />
                    )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between h-full min-h-[24rem]">
              <div className="flex flex-col h-full justify-between">
                {/* Title, Badge, SKU, Category in one block */}
                <div className="mt-6 mb-1 flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-0">{product.name}</h1>
                  {product.status === 'on_sale' && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 w-fit">
                      In Stock
                    </span>
                  )}
                </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>SKU: {product.sku}</span>
                  <span>•</span>
                  <span>Category: {product.category_name}</span>
                  </div>
                </div>
                {/* Short Description with more space above */}
                {product.short_description && (
                  <p className="text-base text-gray-500 mb-2 mt-6">{product.short_description}</p>
                )}
                {/* Price with discount logic */}
                <div className="flex items-center gap-4 mb-4">
                  {product.is_offer && product.offer_price ? (
                    <>
                      <span className="text-lg text-gray-500 line-through">{product.sell_price} EGP</span>
                      <span className="text-3xl font-bold text-red-600">{product.offer_price} EGP</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{product.sell_price} EGP</span>
                )}
              </div>
                {/* Quantity and Add to Cart/Buy Now - Responsive row, small buttons, no overflow */}
                <div className="flex flex-col gap-2 mb-4 w-full">
                  <div className="flex items-center gap-2 w-full">
                    <button
                      className="w-8 h-8 rounded-full bg-blue-600 text-white text-base font-bold flex items-center justify-center hover:bg-blue-700"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >-</button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-12 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black text-base"
                      style={{ minWidth: 0 }}
                    />
                    <button
                      className="w-8 h-8 rounded-full bg-blue-600 text-white text-base font-bold flex items-center justify-center hover:bg-blue-700"
                      onClick={() => setQuantity(q => q + 1)}
                    >+</button>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2 w-full mt-1">
                <button 
                  onClick={handleAddToCart}
                      className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors min-w-0"
                      style={{ flex: '1 1 0', maxWidth: '100%' }}
                >
                  Add to Cart
                </button>
                <button 
                      className="rounded-full bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 transition-colors min-w-0"
                      style={{ flex: '1 1 0', maxWidth: '100%' }}
                >
                  Buy Now
                </button>
                <button 
                      onClick={handleWishlist}
                      className={`rounded-full p-2 transition-colors min-w-0 ${
                        isWishlisted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Add to wishlist"
                      style={{ flex: '0 0 auto' }}
                >
                      <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
                </div>
                {/* Social share - icons only, row, squircles, smaller, no twitter */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <a href={facebookShare} target="_blank" rel="noopener noreferrer" className="border-2 border-blue-600 rounded-xl p-1.5 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center">
                    <FaFacebook size={22} />
                  </a>
                  <a href={whatsappShare} target="_blank" rel="noopener noreferrer" className="border-2 border-green-600 rounded-xl p-1.5 text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center">
                    <FaWhatsapp size={22} />
                  </a>
                  <a href={telegramShare} target="_blank" rel="noopener noreferrer" className="border-2 border-blue-500 rounded-xl p-1.5 text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
                    <FaTelegram size={22} />
                  </a>
                  <a href={linkedinShare} target="_blank" rel="noopener noreferrer" className="border-2 border-blue-700 rounded-xl p-1.5 text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center">
                    <FaLinkedin size={22} />
                  </a>
                  <a href={instagramShare} target="_blank" rel="noopener noreferrer" className="border-2 border-pink-500 rounded-xl p-1.5 text-pink-500 hover:bg-pink-50 transition-colors flex items-center justify-center">
                    <FaInstagram size={22} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Long Description - full width below gallery/details */}
          <div className="mt-12 w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-gray mt-4 max-w-none space-y-4 text-black">
              {product.long_description && <DescriptionRenderer description={product.long_description} />}
            </div>
          </div>

          {/* Documents Section */}
          {documents.length > 0 && (
            <div className="mt-12 w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc, idx) => {
                  // Helper to truncate file name but always show extension
                  const getTruncatedName = (name = '', max = 28) => {
                    if (!name) return `Document ${idx + 1}`;
                    const lastDot = name.lastIndexOf('.');
                    if (lastDot === -1 || name.length <= max) return name;
                    const ext = name.slice(lastDot);
                    const base = name.slice(0, lastDot);
                    const keep = max - ext.length - 3; // 3 for '...'
                    if (keep <= 0) return `...${ext}`;
                    return `${base.slice(0, keep)}...${ext}`;
                  };
                  // Helper to format file size (now expects bytes)
                  const getSize = (size: any) => {
                    size = Number(size);
                    if (!size || isNaN(size)) return '';
                    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
                    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                    return `${(size / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
                  };
                  const fileName = doc.file_name;
                  const fileSize = getSize((doc.file_size_kb || 0) * 1024); // convert KB to bytes
                  return (
                    <div key={doc.document_id || idx} className="flex flex-wrap items-center justify-between bg-white rounded-lg shadow p-4 border border-gray-100 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-[240px] md:max-w-[320px]" title={fileName}>
                          {getTruncatedName(fileName)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 truncate max-w-[180px] sm:max-w-[240px] md:max-w-[320px]">
                          {doc.type && <span>{doc.type}</span>}
                          {fileSize && <span className="ml-2">{fileSize}</span>}
                        </div>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs flex-shrink-0"
                        download
                      >
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Products Section (carousel/grid) */}
          <RelatedProductsSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductPage;