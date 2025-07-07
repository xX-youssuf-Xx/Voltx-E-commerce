import { db } from '../config/database';

const tableMap: Record<string, string> = {
  best_sellers: 'best_sellers',
  new_arrivals: 'new_arrivals',
  featured_products: 'featured_products',
};

export async function listSection(section: string) {
  const table = tableMap[section];
  try {
    console.log(`[listSection] section: ${section}, table: ${table}`);
    const result = await db.query(
      `SELECT t.id, t.product_id, t.sort_order, p.name, p.sell_price, m.image_url as primary_media
       FROM ${table} t
       JOIN products p ON t.product_id = p.product_id
       LEFT JOIN media m ON p.primary_media_id = m.media_id
       ORDER BY t.sort_order ASC, t.id ASC`
    );
    return result.rows;
  } catch (err) {
    console.error(`[listSection] Error for section ${section}:`, err);
    throw err;
  }
}

export async function addProduct(section: string, product_id: number) {
  const table = tableMap[section];
  try {
    console.log(`[addProduct] section: ${section}, product_id: ${product_id}`);
    // Find max sort_order
    const maxRes = await db.query(`SELECT COALESCE(MAX(sort_order), 0) as max_order FROM ${table}`);
    const sort_order = (maxRes.rows[0]?.max_order ?? 0) + 1;
    const result = await db.query(
      `INSERT INTO ${table} (product_id, sort_order) VALUES ($1, $2) RETURNING *`,
      [product_id, sort_order]
    );
    return result.rows[0];
  } catch (err) {
    console.error(`[addProduct] Error for section ${section}, product_id ${product_id}:`, err);
    throw err;
  }
}

export async function removeProduct(section: string, id: number) {
  const table = tableMap[section];
  try {
    console.log(`[removeProduct] section: ${section}, id: ${id}`);
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  } catch (err) {
    console.error(`[removeProduct] Error for section ${section}, id ${id}:`, err);
    throw err;
  }
}

export async function reorderSection(section: string, order: number[]) {
  const table = tableMap[section];
  try {
    console.log(`[reorderSection] section: ${section}, order:`, order);
    for (let i = 0; i < order.length; i++) {
      await db.query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [i + 1, order[i]]);
    }
  } catch (err) {
    console.error(`[reorderSection] Error for section ${section}, order:`, order, err);
    throw err;
  }
} 