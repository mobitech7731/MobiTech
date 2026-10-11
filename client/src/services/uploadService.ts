import { isAxiosError } from 'axios';
import api from './api';

export interface UploadResponseData {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  optimizedUrl?: string;
}

export interface UploadResponse {
  success: boolean;
  data: UploadResponseData;
  message?: string;
  code?: string;
  details?: {
    missing?: string[];
  };
}

export class UploadError extends Error {
  status?: number;
  code?: string;
  details?: { missing?: string[] };

  constructor(message: string, status?: number, code?: string, details?: { missing?: string[] }) {
    super(message);
    this.name = 'UploadError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const uploadService = {
  async uploadImage(file: Blob | File, filename?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file, filename || (file instanceof File ? file.name : 'upload.jpg'));

    try {
      const response = await api.post<UploadResponse>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string; code?: string; details?: { missing?: string[] } } | undefined;

        let message = data?.message || err.message;
        const code = data?.code;

        if (status === 503 && code === 'STORAGE_NOT_CONFIGURED') {
          message = 'Cloudinary image storage is not configured on the server. Please add CLOUDINARY credentials to server/.env.';
        } else if (status === 413) {
          message = 'The image file exceeds the 5MB upload limit. Please select a smaller photo.';
        } else if (status === 415) {
          message = 'Unsupported file format. Please upload JPEG, PNG, or WEBP.';
        } else if (status === 401) {
          message = 'Admin authorization required. Please log in again to upload photos.';
        } else if (status === 502 || status === 504) {
          message = 'Unable to reach the Cloudinary image service. Please check your network connection and retry.';
        } else if (!err.response) {
          message = 'Network error: Unable to contact the backend server.';
        }

        throw new UploadError(message, status, code, data?.details);
      }

      throw new UploadError(err instanceof Error ? err.message : 'Failed to upload image.');
    }
  },
};
