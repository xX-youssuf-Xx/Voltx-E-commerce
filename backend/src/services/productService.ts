import { db } from "../config/database";

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
  const result = await db.query(sql, params);
  return result.rows;
}

export async function getProductById(id: number) {
  const result = await db.query(`
    SELECT 
      p.*,
      b.name as brand_name,
      c.name as category_name,
      pc.name as parent_category_name,
      pc.category_id as parent_category_id
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN categories pc ON c.parent_id = pc.category_id
    WHERE p.product_id = $1
  `, [id]);
  
  if (result.rows.length === 0) return null;
  
  // Get media
  const media = await db.query("SELECT * FROM media WHERE product_id = $1 ORDER BY sort_order", [id]);
  
  return { ...result.rows[0], media: media.rows };
}

export async function getProductShortInfo(id: number) {
  const result = await db.query(`
    SELECT 
      p.product_id,
      p.name,
      p.sku,
      p.slug,
      p.short_description,
      p.sell_price,
      p.status,
      m.image_url as primary_media
    FROM products p
    LEFT JOIN media m ON p.primary_media_id = m.media_id
    WHERE p.product_id = $1
  `, [id]);
  
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function createProduct(data: any, userId: number, imagePath?: string) {
  // Validate required fields
  if (!data.name || !data.slug || !data.sku || !data.sell_price) {
    throw new Error("Missing required fields: name, slug, sku, sell_price");
  }
  
  if (!imagePath) {
    throw new Error("Image file is required");
  }

  // Check if SKU already exists
  const existingSku = await db.query("SELECT product_id FROM products WHERE sku = $1", [data.sku]);
  if (existingSku.rows.length > 0) {
    throw new Error("SKU already exists");
  }

  // Check if slug already exists
  const existingSlug = await db.query("SELECT product_id FROM products WHERE slug = $1", [data.slug]);
  if (existingSlug.rows.length > 0) {
    throw new Error("Slug already exists");
  }

  // Parse long_description if provided
  let longDescription = null;
  if (data.long_description) {
    try {
      longDescription = typeof data.long_description === 'string' 
        ? JSON.parse(data.long_description) 
        : data.long_description;
    } catch (error) {
      throw new Error("Invalid long_description format");
    }
  }

  // Handle custom status
  let status = data.status || 'on_sale';
  let isCustomStatus = false;
  let customStatus = null;
  let customStatusColor = null;

  if (data.is_custom_status === 'true' || data.is_custom_status === true) {
    isCustomStatus = true;
    status = 'custom';
    customStatus = data.custom_status || null;
    customStatusColor = data.custom_status_color || null;
  }

  // 1. Insert product without primary_media_id
  const productResult = await db.query(
    `INSERT INTO products (name, slug, sku, short_description, long_description, bought_price, sell_price, is_offer, offer_price, status, stock_quantity, min_stock_level, is_custom_status, custom_status, custom_status_color, box_number, brand_id, category_id, meta_title, meta_description, search_keywords, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW()) RETURNING *`,
    [
      data.name, 
      data.slug, 
      data.sku, 
      data.short_description || null,
      longDescription,
      data.bought_price ? parseFloat(data.bought_price) : null,
      parseFloat(data.sell_price), 
      data.is_offer === 'true' || data.is_offer === true,
      data.offer_price ? parseFloat(data.offer_price) : null,
      status, 
      data.stock_quantity ? parseInt(data.stock_quantity) : 0,
      data.min_stock_level ? parseInt(data.min_stock_level) : 0,
      isCustomStatus,
      customStatus,
      customStatusColor,
      data.box_number || null,
      data.brand_id ? parseInt(data.brand_id) : null, 
      data.category_id ? parseInt(data.category_id) : null,
      data.meta_title || null,
      data.meta_description || null,
      data.search_keywords || null
    ]
  );
  const product = productResult.rows[0];
  
  // 2. Insert media and get its id (use temp imagePath, will update after rename)
  const mediaResult = await db.query(
    `INSERT INTO media (product_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, 0) RETURNING media_id, image_url`,
    [product.product_id, imagePath, data.alt_text || null]
  );
  const mediaId = mediaResult.rows[0].media_id;

  // 3. Update product with primary_media_id
  const updatedProductResult = await db.query(
    `UPDATE products SET primary_media_id = $1 WHERE product_id = $2 RETURNING *`,
    [mediaId, product.product_id]
  );

  // 4. Return product and mediaId for controller to update image_url after rename
  return { ...updatedProductResult.rows[0], primary_media_id: mediaId, media_id: mediaId };
}

export async function updateProduct(id: number, data: any, userId: number) {
  // Get existing product
  const existing = await db.query("SELECT * FROM products WHERE product_id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new Error("Product not found");
  }

  const current = existing.rows[0];
  
  // Define all possible fields that can be updated
  const allowedFields = [
    "name", "slug", "sku", "short_description", "long_description", 
    "bought_price", "sell_price", "is_offer", "offer_price", "status", 
    "stock_quantity", "min_stock_level", "is_custom_status", "custom_status", 
    "custom_status_color", "box_number", "brand_id", "category_id", 
    "meta_title", "meta_description", "search_keywords"
  ];

  // Prepare update data - only update provided fields
  const updateData: any = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  // Handle custom status
  if (data.is_custom_status === 'true' || data.is_custom_status === true) {
    updateData.is_custom_status = true;
    updateData.status = 'custom';
    updateData.custom_status = data.custom_status || null;
    updateData.custom_status_color = data.custom_status_color || null;
  } else if (data.is_custom_status === 'false' || data.is_custom_status === false) {
    updateData.is_custom_status = false;
    updateData.custom_status = null;
    updateData.custom_status_color = null;
  }

  // Convert numeric fields
  if (updateData.bought_price !== undefined) {
    updateData.bought_price = updateData.bought_price ? parseFloat(updateData.bought_price) : null;
  }
  if (updateData.sell_price !== undefined) {
    updateData.sell_price = parseFloat(updateData.sell_price);
  }
  if (updateData.offer_price !== undefined) {
    updateData.offer_price = updateData.offer_price ? parseFloat(updateData.offer_price) : null;
  }
  if (updateData.stock_quantity !== undefined) {
    updateData.stock_quantity = updateData.stock_quantity ? parseInt(updateData.stock_quantity) : 0;
  }
  if (updateData.min_stock_level !== undefined) {
    updateData.min_stock_level = updateData.min_stock_level ? parseInt(updateData.min_stock_level) : 0;
  }
  if (updateData.brand_id !== undefined) {
    updateData.brand_id = updateData.brand_id ? parseInt(updateData.brand_id) : null;
  }
  if (updateData.category_id !== undefined) {
    updateData.category_id = updateData.category_id ? parseInt(updateData.category_id) : null;
  }

  // Validate SKU uniqueness if being updated
  if (data.sku && data.sku !== current.sku) {
    const existingSku = await db.query("SELECT product_id FROM products WHERE sku = $1 AND product_id != $2", [data.sku, id]);
    if (existingSku.rows.length > 0) {
      throw new Error("SKU already exists");
    }
  }

  // Validate slug uniqueness if being updated
  if (data.slug && data.slug !== current.slug) {
    const existingSlug = await db.query("SELECT product_id FROM products WHERE slug = $1 AND product_id != $2", [data.slug, id]);
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
    `UPDATE products SET ${setClause}, updated_at = NOW() WHERE product_id = $1 RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function deleteProduct(id: number) {
  await db.query("DELETE FROM media WHERE product_id = $1", [id]);
  await db.query("DELETE FROM products WHERE product_id = $1", [id]);
}

export async function addProductMedia(productId: number, data: any, userId: number, imagePath?: string) {
  if (!imagePath) throw new Error("image (file) is required");
  const result = await db.query(
    `INSERT INTO media (product_id, image_url, alt_text, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
    [productId, imagePath, data.alt_text || null, data.sort_order || 0]
  );
  return result.rows[0];
}

export async function deleteProductMedia(productId: number, mediaId: number, userId: number) {
  await db.query("DELETE FROM media WHERE media_id = $1 AND product_id = $2", [mediaId, productId]);
}

export async function updateProductMedia(mediaId: number, data: any) {
  const fields = Object.keys(data);
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ");
  const values = [mediaId, ...fields.map(field => data[field])];

  const result = await db.query(
    `UPDATE media SET ${setClause} WHERE media_id = $1 RETURNING *`,
    values
  );

  return result.rows[0];
}

interface PaginationParams {
  page: number;
  limit: number;
  search: string;
  searchBy: string;
  brand?: number | undefined;
  categoryid?: number | undefined;
  status?: string | undefined;
  orderBy: string;
  orderDirection: string;
}

export async function getPaginatedProducts(params: PaginationParams) {
  const { page, limit, search, searchBy, brand, categoryid, status, orderBy, orderDirection } = params;
  const offset = (page - 1) * limit;

  // Build the base query with joins for brand and category names
  let baseQuery = `
    SELECT 
      p.product_id,
      p.name,
      p.slug,
      p.sku,
      p.short_description,
      p.sell_price,
      p.offer_price,
      p.is_offer,
      p.status,
      p.stock_quantity,
      p.box_number,
      p.created_at,
      p.updated_at,
      b.name as brand_name,
      c.name as category_name,
      m.image_url as primary_media
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN media m ON p.primary_media_id = m.media_id
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE 1=1
  `;

  const queryParams: any[] = [];
  let paramIndex = 1;

  // Add search conditions
  if (search) {
    const searchCondition = searchBy === 'brand' 
      ? `b.name ILIKE $${paramIndex}`
      : searchBy === 'sku'
      ? `p.sku ILIKE $${paramIndex}`
      : `p.name ILIKE $${paramIndex}`;
    
    baseQuery += ` AND ${searchCondition}`;
    countQuery += ` AND ${searchCondition}`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  // Add filters
  if (brand) {
    baseQuery += ` AND p.brand_id = $${paramIndex}`;
    countQuery += ` AND p.brand_id = $${paramIndex}`;
    queryParams.push(brand);
    paramIndex++;
  }

  if (categoryid) {
    baseQuery += ` AND p.category_id = $${paramIndex}`;
    countQuery += ` AND p.category_id = $${paramIndex}`;
    queryParams.push(categoryid);
    paramIndex++;
  }

  if (status) {
    baseQuery += ` AND p.status = $${paramIndex}`;
    countQuery += ` AND p.status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  // Add ordering
  const validOrderFields = ['name', 'sku', 'sell_price', 'stock_quantity', 'created_at', 'updated_at'];
  const validOrderDirections = ['ASC', 'DESC'];
  
  const finalOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
  const finalOrderDirection = validOrderDirections.includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'DESC';
  
  baseQuery += ` ORDER BY p.${finalOrderBy} ${finalOrderDirection}`;
  baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  // Execute both queries
  const [productsResult, countResult] = await Promise.all([
    db.query(baseQuery, queryParams),
    db.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  return {
    products: productsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// Generate a random 4-digit numeric SKU (0000-9999)
export async function generateUniqueSKU(): Promise<string> {
  let sku = '';
  let isUnique = false;
  while (!isUnique) {
    sku = Math.floor(1000 + Math.random() * 9000).toString(); // always 4 digits, no leading zero
    const existingSku = await db.query("SELECT product_id FROM products WHERE sku = $1", [sku]);
    if (existingSku.rows.length === 0) {
      isUnique = true;
    }
  }
  return sku;
} 