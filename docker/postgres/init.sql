--
-- PostgreSQL E-commerce Database Schema
-- Version 2.1
--
-- This script contains the complete DDL (Data Definition Language)
-- to set up the database structure for the electronics e-commerce website.
--

-- =============================================================================
-- SECTION 1: HELPER FUNCTIONS & EXTENSIONS
-- =============================================================================

-- A function to automatically update the `updated_at` timestamp on row modification.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SECTION 2: ENUMERATED TYPES (Custom Data Types)
-- =============================================================================

-- Using ENUM types provides data integrity and is more efficient than string checks.

CREATE TYPE product_status AS ENUM ('on_sale', 'out_of_stock', 'pre_order', 'discontinued', 'custom');
CREATE TYPE document_type AS ENUM ('manual', 'datasheet', 'warranty', 'other');
CREATE TYPE discount_type AS ENUM('fixed', 'percentage');
CREATE TYPE discount_scope AS ENUM('all', 'categories', 'products', 'brands');
CREATE TYPE order_status AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_option AS ENUM('cash_on_delivery', 'wallet', 'insta_pay', 'card');
CREATE TYPE inventory_transaction_type AS ENUM('in', 'out', 'adjustment');
CREATE TYPE inventory_reference_type AS ENUM('purchase', 'sale', 'return', 'manual_adjustment');


-- =============================================================================
-- SECTION 3: CORE TABLES (Users, Roles, Products, etc.)
-- =============================================================================

-- User Roles (e.g., admin, staff, customer)
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB -- e.g., {"products": ["create", "update"], "orders": ["read"]}
);

-- Users Table
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    password_hash TEXT NOT NULL, -- Never store plain text passwords
    role_id INT NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Categories Table (with support for sub-categories)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    parent_id INT, -- For sub-categories
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Brands Table
CREATE TABLE brands (
    brand_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL
);

-- Products Table
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    short_description TEXT,
    
    -- Using JSONB for structured content. It's perfect for embedding rich media like
    -- text blocks, tables, lists, or video IDs, e.g.,
    -- [{"type": "paragraph", "content": "..."}, {"type": "video", "provider": "youtube", "id": "video_id"}]
    long_description JSONB,

    -- Modified pricing fields
    bought_price NUMERIC(10, 2),
    sell_price NUMERIC(10, 2) NOT NULL,
    is_offer BOOLEAN DEFAULT FALSE,
    offer_price NUMERIC(10, 2),

    status product_status NOT NULL DEFAULT 'on_sale',
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 0,
    
    -- New custom status fields
    is_custom_status BOOLEAN DEFAULT FALSE,
    custom_status VARCHAR(100),
    custom_status_color VARCHAR(7), -- e.g., '#FF5733'

    -- New field for box/shelf location
    box_number VARCHAR(100),

    brand_id INT,
    category_id INT,
    
    meta_title VARCHAR(255),
    meta_description TEXT,
    search_keywords TEXT[], -- Array of keywords for easier searching
    
    primary_media_id BIGINT, -- To be linked after media insertion
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Many-to-Many table for recommended products
CREATE TABLE product_recommendations (
    product_id BIGINT NOT NULL,
    recommended_product_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, recommended_product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Media assets for products (images, videos)
CREATE TABLE media (
    media_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- We can now add the foreign key constraint back to the products table
-- This avoids a circular dependency issue during table creation.
ALTER TABLE products ADD CONSTRAINT fk_primary_media FOREIGN KEY (primary_media_id) REFERENCES media(media_id) ON DELETE SET NULL;

-- Document assets for products (manuals, datasheets)
CREATE TABLE documents (
    document_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb INT,
    type document_type NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);


-- =============================================================================
-- SECTION 3.5: HOMEPAGE & FEATURE TABLES
-- =============================================================================

-- Table to manage Best Seller products
CREATE TABLE best_sellers (
    id SERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Table to manage New Arrival products
CREATE TABLE new_arrivals (
    id SERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Table to manage Featured products
CREATE TABLE featured_products (
    id SERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);


-- =============================================================================
-- SECTION 4: E-COMMERCE LOGIC TABLES (Carts, Orders, Discounts)
-- =============================================================================

-- Discounts Table
CREATE TABLE discounts (
    discount_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type discount_type NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    
    minimum_order_amount NUMERIC(10, 2),
    maximum_discount_amount NUMERIC(10, 2),
    usage_limit INT,
    usage_limit_per_user INT DEFAULT 1,
    
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    applies_to discount_scope DEFAULT 'all',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Sharable Carts Table
CREATE TABLE carts (
    cart_id BIGSERIAL PRIMARY KEY,
    shareable_code VARCHAR(6) UNIQUE NOT NULL,
    user_id BIGINT,
    -- Storing product IDs and quantities in JSONB.
    -- e.g., {"prod_123": 2, "prod_456": 1}
    products JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT, -- Can be NULL for guest checkouts
    
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_amount NUMERIC(10, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_option payment_option, -- New payment option field

    -- Storing addresses as JSONB creates an immutable record for that specific order
    billing_address JSONB,
    shipping_address JSONB,

    -- Storing items as JSONB for an immutable record. Store more than just quantity!
    -- e.g., [{"product_id": 123, "name": "...", "quantity": 1, "price_at_purchase": 999.99}]
    order_items JSONB NOT NULL,
    
    customer_notes TEXT,
    admin_notes TEXT,
    
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Discount Usage Tracking Table
CREATE TABLE discount_usage (
    usage_id BIGSERIAL PRIMARY KEY,
    discount_id INT NOT NULL,
    order_id BIGINT NOT NULL,
    user_id BIGINT, -- Can be null for guest users
    discount_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (discount_id) REFERENCES discounts(discount_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


-- =============================================================================
-- SECTION 5: LOGGING AND AUDITING TABLES
-- =============================================================================

-- Inventory Transactions Table
CREATE TABLE inventory_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    -- Modified to use JSONB for logging multiple product changes in one transaction.
    -- e.g., [{"product_id": 1, "quantity_change": -2, "reason": "Sale"}, 
    --         {"product_id": 5, "quantity_change": 50, "reason": "Stock Arrival"}]
    products_log JSONB NOT NULL,
    
    type inventory_transaction_type NOT NULL,
    reference_type inventory_reference_type NOT NULL,
    reference_id BIGINT, -- e.g., order_id, purchase_order_id
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT, -- user_id of the staff/admin
    
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- General Activity Logs for auditing changes across the system
CREATE TABLE activity_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT, -- The user who performed the action
    action VARCHAR(100) NOT NULL, -- e.g., 'PRODUCT_CREATE', 'ORDER_STATUS_UPDATE'
    entity_type VARCHAR(50), -- e.g., 'product', 'order', 'user'
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET, -- Use the INET type for IP addresses
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);


-- =============================================================================
-- SECTION 6: INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes on Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- Indexes on Categories & Brands
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_brands_slug ON brands(slug);

-- Indexes on Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sell_price ON products(sell_price);
-- A GIN index is great for searching within text arrays
CREATE INDEX idx_products_search_keywords ON products USING GIN(search_keywords);
-- A GIN index on JSONB can speed up queries on specific keys
CREATE INDEX idx_products_long_description ON products USING GIN(long_description);

-- Indexes on Feature Tables
CREATE INDEX idx_best_sellers_product_id ON best_sellers(product_id);
CREATE INDEX idx_new_arrivals_product_id ON new_arrivals(product_id);
CREATE INDEX idx_featured_products_product_id ON featured_products(product_id);

-- Indexes on Discounts
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active_dates ON discounts(is_active, start_date, end_date);

-- Indexes on Carts
CREATE INDEX idx_carts_user_id ON carts(user_id);

-- Indexes on Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Indexes on Discount Usage
CREATE INDEX idx_discount_usage_user ON discount_usage(discount_id, user_id);

-- Indexes on Logs
CREATE INDEX idx_inventory_transactions_ref ON inventory_transactions(reference_type, reference_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);


-- =============================================================================
-- SECTION 7: TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================

CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_carts_timestamp
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- =============================================================================
-- End of Schema
-- =============================================================================
