import { describe, it, expect } from 'vitest';
import { createProductSchema, PRODUCT_LIMITS } from '../validators/product.validator';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

describe('Product Validation Pipeline', () => {
  const validProduct = {
    name: 'Samsung Galaxy S24',
    slug: 'samsung-galaxy-s24',
    description: 'The latest Samsung smartphone with AI features.',
    category: new mongoose.Types.ObjectId().toString(),
    price: 999.99,
    stockQuantity: 50,
  };

  describe('Zod Schema Constraints', () => {
    it('should validate a correct product', () => {
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should enforce name length limits', () => {
      const tooShort = { ...validProduct, name: 'AB' };
      const shortResult = createProductSchema.safeParse(tooShort);
      expect(shortResult.success).toBe(false);
      if (!shortResult.success) {
        expect(shortResult.error.errors[0].message).toContain(`at least ${PRODUCT_LIMITS.NAME_MIN}`);
      }

      const tooLong = { ...validProduct, name: 'A'.repeat(PRODUCT_LIMITS.NAME_MAX + 1) };
      const longResult = createProductSchema.safeParse(tooLong);
      expect(longResult.success).toBe(false);
    });

    it('should enforce price limits', () => {
      const negativePrice = { ...validProduct, price: -10 };
      const negResult = createProductSchema.safeParse(negativePrice);
      expect(negResult.success).toBe(false);

      const hugePrice = { ...validProduct, price: PRODUCT_LIMITS.PRICE_MAX + 1 };
      const hugeResult = createProductSchema.safeParse(hugePrice);
      expect(hugeResult.success).toBe(false);
    });

    it('should enforce stock limits', () => {
      const negativeStock = { ...validProduct, stockQuantity: -5 };
      const negResult = createProductSchema.safeParse(negativeStock);
      expect(negResult.success).toBe(false);

      const hugeStock = { ...validProduct, stockQuantity: PRODUCT_LIMITS.STOCK_MAX + 1 };
      const hugeResult = createProductSchema.safeParse(hugeStock);
      expect(hugeResult.success).toBe(false);
    });
  });

  describe('Mongoose Schema Constraints', () => {
    it('should align Mongoose required fields and limits with Zod', () => {
      interface SchemaPathOptions {
        options?: {
          minlength?: number;
          maxlength?: number;
          min?: number;
          max?: number;
        };
      }

      const paths = Product.schema.paths;
      
      // Name
      expect(paths.name.isRequired).toBe(true);
      expect((paths.name as unknown as SchemaPathOptions).options?.minlength).toBe(PRODUCT_LIMITS.NAME_MIN);
      expect((paths.name as unknown as SchemaPathOptions).options?.maxlength).toBe(PRODUCT_LIMITS.NAME_MAX);
      
      // Slug
      expect(paths.slug.isRequired).toBe(true);
      expect((paths.slug as unknown as SchemaPathOptions).options?.minlength).toBe(PRODUCT_LIMITS.SLUG_MIN);
      
      // Price
      expect(paths.price.isRequired).toBe(true);
      expect((paths.price as unknown as SchemaPathOptions).options?.min).toBe(PRODUCT_LIMITS.PRICE_MIN);
      expect((paths.price as unknown as SchemaPathOptions).options?.max).toBe(PRODUCT_LIMITS.PRICE_MAX);
      
      // Stock
      expect((paths.stockQuantity as unknown as SchemaPathOptions).options?.min).toBe(PRODUCT_LIMITS.STOCK_MIN);
      expect((paths.stockQuantity as unknown as SchemaPathOptions).options?.max).toBe(PRODUCT_LIMITS.STOCK_MAX);
    });
  });
});
