import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const cloudinaryService = {
  isConfigured(): boolean {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  },

  /**
   * Upload an image buffer to Cloudinary
   * @param fileBuffer The image buffer from multer
   * @param folder The folder to upload to (e.g. 'mobitech/products')
   */
  async uploadImage(fileBuffer: Buffer, folder: string = 'mobitech/products') {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary is not configured. Please add CLOUDINARY credentials to your .env file.');
    }

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload image to Cloudinary'));
            return;
          }
          if (!result) {
            reject(new Error('No result from Cloudinary'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
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
      return; // Do nothing if not configured
    }
    
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
      // We don't throw here to prevent orphaned asset cleanup from breaking normal flows
    }
  }
};
