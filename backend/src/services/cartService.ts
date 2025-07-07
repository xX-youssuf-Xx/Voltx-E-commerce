import { db } from '../config/database';

interface CartInput {
  user_id?: number;
  products: Record<string, number>;
  shareable_code: string;
}

export async function createCart(input: CartInput) {
  const { user_id, products, shareable_code } = input;
  const result = await db.query(
    `INSERT INTO carts (user_id, products, shareable_code) VALUES ($1, $2, $3) RETURNING *`,
    [user_id || null, JSON.stringify(products), shareable_code]
  );
  return result.rows[0];
}

export async function getCartById(cart_id: number) {
  const result = await db.query(`SELECT * FROM carts WHERE cart_id = $1`, [cart_id]);
  return result.rows[0];
}

export async function getCartByCode(code: string) {
  const result = await db.query(`SELECT * FROM carts WHERE shareable_code = $1`, [code]);
  return result.rows[0];
}

export async function listCarts() {
  const result = await db.query(`SELECT * FROM carts ORDER BY created_at DESC`);
  return result.rows;
}

export async function updateCart(cart_id: number, products: Record<string, number>) {
  const result = await db.query(
    `UPDATE carts SET products = $1, updated_at = NOW() WHERE cart_id = $2 RETURNING *`,
    [JSON.stringify(products), cart_id]
  );
  return result.rows[0];
}

export async function deleteCart(cart_id: number) {
  const result = await db.query(`DELETE FROM carts WHERE cart_id = $1`, [cart_id]);
  return (result.rowCount ?? 0) > 0;
} 