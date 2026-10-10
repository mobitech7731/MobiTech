import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service.js";
import { Category } from "../models/Category.js";
import { createProductSchema, updateProductSchema } from "../validators/product.validator.js";

export const productController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
      const search = (req.query.search as string) || undefined;
      const category = (req.query.category as string) || undefined;
      const sort = (req.query.sort as string) || undefined;
      const inStockParam = req.query.inStock as string | undefined;
      const inStock = inStockParam === "true" ? true : inStockParam === "false" ? false : undefined;
      
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const priceRanges = req.query.priceRanges as string | undefined;

      const result = await productService.list({ page, limit, search, category, sort, inStock, status: "active", minPrice, maxPrice, priceRanges });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async adminList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string) || undefined;
      const category = (req.query.category as string) || undefined;
      const sort = (req.query.sort as string) || undefined;
      const inStockParam = req.query.inStock as string | undefined;
      const inStock = inStockParam === "true" ? true : inStockParam === "false" ? false : undefined;
      
      const statusParam = (req.query.status as string) || "all";
      const status = ["all", "active", "inactive"].includes(statusParam) 
        ? (statusParam as "all" | "active" | "inactive") 
        : "all";

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const priceRanges = req.query.priceRanges as string | undefined;

      const result = await productService.list({ page, limit, search, category, sort, inStock, status, minPrice, maxPrice, priceRanges });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getBySlug(req.params.slug);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getFeatured();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getTrending();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  async getBestSellers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getBestSellers();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  async getNew(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getNew();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
        return;
      }
      // Verify category exists
      const category = await Category.findById(parsed.data.category);
      if (!category) {
        res.status(400).json({ success: false, message: "Invalid category ID" });
        return;
      }
      const product = await productService.create(parsed.data);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
        return;
      }
      if (parsed.data.category) {
        const category = await Category.findById(parsed.data.category);
        if (!category) {
          res.status(400).json({ success: false, message: "Invalid category ID" });
          return;
        }
      }
      const product = await productService.update(req.params.id, parsed.data);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.delete(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, message: "Product deleted" });
    } catch (err) {
      next(err);
    }
  },
};
