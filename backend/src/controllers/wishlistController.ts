import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlistService';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function addToWishlist(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await wishlistService.addToWishlist(userId, Number(product_id));
    if (!result) {
      return res.status(409).json({ error: 'Product already in wishlist' });
    }

    res.status(201).json({ message: 'Added to wishlist', wishlist_item: result });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function removeFromWishlist(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { product_id } = req.params;
    const result = await wishlistService.removeFromWishlist(userId, Number(product_id));
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    res.json({ message: 'Removed from wishlist' });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function getWishlist(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const wishlist = await wishlistService.getWishlist(userId);
    res.json(wishlist);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function getWishlistStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { product_ids } = req.query;
    if (!product_ids || !Array.isArray(product_ids)) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }

    const productIds = product_ids.map(id => Number(id));
    const status = await wishlistService.getWishlistStatus(userId, productIds);
    res.json(status);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
} 