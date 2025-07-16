import { db } from "../config/database";

export async function listProducts(query: any) {
  // Filtering: brand, categoryid, price range, sku
  let sql = `SELECT product_id, name, slug, sku, sell_price, offer_price, is_offer, status, stock_quantity, box_number, brand_id, category_id, primary_media_id FROM products WHERE 1=1`;
  const params: any[] = [];
  
  if (query.sku) {
    params.push(query.sku);
    sql += ` AND sku = $${params.length}`;
  }
  
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

// DOCS SERVICE FUNCTIONS
export async function listProductDocs(productId: number) {
  const result = await db.query(
    `SELECT * FROM documents WHERE product_id = $1 ORDER BY document_id DESC`,
    [productId]
  );
  return result.rows;
}

export async function addProductDoc(productId: number, data: any, userId: number, filePath?: string, file?: Express.Multer.File) {
  if (!filePath || !file) throw new Error("file is required");
  const result = await db.query(
    `INSERT INTO documents (product_id, file_name, file_url, file_size_kb, type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      productId,
      file.originalname,
      filePath,
      file.size ? Math.round(file.size / 1024) : 0,
      data.type || 'other'
    ]
  );
  return result.rows[0];
}

export async function deleteProductDoc(productId: number, docId: number, userId: number) {
  await db.query(`DELETE FROM documents WHERE document_id = $1 AND product_id = $2`, [docId, productId]);
}

export async function updateProductDoc(productId: number, docId: number, data: any, userId: number, filePath?: string, file?: Express.Multer.File) {
  // Build dynamic update query
  const fields = [];
  const values: (string | number)[] = [docId, productId];
  let idx = 3;
  if (data.name) {
    fields.push(`file_name = $${idx++}`);
    values.push(data.name);
  }
  if (data.type) {
    fields.push(`type = $${idx++}`);
    values.push(data.type);
  }
  if (data.description) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (filePath && file) {
    fields.push(`file_url = $${idx++}`);
    values.push(filePath);
    fields.push(`file_size_kb = $${idx++}`);
    values.push(file && typeof file.size === 'number' ? Math.round(file.size / 1024) : 0);
  }
  if (fields.length === 0) throw new Error('No fields to update');
  const setClause = fields.join(', ');
  const result = await db.query(
    `UPDATE documents SET ${setClause} WHERE document_id = $1 AND product_id = $2 RETURNING *`,
    values
  );
  return result.rows[0];
} 

export async function getProductBySlug(slug: string) {
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
    WHERE p.slug = $1
  `, [slug]);
  if (result.rows.length === 0) return null;
  const product = result.rows[0];
  const media = await db.query("SELECT * FROM media WHERE product_id = $1 ORDER BY sort_order", [product.product_id]);
  return { ...product, media: media.rows };
} 

export async function listProductsAdmin(query: any) {
  const {
    page = 1,
    limit = 20,
    search = "",
    searchBy = "name",
    brand,
    categoryid,
    status,
    sku,
    price_from,
    price_to,
    orderBy = "created_at",
    orderDirection = "DESC"
  } = query;

  const offset = (Number(page) - 1) * Number(limit);
  
  // Base query for products with all fields
  let baseQuery = `
    SELECT p.*, b.name as brand_name, c.name as category_name, m.image_url as primary_media
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN media m ON p.primary_media_id = m.media_id
    WHERE 1=1
  `;
  
  // Count query for pagination
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

  if (sku) {
    baseQuery += ` AND p.sku = $${paramIndex}`;
    countQuery += ` AND p.sku = $${paramIndex}`;
    queryParams.push(sku);
    paramIndex++;
  }

  if (price_from) {
    baseQuery += ` AND p.sell_price >= $${paramIndex}`;
    countQuery += ` AND p.sell_price >= $${paramIndex}`;
    queryParams.push(price_from);
    paramIndex++;
  }

  if (price_to) {
    baseQuery += ` AND p.sell_price <= $${paramIndex}`;
    countQuery += ` AND p.sell_price <= $${paramIndex}`;
    queryParams.push(price_to);
    paramIndex++;
  }

  // Add ordering
  const validOrderFields = ['name', 'sku', 'sell_price', 'stock_quantity', 'created_at', 'updated_at', 'product_id'];
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
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1
    }
  };
}

interface ShopParams {
  page: number;
  limit: number;
  search?: string;
  category_ids?: number[];
  brand_id?: number;
  price_min?: number;
  price_max?: number;
  sort_by?: string;
  sort_order?: string;
}

export async function getShopProducts(params: ShopParams) {
  const {
    page = 1,
    limit = 20,
    search,
    category_ids,
    brand_id,
    price_min,
    price_max,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = params;

  let sql = `SELECT 
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
    p.is_custom_status,
    p.custom_status,
    p.custom_status_color,
    p.created_at,
    b.name as brand_name,
    c.name as category_name,
    m.image_url as primary_media
  FROM products p
  LEFT JOIN brands b ON p.brand_id = b.brand_id
  LEFT JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN media m ON p.primary_media_id = m.media_id
  WHERE p.status IN ('on_sale', 'out_of_stock', 'custom')`;

  const queryParams: any[] = [];
  let paramCount = 0;

  // Add search filter
  if (search) {
    paramCount++;
    queryParams.push(`%${search}%`);
    sql += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR p.short_description ILIKE $${paramCount})`;
  }

  // Add multiple categories filter
  if (category_ids && category_ids.length > 0) {
    const placeholders = category_ids.map(() => `$${++paramCount}`).join(',');
    queryParams.push(...category_ids);
    sql += ` AND p.category_id IN (${placeholders})`;
  }

  // Add brand filter
  if (brand_id) {
    paramCount++;
    queryParams.push(brand_id);
    sql += ` AND p.brand_id = $${paramCount}`;
  }

  // Add price range filter
  if (price_min !== undefined) {
    paramCount++;
    queryParams.push(price_min);
    sql += ` AND p.sell_price >= $${paramCount}`;
  }

  if (price_max !== undefined) {
    paramCount++;
    queryParams.push(price_max);
    sql += ` AND p.sell_price <= $${paramCount}`;
  }

  // Get total count for pagination
  const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await db.query(countSql, queryParams);
  const totalCount = parseInt(countResult.rows[0].total) || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  // Add sorting
  const validSortFields = ['name', 'sell_price', 'created_at', 'stock_quantity'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const finalSortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
  const finalSortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';
  
  sql += ` ORDER BY p.${finalSortBy} ${finalSortOrder}`;

  // Add pagination
  const offset = (page - 1) * limit;
  paramCount++;
  queryParams.push(limit);
  paramCount++;
  queryParams.push(offset);
  sql += ` LIMIT $${paramCount - 1} OFFSET $${paramCount}`;

  const result = await db.query(sql, queryParams);
  
  return {
    products: result.rows,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  // Convert all ids to numbers and validate
  const numericIds = ids.map(id => Number(id));
  if (numericIds.some(id => isNaN(id))) {
    throw new Error('One or more product IDs are invalid');
  }
  const placeholders = numericIds.map((_, i) => `$${i + 1}`).join(',');
  const query = `
    SELECT p.product_id, p.name, m.image_url as primary_media, p.sell_price, p.offer_price, p.is_offer, p.status, p.is_custom_status, p.custom_status, p.custom_status_color, b.name as brand_name, c.name as category_name, p.short_description, p.slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN media m ON p.primary_media_id = m.media_id
    WHERE p.product_id IN (${placeholders})
  `;
  const { rows } = await db.query(query, numericIds);
  return rows;
}

// Fuzzy search for products by name, slug, or SKU
export async function fuzzySearchProducts(query: string) {
  if (!query || query.trim().length === 0) return [];
  // Use ILIKE for basic fuzzy, and similarity if pg_trgm is enabled
  // Try similarity first, fallback to ILIKE if error
  let sql = `
    SELECT p.product_id, p.name, p.slug, p.sell_price, m.image_url as primary_media
    FROM products p
    LEFT JOIN media m ON p.primary_media_id = m.media_id
    WHERE (
      p.name ILIKE $1
      OR p.slug ILIKE $1
      OR p.sku ILIKE $1
    )
    ORDER BY p.name ASC
    LIMIT 10
  `;
  const params = [`%${query}%`];
  try {
    // Try similarity if available
    const simSql = `
      SELECT p.product_id, p.name, p.slug, p.sell_price, m.image_url as primary_media
      FROM products p
      LEFT JOIN media m ON p.primary_media_id = m.media_id
      WHERE (
        similarity(p.name, $1) > 0.2
        OR similarity(p.slug, $1) > 0.2
        OR similarity(p.sku, $1) > 0.2
      )
      ORDER BY GREATEST(similarity(p.name, $1), similarity(p.slug, $1), similarity(p.sku, $1)) DESC
      LIMIT 10
    `;
    const { rows } = await db.query(simSql, [query]);
    if (rows.length > 0) return rows;
    // fallback to ILIKE if no results
  } catch (e) {
    // If pg_trgm is not enabled, fallback to ILIKE
  }
  const { rows } = await db.query(sql, params);
  return rows;
}