import { z } from "zod";

export const PRODUCT_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 100,
  SLUG_MIN: 3,
  SLUG_MAX: 100,
  DESC_MIN: 10,
  DESC_MAX: 3000,
  PRICE_MIN: 0.01,
  PRICE_MAX: 1000000,
  STOCK_MIN: 0,
  STOCK_MAX: 100000,
};

export const createProductSchema = z.object({
  name: z.string().min(PRODUCT_LIMITS.NAME_MIN, `Name must be at least ${PRODUCT_LIMITS.NAME_MIN} characters`).max(PRODUCT_LIMITS.NAME_MAX, `Name cannot exceed ${PRODUCT_LIMITS.NAME_MAX} characters`).trim(),
  slug: z.string().min(PRODUCT_LIMITS.SLUG_MIN, `Slug must be at least ${PRODUCT_LIMITS.SLUG_MIN} characters`).max(PRODUCT_LIMITS.SLUG_MAX, `Slug cannot exceed ${PRODUCT_LIMITS.SLUG_MAX} characters`).trim().toLowerCase(),
  description: z.string().min(PRODUCT_LIMITS.DESC_MIN, `Description must be at least ${PRODUCT_LIMITS.DESC_MIN} characters`).max(PRODUCT_LIMITS.DESC_MAX, `Description cannot exceed ${PRODUCT_LIMITS.DESC_MAX} characters`).trim(),
  category: z.string().min(1, "Please select a valid category"),
  price: z.number().min(PRODUCT_LIMITS.PRICE_MIN, `Price must be at least ${PRODUCT_LIMITS.PRICE_MIN}`).max(PRODUCT_LIMITS.PRICE_MAX, `Price cannot exceed ${PRODUCT_LIMITS.PRICE_MAX}`),
  compareAtPrice: z.number().min(0, "Compare at price cannot be negative").optional(),
  images: z.array(z.union([
    z.string().refine(s => !s.startsWith('data:'), "Image cannot be a Base64 data URI. Please upload via Cloudinary."),
    z.object({
      url: z.string().refine(s => !s.startsWith('data:'), "Image cannot be a Base64 data URI. Please upload via Cloudinary."),
      publicId: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      format: z.string().optional(),
      bytes: z.number().optional(),
    })
  ])).optional(),
  isNewArrival: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().min(PRODUCT_LIMITS.STOCK_MIN, "Stock cannot be negative").max(PRODUCT_LIMITS.STOCK_MAX, `Stock cannot exceed ${PRODUCT_LIMITS.STOCK_MAX}`).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
