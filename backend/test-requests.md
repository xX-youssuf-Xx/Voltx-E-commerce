# VoltX Backend API Test Requests

## Base URL
```
http://localhost:3005/api
```

## Authentication
For protected endpoints, include the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📦 PRODUCTS

### 1. Create Product
```http
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Form Data:
- name: "iPhone 15 Pro Max"
- slug: "iphone-15-pro-max"
- sku: "IPH15PM-256-BLK"
- short_description: "Latest iPhone with A17 Pro chip and titanium design"
- sell_price: 1199.99
- status: "on_sale"
- stock_quantity: 50
- brand_id: 1
- category_id: 1
- image: [file upload]
```

### 2. Create Product (Laptop)
```http
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Form Data:
- name: "MacBook Pro 14-inch"
- slug: "macbook-pro-14-inch"
- sku: "MBP14-M2-512-SP"
- short_description: "Powerful laptop with M2 Pro chip and Liquid Retina XDR display"
- sell_price: 1999.99
- status: "on_sale"
- stock_quantity: 25
- brand_id: 1
- category_id: 2
- image: [file upload]
```

### 3. Create Product (Accessory)
```http
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Form Data:
- name: "AirPods Pro 2nd Generation"
- slug: "airpods-pro-2nd-gen"
- sku: "APP2-WHITE"
- short_description: "Wireless earbuds with active noise cancellation and spatial audio"
- sell_price: 249.99
- status: "on_sale"
- stock_quantity: 100
- brand_id: 1
- category_id: 3
- image: [file upload]
```

### 4. Update Product (Partial Update)
```http
PUT /api/products/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "sell_price": 1099.99,
  "stock_quantity": 45,
  "status": "on_sale"
}
```

### 5. Update Product (More Fields)
```http
PUT /api/products/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "iPhone 15 Pro Max - Updated",
  "short_description": "Updated description with new features",
  "sell_price": 1149.99,
  "is_offer": true,
  "offer_price": 1049.99,
  "box_number": "A1-B2-C3"
}
```

### 6. Get Product Short Info
```http
GET /api/products/1/short
```

### 7. List Products with Filters
```http
GET /api/products?brand=1&categoryid=1&price_from=1000&price_to=2000
```

---

## 🏷️ BRANDS

### 1. Create Brand (Apple)
```http
POST /api/brands
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Apple",
  "slug": "apple"
}
```

### 2. Create Brand (Samsung)
```http
POST /api/brands
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Samsung",
  "slug": "samsung"
}
```

### 3. Create Brand (Sony)
```http
POST /api/brands
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Sony",
  "slug": "sony"
}
```

### 4. Update Brand (Partial Update)
```http
PUT /api/brands/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Apple Inc."
}
```

### 5. List Brands with Search
```http
GET /api/brands?search=apple
```

### 6. Get Brand by ID
```http
GET /api/brands/1
```

---

## 📂 CATEGORIES

### 1. Create Category (Smartphones)
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Smartphones",
  "slug": "smartphones"
}
```

### 2. Create Category (Laptops)
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Laptops",
  "slug": "laptops"
}
```

### 3. Create Subcategory (iPhone)
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "iPhone",
  "slug": "iphone",
  "parent_id": 1
}
```

### 4. Create Category (Accessories)
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Accessories",
  "slug": "accessories"
}
```

### 5. Update Category (Partial Update)
```http
PUT /api/categories/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Mobile Phones"
}
```

### 6. List Categories with Filters
```http
GET /api/categories?search=phone&parent_id=1
```

### 7. Get Category by ID
```http
GET /api/categories/1
```

---

## 🔧 TESTING WITH CURL

### Create a Brand
```bash
curl -X POST http://localhost:3005/api/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Apple",
    "slug": "apple"
  }'
```

### Create a Category
```bash
curl -X POST http://localhost:3005/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Smartphones",
    "slug": "smartphones"
  }'
```

### Create a Product (using form-data)
```bash
curl -X POST http://localhost:3005/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=iPhone 15 Pro Max" \
  -F "slug=iphone-15-pro-max" \
  -F "sku=IPH15PM-256-BLK" \
  -F "short_description=Latest iPhone with A17 Pro chip" \
  -F "sell_price=1199.99" \
  -F "status=on_sale" \
  -F "stock_quantity=50" \
  -F "brand_id=1" \
  -F "category_id=1" \
  -F "image=@/path/to/image.jpg"
```

### Update Product (Partial)
```bash
curl -X PUT http://localhost:3005/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sell_price": 1099.99,
    "stock_quantity": 45
  }'
```

### Get Product Short Info
```bash
curl -X GET http://localhost:3005/api/products/1/short
```

---

## 📝 NOTES

1. **File Uploads**: For products, use `multipart/form-data` and include the image file
2. **Partial Updates**: Only send the fields you want to update
3. **Authentication**: Replace `YOUR_TOKEN` with actual JWT token from login
4. **IDs**: Use actual IDs returned from create operations
5. **Validation**: All endpoints include proper validation and error handling

## 🚀 Quick Test Sequence

1. Create brands first
2. Create categories 
3. Create products (using brand and category IDs)
4. Test partial updates
5. Test short info endpoint
6. Test list endpoints with filters 