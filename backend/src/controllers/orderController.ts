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

export async function updateOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { shipping_location } = req.body;
    const result = await db.query(
      'UPDATE orders_custom SET shipping_location = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *',
      [shipping_location, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateReceipt(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { price_paid, payment_method } = req.body;
    const result = await db.query(
      'UPDATE receipts SET price_paid = $1, payment_method = $2 WHERE receipt_id = $3 RETURNING *',
      [price_paid, payment_method, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Receipt not found' });
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    // Delete receipt first (if exists)
    await db.query('DELETE FROM receipts WHERE order_id = $1', [id]);
    // Delete order
    const result = await db.query('DELETE FROM orders_custom WHERE order_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteReceipt(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await db.query('DELETE FROM receipts WHERE receipt_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Receipt not found' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getOrderDetails(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    // 1. Get order
    const orderResult = await db.query('SELECT * FROM orders_custom WHERE order_id = $1', [orderId]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orderResult.rows[0];

    // 2. Get customer (if present)
    let customer = null;
    if (order.customer_id) {
      const custResult = await db.query('SELECT user_id, name, email FROM users WHERE user_id = $1', [order.customer_id]);
      customer = custResult.rows[0] || null;
    }

    // 3. Get receipt (if present)
    let receipt = null;
    if (order.receipt_id) {
      const recResult = await db.query('SELECT * FROM receipts WHERE receipt_id = $1', [order.receipt_id]);
      receipt = recResult.rows[0] || null;
    }

    // 4. Get product info for all products in the order
    let productsInfo = [];
    if (order.products) {
      const productIds = Object.keys(order.products).map(Number);
      if (productIds.length > 0) {
        const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
        const prodResult = await db.query(
          `SELECT p.product_id, p.name, p.sku, p.box_number, m.image_url as primary_media
           FROM products p
           LEFT JOIN media m ON p.primary_media_id = m.media_id
           WHERE p.product_id IN (${placeholders})`,
          productIds
        );
        productsInfo = prodResult.rows;
      }
    }

    return res.json({
      order,
      customer,
      receipt,
      productsInfo
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
} 