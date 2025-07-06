const FormData = require('form-data');
const fs = require('fs');

// Test FormData creation
const formData = new FormData();

// Add text fields
formData.append('name', 'Test Product');
formData.append('slug', 'test-product');
formData.append('sku', 'test123');
formData.append('short_description', 'Test description');
formData.append('long_description', '[]'); // Empty JSON array
formData.append('bought_price', '100');
formData.append('sell_price', '200');
formData.append('is_offer', 'true');
formData.append('offer_price', '190');
formData.append('status', 'on_sale');
formData.append('stock_quantity', '100');
formData.append('min_stock_level', '30');
formData.append('is_custom_status', 'false');
formData.append('custom_status_color', '#0000FF');
formData.append('box_number', '55');
formData.append('brand_id', '1');
formData.append('category_id', '27');
formData.append('meta_title', 'test title');
formData.append('meta_description', 'test desc');
formData.append('search_keywords', '[]'); // Empty JSON array

// Create a dummy image file
const dummyImagePath = './test-image.jpg';
if (!fs.existsSync(dummyImagePath)) {
  // Create a minimal JPEG file
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
    0x00, 0xFF, 0xD9
  ]);
  fs.writeFileSync(dummyImagePath, jpegHeader);
}

formData.append('image', fs.createReadStream(dummyImagePath));

console.log('FormData created successfully');
console.log('FormData fields:');
formData.getLength((err, length) => {
  if (err) {
    console.error('Error getting FormData length:', err);
  } else {
    console.log('FormData length:', length);
  }
});

// Test parsing the fields
const testData = {
  long_description: '[]',
  search_keywords: '[]'
};

console.log('\nTesting JSON parsing:');

// Test long_description parsing
if (testData.long_description && testData.long_description.trim() !== '') {
  try {
    const parsed = JSON.parse(testData.long_description);
    console.log('long_description parsed successfully:', parsed);
  } catch (error) {
    console.log('long_description parsing failed, treating as plain text');
  }
} else {
  console.log('long_description is empty, setting to null');
}

// Test search_keywords parsing
if (testData.search_keywords && testData.search_keywords.trim() !== '') {
  try {
    const parsed = JSON.parse(testData.search_keywords);
    console.log('search_keywords parsed successfully:', parsed);
  } catch (error) {
    if (testData.search_keywords === '[]') {
      console.log('search_keywords is "[]", setting to empty array');
    } else {
      console.log('search_keywords parsing failed, splitting by comma');
    }
  }
} else {
  console.log('search_keywords is empty, setting to empty array');
}

console.log('\nTest completed successfully!'); 