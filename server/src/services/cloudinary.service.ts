import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfigStatus, CloudinaryConfigStatus } from '../config/env.js';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  optimizedUrl?: string;
}

export class CloudinaryServiceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 502, code = 'CLOUDINARY_ERROR') {
    super(message);
    this.name = 'CloudinaryServiceError';
    this.status = status;
    this.code = code;
  }
}

function configureCloudinary(): boolean {
  const status = getCloudinaryConfigStatus();
  if (status.isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    return true;
  }
  return false;
}

// Initial configuration attempt
configureCloudinary();

export const cloudinaryService = {
  getStatus(): CloudinaryConfigStatus {
    return getCloudinaryConfigStatus();
  },

  isConfigured(): boolean {
    return configureCloudinary();
  },

  /**
   * Upload an image buffer to Cloudinary
   * @param fileBuffer The image buffer from multer
   * @param folder The folder to upload to (defaults to 'mobitech/products')
   */
  async uploadImage(fileBuffer: Buffer, folder = 'mobitech/products'): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      const status = this.getStatus();
      throw new CloudinaryServiceError(
        `Cloudinary is not configured. Missing server variables: ${status.missing.join(', ')}.`,
        503,
        'STORAGE_NOT_CONFIGURED'
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new CloudinaryServiceError('Empty image file provided.', 400, 'EMPTY_FILE');
    }

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload failure:', error.message || error);
            
            // Map specific upstream Cloudinary errors
            const errMsg = error.message || '';
            const httpCode = (error as { http_code?: number }).http_code;

            if (httpCode === 401 || errMsg.toLowerCase().includes('must supply api_key') || errMsg.toLowerCase().includes('invalid api_key')) {
              reject(new CloudinaryServiceError('Cloudinary authentication failed. Please verify API credentials.', 502, 'UPSTREAM_AUTH_FAILED'));
              return;
            }

            if (httpCode === 429 || errMsg.toLowerCase().includes('rate limit')) {
              reject(new CloudinaryServiceError('Cloudinary rate limit exceeded. Please try again later.', 429, 'UPSTREAM_RATE_LIMITED'));
              return;
            }

            if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('enotfound') || errMsg.toLowerCase().includes('econnrefused')) {
              reject(new CloudinaryServiceError('Unable to reach Cloudinary image service. Please check network connectivity.', 504, 'UPSTREAM_TIMEOUT'));
              return;
            }

            reject(new CloudinaryServiceError('Failed to upload image to storage service.', 502, 'UPSTREAM_UPLOAD_FAILED'));
            return;
          }

          if (!result) {
            reject(new CloudinaryServiceError('No response returned from Cloudinary.', 502, 'UPSTREAM_NO_RESPONSE'));
            return;
          }

          // Generate delivery-optimized URL with automatic format and quality
          const optimizedUrl = cloudinary.url(result.public_id, {
            secure: true,
            fetch_format: 'auto',
            quality: 'auto',
          });

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            optimizedUrl,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  },

  /**
   * Delete an image from Cloudinary by public ID
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!this.isConfigured()) {
      return; // Silently skip if storage not configured
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
    }
  },
};
