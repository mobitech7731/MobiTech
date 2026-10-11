import { describe, it, expect } from 'vitest';
import { isValidImageBuffer } from './imageValidation.js';

describe('isValidImageBuffer', () => {
  it('validates authentic JPEG magic bytes', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const result = isValidImageBuffer(jpegBuffer);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('jpeg');
  });

  it('validates authentic PNG magic bytes', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const result = isValidImageBuffer(pngBuffer);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('png');
  });

  it('validates authentic WebP magic bytes', () => {
    // RIFF....WEBP
    const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
    const result = isValidImageBuffer(webpBuffer);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('webp');
  });

  it('rejects text and random binary data pretending to be an image', () => {
    const textBuffer = Buffer.from('This is not an image file at all.');
    const result = isValidImageBuffer(textBuffer);
    expect(result.valid).toBe(false);
  });

  it('rejects truncated buffers (< 12 bytes)', () => {
    const tinyBuffer = Buffer.from([0xff, 0xd8]);
    const result = isValidImageBuffer(tinyBuffer);
    expect(result.valid).toBe(false);
  });
});
