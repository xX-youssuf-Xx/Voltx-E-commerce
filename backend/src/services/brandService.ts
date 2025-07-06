import { Pool } from "pg";
import { db } from "../config/database";

export async function listBrands(query: any = {}) {
  const { search } = query;
  let sql = "SELECT * FROM brands";
  const params: any[] = [];

  if (search) {
    sql += " WHERE name ILIKE $1";
    params.push(`%${search}%`);
  }

  sql += " ORDER BY name";

  const result = await db.query(sql, params);
  return result.rows;
}

export async function getBrandById(id: number) {
  const result = await db.query("SELECT * FROM brands WHERE brand_id = $1", [id]);
  return result.rows[0];
}

export async function createBrand(data: any, userId?: number) {
  const { name, slug } = data;

  // Validate required fields
  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  // Check if name already exists
  const existingName = await db.query("SELECT brand_id FROM brands WHERE name = $1", [name]);
  if (existingName.rows.length > 0) {
    throw new Error("Brand name already exists");
  }

  // Check if slug already exists
  const existingSlug = await db.query("SELECT brand_id FROM brands WHERE slug = $1", [slug]);
  if (existingSlug.rows.length > 0) {
    throw new Error("Slug already exists");
  }

  const result = await db.query(
    "INSERT INTO brands (name, slug) VALUES ($1, $2) RETURNING *",
    [name, slug]
  );

  return result.rows[0];
}

export async function updateBrand(id: number, data: any, userId?: number) {
  // Get existing brand
  const existing = await db.query("SELECT * FROM brands WHERE brand_id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new Error("Brand not found");
  }

  const current = existing.rows[0];
  const { name, slug } = data;

  // Prepare update data - only update provided fields
  const updateData: any = {};
  
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;

  // Check if name already exists (if being updated)
  if (name && name !== current.name) {
    const existingName = await db.query("SELECT brand_id FROM brands WHERE name = $1 AND brand_id != $2", [name, id]);
    if (existingName.rows.length > 0) {
      throw new Error("Brand name already exists");
    }
  }

  // Check if slug already exists (if being updated)
  if (slug && slug !== current.slug) {
    const existingSlug = await db.query("SELECT brand_id FROM brands WHERE slug = $1 AND brand_id != $2", [slug, id]);
    if (existingSlug.rows.length > 0) {
      throw new Error("Slug already exists");
    }
  }

  // Build dynamic update query
  const fields = Object.keys(updateData);
  if (fields.length === 0) {
    return current; // No changes
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ");
  const values = [id, ...fields.map(field => updateData[field])];

  const result = await db.query(
    `UPDATE brands SET ${setClause} WHERE brand_id = $1 RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function deleteBrand(id: number) {
  // Check if brand exists
  const existing = await db.query("SELECT brand_id FROM brands WHERE brand_id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new Error("Brand not found");
  }

  // Check if brand has products
  const products = await db.query("SELECT product_id FROM products WHERE brand_id = $1 LIMIT 1", [id]);
  if (products.rows.length > 0) {
    throw new Error("Cannot delete brand with associated products");
  }

  await db.query("DELETE FROM brands WHERE brand_id = $1", [id]);
} 