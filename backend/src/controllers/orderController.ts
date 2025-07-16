import { Request, Response } from 'express';
import { createOrderWithReceipt } from '../services/orderService.js';
import { validateCouponAndCalculateDiscount } from '../services/discountService';
import { db } from '../config/database';

export async function createOrder(req: Request, res: Response) {
  try {
    const orderData = req.body;
    // Validate required fields (products, total_price, order_type, etc.)
    if (!orderData.products || !orderData.total_price || !orderData.order_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Re-check coupon and discount before finalizing order
    let discount = 0;
    if (orderData.discount_code) {
      discount = await validateCouponAndCalculateDiscount(orderData.discount_code, orderData.products, orderData.price);
      orderData.discount = discount;
    }
    const result = await createOrderWithReceipt(orderData);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function validateCoupon(req: Request, res: Response) {
  try {
    const { coupon, products, price } = req.body;
    if (!coupon || !products || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const discount = await validateCouponAndCalculateDiscount(coupon, products, price);
    return res.json({ discount });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function listOrders(req: Request, res: Response) {
  try {
    const result = await db.query('SELECT * FROM orders_custom ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getReceipt(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await db.query('SELECT * FROM receipts WHERE receipt_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
} 