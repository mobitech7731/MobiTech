import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCloudinaryConfigStatus, validateStartupConfig } from './env.js';

describe('Environment Configuration & Validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('detects when Cloudinary credentials are fully missing', () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const status = getCloudinaryConfigStatus();
    expect(status.isConfigured).toBe(false);
    expect(status.missing).toContain('CLOUDINARY_CLOUD_NAME');
    expect(status.missing).toContain('CLOUDINARY_API_KEY');
    expect(status.missing).toContain('CLOUDINARY_API_SECRET');
  });

  it('detects when Cloudinary credentials are only partially configured or whitespace', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'my-cloud';
    process.env.CLOUDINARY_API_KEY = '   ';
    delete process.env.CLOUDINARY_API_SECRET;

    const status = getCloudinaryConfigStatus();
    expect(status.isConfigured).toBe(false);
    expect(status.missing).toContain('CLOUDINARY_API_KEY');
    expect(status.missing).toContain('CLOUDINARY_API_SECRET');
    expect(status.missing).not.toContain('CLOUDINARY_CLOUD_NAME');
  });

  it('reports isConfigured: true when all three variables are present', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'valid-cloud';
    process.env.CLOUDINARY_API_KEY = 'valid-key';
    process.env.CLOUDINARY_API_SECRET = 'valid-secret';

    const status = getCloudinaryConfigStatus();
    expect(status.isConfigured).toBe(true);
    expect(status.missing).toHaveLength(0);
    expect(status.cloudName).toBe('valid-cloud');
    // Ensure API secret and key are NEVER in the status object
    expect((status as unknown as Record<string, unknown>).apiKey).toBeUndefined();
    expect((status as unknown as Record<string, unknown>).apiSecret).toBeUndefined();
  });

  it('flags missing JWT_SECRET as a critical error on startup', () => {
    delete process.env.JWT_SECRET;
    const check = validateStartupConfig();
    expect(check.valid).toBe(false);
    expect(check.errors.some(e => e.includes('JWT_SECRET'))).toBe(true);
  });

  it('flags unconfigured Cloudinary as a startup warning rather than an unhandled crash', () => {
    process.env.JWT_SECRET = 'supersecretkey12345678901234567890';
    delete process.env.CLOUDINARY_CLOUD_NAME;

    const check = validateStartupConfig();
    expect(check.valid).toBe(true); // Server can still boot for other operations
    expect(check.warnings.some(w => w.includes('Cloudinary'))).toBe(true);
  });
});
