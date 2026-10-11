import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Locate and load .env file from common repository locations
const potentialEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

let loadedEnvPath: string | null = null;
for (const envPath of potentialEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedEnvPath = envPath;
    break;
  }
}

// Fallback to default dotenv lookup if no explicit file was found
if (!loadedEnvPath) {
  dotenv.config();
}

export interface CloudinaryConfigStatus {
  isConfigured: boolean;
  missing: string[];
  cloudName?: string;
}

/**
 * Check Cloudinary credentials status without revealing secrets.
 */
export function getCloudinaryConfigStatus(): CloudinaryConfigStatus {
  const missing: string[] = [];

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missing.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');

  return {
    isConfigured: missing.length === 0,
    missing,
    cloudName: cloudName ? cloudName : undefined,
  };
}

/**
 * Validate essential server configuration on startup safely.
 * Returns an array of diagnostic warnings or errors.
 */
export function validateStartupConfig(): { valid: boolean; warnings: string[]; errors: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.JWT_SECRET?.trim()) {
    errors.push('JWT_SECRET is required for authentication.');
  }

  if (!process.env.MONGODB_URI?.trim()) {
    warnings.push('MONGODB_URI is not set. Database connection may fail.');
  }

  const cloudinaryStatus = getCloudinaryConfigStatus();
  if (!cloudinaryStatus.isConfigured) {
    warnings.push(
      `Cloudinary image storage is unconfigured. Missing: ${cloudinaryStatus.missing.join(', ')}. Image uploads will return 503.`
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
