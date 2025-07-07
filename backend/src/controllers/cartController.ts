import { Request, Response } from 'express';
import * as cartService from '../services/cartService';

// Generate a 6-digit uppercase alphanumeric code
function generateShareableCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createCart = async (req: Request, res: Response) => {
  try {
    const { user_id, products } = req.body;
    let code = generateShareableCode();
    // Ensure code is unique
    while (await cartService.getCartByCode(code)) {
      code = generateShareableCode();
    }
    const cart = await cartService.createCart({ user_id, products, shareable_code: code });
    res.status(201).json(cart);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to create cart' });
    return;
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await cartService.getCartById(Number(req.params.id));
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json(cart);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
    return;
  }
};

export const getCartByCode = async (req: Request, res: Response) => {
  try {
    const code = req.params.code ?? '';
    const cart = await cartService.getCartByCode(code);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json(cart);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
    return;
  }
};

export const listCarts = async (req: Request, res: Response) => {
  try {
    const carts = await cartService.listCarts();
    res.json(carts);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to list carts' });
    return;
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const cart = await cartService.updateCart(Number(req.params.id), req.body.products);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json(cart);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
    return;
  }
};

export const deleteCart = async (req: Request, res: Response) => {
  try {
    const ok = await cartService.deleteCart(Number(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json({ success: true });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cart' });
    return;
  }
}; 