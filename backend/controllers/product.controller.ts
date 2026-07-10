import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import { uploadBufferToCloudinary } from "../services/cloudinary.service";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "T-Shirts":     "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
  "Name Slips":   "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600",
  "Bottles":      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
  "Mugs":         "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
  "Photo Frames": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600",
  "Keychain":     "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
  "Stationery":   "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600",
  "Mobile Case":  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
};

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600";

// Parses the sizeStock field which may arrive as a JSON string (from multipart/form-data)
// or already as an object (from a JSON request body). Returns null if empty/invalid.
const parseSizeStock = (value: any): Record<string, number> | null => {
  if (value === null || value === undefined || value === "") return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const result: Record<string, number> = {};
    for (const [size, qty] of Object.entries(parsed)) {
      const n = parseInt(qty as any);
      result[size] = Number.isFinite(n) && n > 0 ? n : 0;
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
};

const processProductInstance = (product: any) => {
  if (!product) return product;
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    product.images = [CATEGORY_FALLBACK_IMAGES[product.category] || DEFAULT_FALLBACK_IMAGE];
  }
  return product;
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  const { category, search, sort, page = "1", limit = "10", minPrice, maxPrice, minRating } = req.query;

  try {
    const { products, total } = await productService.getAllProducts({
      category,
      search,
      sort,
      page: Number(page),
      limit: Number(limit),
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
    });

    const processedProducts = products.map(p => processProductInstance(p));

    res.json({
      products: processedProducts,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    next(error);
  }
};

export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  const { q } = req.query;
  try {
    const suggestions = await productService.getProductSuggestions(String(q || ""));
    if (suggestions.products && Array.isArray(suggestions.products)) {
      suggestions.products = suggestions.products.map(p => processProductInstance(p));
    }
    res.json(suggestions);
  } catch (error: any) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getSingleProduct(req.params.id);
    res.json(processProductInstance(product));
  } catch (error: any) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice !== undefined) {
      data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
    }
    if (data.stock) data.stock = parseInt(data.stock);
    if (data.rating) data.rating = parseFloat(data.rating);
    if (data.sizeStock !== undefined) {
      data.sizeStock = parseSizeStock(data.sizeStock);
      // Keep the overall stock count in sync with the sum of per-size stock
      if (data.sizeStock) {
        data.stock = Object.values(data.sizeStock).reduce((a: number, b: any) => a + Number(b), 0);
      }
    }

    if (req.file) {
      data.images = [await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype)];
    } else if (data.imageUrl) {
      data.images = [data.imageUrl];
    } else {
      data.images = data.images || [];
    }

    if ("imageUrl" in data) {
      delete data.imageUrl;
    }

    const product = await productService.createProductService(data);
    res.status(201).json(processProductInstance(product));
  } catch (error: any) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice !== undefined) {
      data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
    }
    if (data.stock !== undefined) data.stock = parseInt(data.stock);
    if (data.lowStockThreshold !== undefined) data.lowStockThreshold = parseInt(data.lowStockThreshold);
    if (data.rating) data.rating = parseFloat(data.rating);
    if (data.sizeStock !== undefined) {
      data.sizeStock = parseSizeStock(data.sizeStock);
      // Keep the overall stock count in sync with the sum of per-size stock
      if (data.sizeStock) {
        data.stock = Object.values(data.sizeStock).reduce((a: number, b: any) => a + Number(b), 0);
      }
    }

    if (req.file) {
      data.images = [await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype)];
    } else if (data.imageUrl) {
      data.images = [data.imageUrl];
    }

    if ("imageUrl" in data) {
      delete data.imageUrl;
    }

    const actorEmail = (req as any).user?.email || "Admin";
    const product = await productService.updateProductService(req.params.id, data, actorEmail);
    res.json(processProductInstance(product));
  } catch (error: any) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProductService(req.params.id);
    res.json({ message: "Product and all related records deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};

export const addReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await productService.addProductReview(userId, productId, parseInt(rating), comment);
    res.status(201).json(review);
  } catch (error: any) {
    next(error);
  }
};

export const checkCanReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    await productService.getSingleProduct(productId); // Ensure it exists
    
    // Check if user has a valid order for this product and has not reviewed yet
    const canReview = await productService.checkUserCanReview(userId, productId);
    res.json({ canReview }); 
  } catch (error: any) {
    next(error);
  }
};

export const likeReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const review = await productService.likeReviewService(reviewId, userId);
    res.json(review);
  } catch (error: any) {
    next(error);
  }
};

export const dislikeReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const review = await productService.dislikeReviewService(reviewId, userId);
    res.json(review);
  } catch (error: any) {
    next(error);
  }
};
