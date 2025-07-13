import { db } from '../config/database';

export async function addToWishlist(userId: number, productId: number) {
  try {
    const result = await db.query(
      `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *`,
      [userId, productId]
    );
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return null; // Already in wishlist
    }
    throw error;
  }
}

export async function removeFromWishlist(userId: number, productId: number) {
  const result = await db.query(
    `DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *`,
    [userId, productId]
  );
  return result.rows[0];
}

export async function getWishlist(userId: number) {
  const result = await db.query(
    `SELECT w.*, p.name, p.slug, p.sku, p.sell_price, p.offer_price, p.is_offer, p.status, 
     p.is_custom_status, p.custom_status, p.custom_status_color, m.image_url as primary_media
     FROM wishlist w
     JOIN products p ON w.product_id = p.product_id
     LEFT JOIN media m ON p.primary_media_id = m.media_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function isInWishlist(userId: number, productId: number) {
  const result = await db.query(
    `SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );
  return result.rows.length > 0;
}

export async function getWishlistStatus(userId: number, productIds: number[]) {
  if (productIds.length === 0) return {};
  
  const placeholders = productIds.map((_, index) => `$${index + 2}`).join(',');
  const result = await db.query(
    `SELECT product_id FROM wishlist WHERE user_id = $1 AND product_id IN (${placeholders})`,
    [userId, ...productIds]
  );
  
  const wishlistMap: Record<number, boolean> = {};
  productIds.forEach(id => wishlistMap[id] = false);
  result.rows.forEach(row => wishlistMap[row.product_id] = true);
  
  return wishlistMap;
} 