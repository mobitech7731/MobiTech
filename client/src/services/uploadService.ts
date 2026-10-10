import api from './api';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
  };
  message?: string;
}

export const uploadService = {
  async uploadImage(file: Blob | File, filename?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file, filename || 'upload.jpg');

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
