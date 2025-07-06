import { Pool } from "pg";
import { db } from "../config/database";

export async function listCategories(query: any = {}) {
  const { search, parent_id } = query;
  let sql = "SELECT * FROM categories";
  const params: any[] = [];
  let paramCount = 0;

  const conditions: string[] = [];

  if (search) {
    paramCount++;
    conditions.push(`name ILIKE $${paramCount}`);
    params.push(`%${search}%`);
  }

  if (parent_id !== undefined) {
    paramCount++;
    conditions.push(`parent_id = $${paramCount}`);
    params.push(parent_id === 'null' ? null : Number(parent_id));
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY name";

  const result = await db.query(sql, params);
  return result.rows;
}

export async function getCategoryById(id: number) {
  const result = await db.query("SELECT * FROM categories WHERE category_id = $1", [id]);
  return result.rows[0];
}

export async function createCategory(data: any, userId?: number) {
  const { name, slug, parent_id } = data;

  // Validate required fields
  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  // Check if slug already exists
  const existingSlug = await db.query("SELECT category_id FROM categories WHERE slug = $1", [slug]);
  if (existingSlug.rows.length > 0) {
    throw new Error("Slug already exists");
  }

  // Check if parent_id exists if provided
  if (parent_id) {
    const parentExists = await db.query("SELECT category_id FROM categories WHERE category_id = $1", [parent_id]);
    if (parentExists.rows.length === 0) {
      throw new Error("Parent category not found");
    }
  }

  const result = await db.query(
    "INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *",
    [name, slug, parent_id || null]
  );

  return result.rows[0];
}

export async function updateCategory(id: number, data: any, userId?: number) {
  // Get existing category
  const existing = await db.query("SELECT * FROM categories WHERE category_id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new Error("Category not found");
  }

  const current = existing.rows[0];
  const { name, slug, parent_id } = data;

  // Prepare update data - only update provided fields
  const updateData: any = {};
  
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (parent_id !== undefined) updateData.parent_id = parent_id === null ? null : Number(parent_id);

  // Check if slug already exists (if being updated)
  if (slug && slug !== current.slug) {
    const existingSlug = await db.query("SELECT category_id FROM categories WHERE slug = $1 AND category_id != $2", [slug, id]);
    if (existingSlug.rows.length > 0) {
      throw new Error("Slug already exists");
    }
  }

  // Check if parent_id exists (if being updated)
  if (parent_id !== undefined && parent_id !== current.parent_id) {
    if (parent_id !== null) {
      const parentExists = await db.query("SELECT category_id FROM categories WHERE category_id = $1", [parent_id]);
      if (parentExists.rows.length === 0) {
        throw new Error("Parent category not found");
      }
    }
    // Prevent circular reference
    if (parent_id === id) {
      throw new Error("Category cannot be its own parent");
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
    `UPDATE categories SET ${setClause} WHERE category_id = $1 RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function deleteCategory(id: number) {
  // Check if category exists
  const existing = await db.query("SELECT category_id FROM categories WHERE category_id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new Error("Category not found");
  }

  // Check if category has children
  const children = await db.query("SELECT category_id FROM categories WHERE parent_id = $1", [id]);
  if (children.rows.length > 0) {
    throw new Error("Cannot delete category with subcategories");
  }

  // Check if category has products
  const products = await db.query("SELECT product_id FROM products WHERE category_id = $1 LIMIT 1", [id]);
  if (products.rows.length > 0) {
    throw new Error("Cannot delete category with associated products");
  }

  await db.query("DELETE FROM categories WHERE category_id = $1", [id]);
} 