import React, { useEffect, useState } from 'react';
import { Heart, ChevronRight, Download, FileText, Code } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';


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
            <div key={index} className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <tbody className="divide-y divide-gray-200 bg-white">
                  {item.content.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.content.map((cell: any, cellIndex: number) => {
                        const CellTag = cell.type === 'tableHeader' ? 'th' : 'td';
                        const cellClasses = cell.type === 'tableHeader' 
                          ? 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50'
                          : 'px-6 py-4 text-sm text-gray-900';
                        return (
                          <CellTag key={cellIndex} className={cellClasses}>
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

// Main Product Page Component
const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { get } = useApi();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    get(`/products/slug/${slug}`)
      .then(async (res: Response) => {
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data);
        setSelectedImage(0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Loading...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Product not found.</div>;

  const handleAddToCart = () => {
    alert('Added to cart!');
  };

  const handleBuyNow = () => {
    alert('Buy now clicked!');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif' }}>
      <NavBar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500" role="list">
                <li><a className="hover:text-gray-700" href="#">Home</a></li>
                <li><ChevronRight size={16} /></li>
                <li><a className="hover:text-gray-700" href="#">{product.parent_category_name}</a></li>
                <li><ChevronRight size={16} /></li>
                <li><a className="hover:text-gray-700" href="#">{product.category_name}</a></li>
                <li><ChevronRight size={16} /></li>
                <li><span className="font-medium text-gray-900">{product.name}</span></li>
              </ol>
            </nav>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Product Images */}
            <div>
              <div className="grid grid-cols-1 gap-4">
                <div className="aspect-square w-full overflow-hidden rounded-xl">
                  <img 
                    alt={`${product.name} main image`} 
                    className="h-full w-full object-cover object-center" 
                    src={product.media[selectedImage]?.image_url ? `${import.meta.env.VITE_API_MEDIA_URL}${product.media[selectedImage]?.image_url}` : ''} 
                  />
                </div>
                <div className="flex flex-row justify-center gap-2 mt-2">
                  {product.media.map((media: any, index: number) => (
                    <div 
                      key={media.media_id}
                      className={`h-14 w-14 cursor-pointer overflow-hidden rounded-lg border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'opacity-70 hover:opacity-100 border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img  
                        alt={`${product.name} thumbnail ${index + 1}`} 
                        className="h-full w-full object-cover object-center" 
                        src={media.image_url ? `${import.meta.env.VITE_API_MEDIA_URL}${media.image_url}` : ''} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <div className="mb-2 flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{product.name}</h1>
                  {product.status === 'on_sale' && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      In Stock
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>SKU: {product.sku}</span>
                  <span>•</span>
                  <span>Category: {product.category_name}</span>
                </div>
                {product.short_description && (
                  <p className="text-base text-gray-500 mb-2">{product.short_description}</p>
                )}
              </div>

              <div>
                <p className="text-3xl font-bold text-gray-900">${product.sell_price}</p>
                {product.is_offer && product.offer_price && (
                  <p className="text-lg text-gray-500 line-through">${product.sell_price}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 rounded-full bg-gray-200 px-8 py-3 text-base font-semibold text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Buy Now
                </button>
                <button 
                  onClick={toggleWishlist}
                  className={`rounded-full p-3 transition-colors ${
                    isWishlisted 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">Description</h2>
                <div className="prose prose-gray mt-4 max-w-none space-y-4 text-black">
                  {product.long_description && <DescriptionRenderer description={product.long_description} />}
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
                <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
                  <a className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors" href="#">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                      <FileText className="text-gray-500 group-hover:text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Product Datasheet</p>
                      <p className="text-sm text-gray-500">PDF</p>
                    </div>
                    <Download className="text-gray-400 group-hover:text-gray-600" size={20} />
                  </a>
                  <a className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors" href="#">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                      <FileText className="text-gray-500 group-hover:text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">User Manual</p>
                      <p className="text-sm text-gray-500">PDF</p>
                    </div>
                    <Download className="text-gray-400 group-hover:text-gray-600" size={20} />
                  </a>
                  <a className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors" href="#">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                      <Code className="text-gray-500 group-hover:text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Example Code</p>
                      <p className="text-sm text-gray-500">ZIP</p>
                    </div>
                    <Download className="text-gray-400 group-hover:text-gray-600" size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductPage;