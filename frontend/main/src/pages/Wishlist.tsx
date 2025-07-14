import  { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useCartWishlist } from '../contexts/CartWishlistContext';
import { ShoppingCart, Trash2 } from 'lucide-react';

interface WishlistProduct {
  product_id: string;
  name: string;
  primary_media?: string;
  sell_price: string;
  offer_price?: string | null;
  is_offer: boolean;
  status: string;
  is_custom_status?: boolean;
  custom_status?: string | null;
  custom_status_color?: string | null;
  brand_name?: string;
  category_name?: string;
  badge?: string;
  short_description?: string;
  slug: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:3000';

const Wishlist = () => {
  const { wishlist, addToCart, removeFromWishlist } = useCartWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/products/by-ids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: wishlist }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          setError('Unexpected response from server.');
          setProducts([]);
        } else {
          setProducts(data);
        }
      })
      .catch((err) => {
        setError(`Failed to load wishlist products:  ${err}`);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <>
      <NavBar />
      <main className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-8 bg-[#f8f8f8] min-h-[60vh]">
        <div className="flex flex-col w-full max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-6 px-4 py-2">
            <ol className="flex items-center gap-2">
              <li>
                <a className="text-[#707070] hover:text-[#e92933] text-sm font-medium leading-normal transition-colors" href="/">Home</a>
              </li>
              <li><span className="text-[#707070] text-sm font-medium leading-normal">/</span></li>
              <li><span className="text-[#1a1a1a] text-sm font-medium leading-normal">Favorites</span></li>
            </ol>
          </nav>
          <div className="flex flex-wrap justify-between items-center gap-4 p-4 mb-6 border-b border-[#e5e5e5] pb-6">
            <h1 className="text-[#1a1a1a] text-3xl font-bold leading-tight">Wishlist</h1>
            <span className="text-sm text-[#707070]">{products.length} item{products.length !== 1 ? 's' : ''}</span>
          </div>
          {error ? (
            <div className="flex justify-center items-center h-40 text-lg text-red-500">{error}</div>
          ) : loading ? (
            <div className="flex justify-center items-center h-40 text-lg text-gray-400">Loading...</div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-lg text-gray-400">No favorites yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Array.isArray(products) && products.map(product => (
                <div key={product.product_id} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#e5e5e5]">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-20 sm:size-24 shrink-0" style={{ backgroundImage: `url('${product.primary_media ? MEDIA_BASE + product.primary_media : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='}` }} />
                  <div className="flex-1 flex flex-col gap-1">
                    <a href={`/product/${product.slug}`} className="text-[#1a1a1a] text-lg font-semibold leading-normal line-clamp-1 hover:underline">{product.name}</a>
                    <p className="text-[#e92933] text-lg font-bold mt-1 sm:mt-2">
                      {product.is_offer && product.offer_price ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">{Number(product.sell_price).toFixed(2)}</span>
                          <span>{Number(product.offer_price).toFixed(2)}</span>
                        </>
                      ) : (
                        <span>{Number(product.sell_price).toFixed(2)}</span>
                      )}
                      <span className="ml-1 text-gray-500 text-base font-normal">EGP</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                      onClick={() => addToCart(product.product_id)}
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-transparent text-[#707070] border border-[#e5e5e5] hover:border-[#e92933] hover:text-[#e92933] text-sm font-medium transition-colors"
                      onClick={() => removeFromWishlist(product.product_id)}
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Wishlist; 