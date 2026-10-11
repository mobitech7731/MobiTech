import { describe, it, expect } from 'vitest';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

describe('Product Image Schema & Binary Prevention', () => {
  const baseProduct = {
    name: 'Flagship Smartphone Case',
    slug: 'flagship-smartphone-case',
    description: 'High protection case engineered with military-grade drop resistance.',
    category: '507f1f77bcf86cd799439011',
    price: 999,
  };

  it('accepts valid Cloudinary image URLs and reference objects', () => {
    const validImages = [
      'https://res.cloudinary.com/demo/image/upload/v1/mobitech/products/phone-front.jpg',
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/mobitech/products/phone-back.jpg',
        publicId: 'mobitech/products/phone-back',
        width: 1920,
        height: 1080,
      },
    ];

    const result = createProductSchema.safeParse({
      ...baseProduct,
      images: validImages,
    });

    expect(result.success).toBe(true);
  });

  it('strictly rejects raw Base64 data URIs in product image strings', () => {
    const base64ImageString = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';

    const result = createProductSchema.safeParse({
      ...baseProduct,
      images: [base64ImageString],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/cannot be a Base64 data URI/i);
    }
  });

  it('strictly rejects raw Base64 data URIs in product image objects', () => {
    const base64ImageObj = {
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      publicId: 'dummy-id',
    };

    const result = createProductSchema.safeParse({
      ...baseProduct,
      images: [base64ImageObj],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/cannot be a Base64 data URI/i);
    }
  });

  it('preserves existing images during partial product updates', () => {
    const existingImages = [
      { url: 'https://res.cloudinary.com/demo/image/upload/v1/img1.jpg', publicId: 'img1' },
      { url: 'https://res.cloudinary.com/demo/image/upload/v1/img2.jpg', publicId: 'img2' },
    ];

    // Shopkeeper updates price and name only, leaving images untouched
    const partialUpdate = {
      price: 1199,
      name: 'Flagship Smartphone Case - Updated',
    };

    const result = updateProductSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
    if (result.success) {
      // images was not provided, so existing images are preserved
      expect(result.data.images).toBeUndefined();
    }

    // Shopkeeper reorders or retains existing images
    const reorderedUpdate = {
      images: [existingImages[1], existingImages[0]],
    };
    const reorderResult = updateProductSchema.safeParse(reorderedUpdate);
    expect(reorderResult.success).toBe(true);
  });
});
