import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect();

export async function listProducts(query: any) {
  // Filtering: brand, categoryid, price range
  let sql = `SELECT product_id, name, slug, sell_price, offer_price, is_offer, status, stock_quantity, box_number, brand_id, category_id, primary_media_id FROM products WHERE 1=1`;
  const params: any[] = [];
  if (query.brand) {
    params.push(query.brand);
    sql += ` AND brand_id = $${params.length}`;
  }
  if (query.categoryid) {
    params.push(query.categoryid);
    sql += ` AND category_id = $${params.length}`;
  }
  if (query.price_from) {
    params.push(query.price_from);
    sql += ` AND sell_price >= $${params.length}`;
  }
  if (query.price_to) {
    params.push(query.price_to);
    sql += ` AND sell_price <= $${params.length}`;
  }
  sql += ` ORDER BY product_id DESC`;
  const result = await client.query(sql, params);
  return result.rows;
}

export async function getProductById(id: number) {
  const result = await client.query("SELECT * FROM products WHERE product_id = $1", [id]);
  if (result.rows.length === 0) return null;
  // Get media
  const media = await client.query("SELECT * FROM media WHERE product_id = $1 ORDER BY sort_order", [id]);
  return { ...result.rows[0], media: media.rows };
}

export async function createProduct(data: any, userId: number, imagePath?: string) {
  if (!data.name || !data.slug || !data.sell_price || !imagePath) {
    throw new Error("Missing required fields: name, slug, sell_price, image (file)");
  }
  // 1. Insert product without primary_media_id
  const productResult = await client.query(
    `INSERT INTO products (name, slug, sell_price, status, stock_quantity, brand_id, category_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
    [data.name, data.slug, data.sell_price, data.status || 'on_sale', data.stock_quantity || 0, data.brand_id || null, data.category_id || null]
  );
  const product = productResult.rows[0];
  // 2. Insert media and get its id
  const mediaResult = await client.query(
    `INSERT INTO media (product_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, 0) RETURNING media_id`,
    [product.product_id, imagePath, data.alt_text || null]
  );
  const mediaId = mediaResult.rows[0].media_id;
  // 3. Update product with primary_media_id
  const updatedProductResult = await client.query(
    `UPDATE products SET primary_media_id = $1 WHERE product_id = $2 RETURNING *`,
    [mediaId, product.product_id]
  );
  return { ...updatedProductResult.rows[0], primary_media_id: mediaId };
}

export async function updateProduct(id: number, data: any, userId: number) {
  // Only allow certain fields to be updated
  const fields = ["name", "slug", "sell_price", "status", "stock_quantity", "brand_id", "category_id", "box_number", "is_offer", "offer_price"];
  const updates: string[] = [];
  const params: any[] = [];
  fields.forEach(field => {
    if (data[field] !== undefined) {
      params.push(data[field]);
      updates.push(`${field} = $${params.length}`);
    }
  });
  if (updates.length === 0) throw new Error("No valid fields to update");
  params.push(id);
  const sql = `UPDATE products SET ${updates.join(", ")}, updated_at = NOW() WHERE product_id = $${params.length} RETURNING *`;
  const result = await client.query(sql, params);
  return result.rows[0];
}

export async function deleteProduct(id: number) {
  await client.query("DELETE FROM media WHERE product_id = $1", [id]);
  await client.query("DELETE FROM products WHERE product_id = $1", [id]);
}

export async function addProductMedia(productId: number, data: any, userId: number, imagePath?: string) {
  if (!imagePath) throw new Error("image (file) is required");
  const result = await client.query(
    `INSERT INTO media (product_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
    [productId, imagePath, data.alt_text || null, data.sort_order || 0]
  );
  return result.rows[0];
}

export async function deleteProductMedia(productId: number, mediaId: number, userId: number) {
  await client.query("DELETE FROM media WHERE media_id = $1 AND product_id = $2", [mediaId, productId]);
} 