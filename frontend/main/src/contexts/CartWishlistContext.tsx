import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export interface CartItem {
  productId: string;
  quantity: number;
}

export type Wishlist = string[];

interface CartWishlistContextType {
  cart: CartItem[];
  wishlist: Wishlist;
  addToCart: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearWishlist: () => void;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

const CART_KEY = 'voltx_cart';
const WISHLIST_KEY = 'voltx_wishlist';

export const CartWishlistProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  });
  const [wishlist, setWishlist] = useState<Wishlist>(() => {
    const wishlistData = localStorage.getItem(WISHLIST_KEY);
    return wishlistData ? JSON.parse(wishlistData) : [];
  });

  // Sync cart/wishlist to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart functions
  const addToCart = (productId: string) => {
    setCart(prev => {
      const found = prev.find(item => item.productId === productId);
      if (found) {
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { productId, quantity: 1 }];
      }
    });
  };
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };
  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };
  const clearCart = () => setCart([]);

  // Wishlist functions
  const addToWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };
  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  };
  const clearWishlist = () => setWishlist([]);

  return (
    <CartWishlistContext.Provider
      value={{ cart, wishlist, addToCart, addToWishlist, removeFromWishlist, removeFromCart, updateCartQuantity, clearCart, clearWishlist }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => {
  const ctx = useContext(CartWishlistContext);
  if (!ctx) throw new Error('useCartWishlist must be used within CartWishlistProvider');
  return ctx;
}; 