import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import uploadRoutes from './upload.js';
import { cloudinaryService } from '../services/cloudinary.service.js';
import { authMiddleware } from '../middleware/auth.js';

// Mock auth middleware to let us bypass real JWT auth
vi.mock('../middleware/auth.js', () => ({
  authMiddleware: vi.fn((req, res, next) => {
    if (req.headers.authorization === 'Bearer admin-token') {
      req.user = { id: 'admin123', role: 'admin' };
      next();
    } else {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }),
}));

// Mock cloudinaryService
vi.mock('../services/cloudinary.service.js', () => ({
  cloudinaryService: {
    isConfigured: vi.fn(),
    uploadImage: vi.fn(),
    deleteImage: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/upload', uploadRoutes);
// Standard error handler for express tests
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

describe('POST /api/upload/image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails if no auth token provided', async () => {
    const res = await request(app).post('/api/upload/image');
    expect(res.status).toBe(401);
  });

  it('fails if cloudinary is not configured', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(false);
    
    // We send a dummy file, but no file is also caught first if multer processes it.
    // Actually multer processes it first, so let's send a valid file
    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', Buffer.from('dummy image'), { filename: 'test.png', contentType: 'image/png' });
    
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/configuration is missing/);
  });

  it('fails on unsupported file types', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', Buffer.from('dummy text'), { filename: 'test.txt', contentType: 'text/plain' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Unsupported file format/);
  });

  it('fails on large files (>5MB)', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);

    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', largeBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too large/i);
  });

  it('successfully mocks upload', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);
    vi.mocked(cloudinaryService.uploadImage).mockResolvedValue({
      url: 'https://res.cloudinary.com/test/image/upload/v1/mobitech/products/test.jpg',
      publicId: 'mobitech/products/test',
    });

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', Buffer.from('dummy image'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('https://res.cloudinary.com/test/image/upload/v1/mobitech/products/test.jpg');
    expect(res.body.data.publicId).toBe('mobitech/products/test');
  });

  it('fails safely if cloudinary upload fails', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);
    vi.mocked(cloudinaryService.uploadImage).mockRejectedValue(new Error('Cloudinary error'));

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', Buffer.from('dummy image'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    expect(res.status).toBe(500); // Standard express error handler catches the unhandled rejection
  });
});
