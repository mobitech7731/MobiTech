import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim().toLowerCase(),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category ID is required"),
  price: z.number().min(0, "Price must be >= 0"),
  compareAtPrice: z.number().min(0).optional(),
  images: z.array(z.union([
    z.string(),
    z.object({
      url: z.string(),
      publicId: z.string().optional()
    })
  ])).optional(),
  isNewArrival: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
