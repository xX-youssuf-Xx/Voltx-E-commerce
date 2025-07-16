import { db } from '../config/database';

export async function createOrderWithReceipt(orderData: any) {
  const {
    products,
    price,
    discount,
    discount_code,
    is_shipping,
    shipping_location,
    total_price,
    order_type,
    customer_id,
    cashier_id,
    payment_method,
    price_paid
  } = orderData;

  // Start transaction
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Insert order
    const orderRes = await client.query(
      `INSERT INTO orders_custom
        (products, price, discount, discount_code, is_shipping, shipping_location, total_price, order_type, customer_id, cashier_id, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
       RETURNING *`,
      [products, price, discount, discount_code, is_shipping, shipping_location, total_price, order_type, customer_id, cashier_id]
    );
    const order = orderRes.rows[0];
    // Insert receipt
    const receiptRes = await client.query(
      `INSERT INTO receipts (order_id, payment_method, price_paid, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [order.order_id, payment_method, price_paid]
    );
    const receipt = receiptRes.rows[0];
    // Update order with receipt_id
    await client.query(
      `UPDATE orders_custom SET receipt_id = $1 WHERE order_id = $2`,
      [receipt.receipt_id, order.order_id]
    );

    // Update product stock for each product in the order
    for (const [productId, qty] of Object.entries(products)) {
      // Subtract qty from stock_quantity
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2`,
        [qty, productId]
      );
      // If stock is now 0, set status to 'out_of_stock'
      await client.query(
        `UPDATE products SET status = 'out_of_stock' WHERE product_id = $1 AND stock_quantity <= 0`,
        [productId]
      );
    }

    await client.query('COMMIT');
    return { order: { ...order, receipt_id: receipt.receipt_id }, receipt };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
} 