import { Request, Response } from "express";
import * as productService from "../services/productService";
import { AuthRequest } from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";

export async function listProducts(req: Request, res: Response) {
  try {
    const products = await productService.listProducts(req.query);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getPaginatedProducts(req: Request, res: Response) {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      searchBy = "name",
      brand,
      categoryid,
      status,
      orderBy = "created_at",
      orderDirection = "DESC"
    } = req.query;

    const params: any = {
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      searchBy: String(searchBy),
      orderBy: String(orderBy),
      orderDirection: String(orderDirection)
    };

    // Only add optional properties if they have values
    if (brand !== undefined) {
      params.brand = Number(brand);
    }
    if (categoryid !== undefined) {
      params.categoryid = Number(categoryid);
    }
    if (status !== undefined) {
      params.status = String(status);
    }

    const result = await productService.getPaginatedProducts(params);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await productService.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getProductShortInfo(req: Request, res: Response) {
  try {
    const product = await productService.getProductShortInfo(Number(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    let productData = req.body;
    
    // If content-type is multipart/form-data, parse the fields
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle FormData - fields are already parsed by multer
      productData = req.body;
      
      // Parse JSON fields if they exist and are not empty
      if (productData.long_description && productData.long_description.trim() !== '') {
        try {
          productData.long_description = JSON.parse(productData.long_description);
        } catch (error) {
          // If parsing fails, treat it as plain text
          productData.long_description = productData.long_description;
        }
      } else {
        productData.long_description = null;
      }
      
      // Handle search_keywords parsing - be more careful with this
      if (productData.search_keywords !== undefined) {
        // If it's already an array, use it as is
        if (Array.isArray(productData.search_keywords)) {
          // Do nothing, it's already an array
        }
        // If it's a string, try to parse it
        else if (typeof productData.search_keywords === 'string') {
          const trimmed = productData.search_keywords.trim();
          if (trimmed === '' || trimmed === '[]') {
            productData.search_keywords = [];
          } else {
            try {
              productData.search_keywords = JSON.parse(trimmed);
            } catch (error) {
              console.error('Error parsing search_keywords:', error, 'Value:', trimmed);
              // If parsing fails, try to split by comma
              productData.search_keywords = trimmed.split(',').map((kw: string) => kw.trim()).filter((kw: string) => kw.length > 0);
            }
          }
        }
        // If it's undefined or null, set to empty array
        else {
          productData.search_keywords = [];
        }
      } else {
        productData.search_keywords = [];
      }
    }
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    let product = await productService.createProduct(productData, userId, imagePath);
    
    // Rename the uploaded file to use SKU-based naming
    if (req.file && product.sku) {
      try {
        const uploadDir = path.join(process.cwd(), "dist", "uploads");
        const oldPath = path.join(uploadDir, req.file.filename);
        const fileExtension = path.extname(req.file.originalname);
        
        // Check if files with this SKU already exist to determine the number
        const files = fs.readdirSync(uploadDir).filter(f => f.startsWith(product.sku + '-'));
        const nextNumber = files.length + 1;
        
        const newFilename = `${product.sku}-${nextNumber}${fileExtension}`;
        const newPath = path.join(uploadDir, newFilename);
        
        // Rename the file
        fs.renameSync(oldPath, newPath);
        
        // Update the product's image_url in the DB to the new path
        product = await productService.updateProduct(product.product_id, {
          primary_media_id: product.primary_media_id,
          image_url: `/uploads/${newFilename}`
        }, userId);
      } catch (error) {
        console.error('Error renaming file:', error);
      }
    }
    
    return res.status(201).json(product);
  } catch (err: any) {
    console.error('Create product error:', err);
    return res.status(400).json({ error: err.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    let updateData = req.body;
    
    // If content-type is multipart/form-data, parse the fields
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle FormData - fields are already parsed by multer
      updateData = req.body;
      
      // Parse JSON fields if they exist and are not empty
      if (updateData.long_description && updateData.long_description.trim() !== '') {
        try {
          updateData.long_description = JSON.parse(updateData.long_description);
        } catch (error) {
          // If parsing fails, treat it as plain text
          updateData.long_description = updateData.long_description;
        }
      } else {
        updateData.long_description = null;
      }
      
      // Handle search_keywords parsing - be more careful with this
      if (updateData.search_keywords !== undefined) {
        // If it's already an array, use it as is
        if (Array.isArray(updateData.search_keywords)) {
          // Do nothing, it's already an array
        }
        // If it's a string, try to parse it
        else if (typeof updateData.search_keywords === 'string') {
          const trimmed = updateData.search_keywords.trim();
          if (trimmed === '' || trimmed === '[]') {
            updateData.search_keywords = [];
          } else {
            try {
              updateData.search_keywords = JSON.parse(trimmed);
            } catch (error) {
              console.error('Error parsing search_keywords:', error, 'Value:', trimmed);
              // If parsing fails, try to split by comma
              updateData.search_keywords = trimmed.split(',').map((kw: string) => kw.trim()).filter((kw: string) => kw.length > 0);
            }
          }
        }
        // If it's undefined or null, set to empty array
        else {
          updateData.search_keywords = [];
        }
      } else {
        updateData.search_keywords = [];
      }
    }
    
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const product = await productService.updateProduct(Number(req.params.id), updateData, userId);
    return res.json(product);
  } catch (err: any) {
    console.error('Update product error:', err);
    return res.status(400).json({ error: err.message });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    await productService.deleteProduct(Number(req.params.id));
    return res.status(204).send();
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function addProductMedia(req: AuthRequest, res: Response) {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    let media = await productService.addProductMedia(Number(req.params.id), req.body, userId, imagePath);
    
    // Rename the uploaded file to use SKU-based naming
    if (req.file) {
      try {
        const product = await productService.getProductById(Number(req.params.id));
        if (product && product.sku) {
          const uploadDir = path.join(process.cwd(), "dist", "uploads");
          const oldPath = path.join(uploadDir, req.file.filename);
          const fileExtension = path.extname(req.file.originalname);
          
          // Check if files with this SKU already exist to determine the number
          const files = fs.readdirSync(uploadDir).filter(f => f.startsWith(product.sku + '-'));
          const nextNumber = files.length + 1;
          
          const newFilename = `${product.sku}-${nextNumber}${fileExtension}`;
          const newPath = path.join(uploadDir, newFilename);
          
          // Rename the file
          fs.renameSync(oldPath, newPath);
          
          // Update the media record with the new filename
          media = await productService.updateProductMedia(media.media_id, {
            image_url: `/uploads/${newFilename}`
          });
        }
      } catch (error) {
        console.error('Error renaming media file:', error);
      }
    }
    
    return res.status(201).json(media);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function deleteProductMedia(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await productService.deleteProductMedia(Number(req.params.id), Number(req.params.mediaId), userId);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function generateSKU(req: Request, res: Response) {
  try {
    const sku = await productService.generateUniqueSKU();
    return res.json({ sku });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
} 