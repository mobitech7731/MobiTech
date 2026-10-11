import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import uploadRoutes from './upload.js';
import { cloudinaryService, CloudinaryServiceError } from '../services/cloudinary.service.js';

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
vi.mock('../services/cloudinary.service.js', () => {
  class MockCloudinaryServiceError extends Error {
    status: number;
    code: string;
    constructor(message: string, status = 502, code = 'CLOUDINARY_ERROR') {
      super(message);
      this.name = 'CloudinaryServiceError';
      this.status = status;
      this.code = code;
    }
  }

  return {
    CloudinaryServiceError: MockCloudinaryServiceError,
    cloudinaryService: {
      isConfigured: vi.fn(),
      getStatus: vi.fn(),
      uploadImage: vi.fn(),
      deleteImage: vi.fn(),
    },
  };
});

const app = express();
app.use(express.json());
app.use('/api/upload', uploadRoutes);
// Standard error handler for express tests
app.use((err: { status?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

// Authentic valid JPEG header buffer
const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x00, 0x00]);

describe('POST /api/upload/image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails if no auth token provided', async () => {
    const res = await request(app).post('/api/upload/image');
    expect(res.status).toBe(401);
  });

  it('fails with 503 and clear diagnostics if Cloudinary is not configured', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(false);
    vi.mocked(cloudinaryService.getStatus).mockReturnValue({
      isConfigured: false,
      missing: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
    });

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', validJpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(503);
    expect(res.body.code).toBe('STORAGE_NOT_CONFIGURED');
    expect(res.body.message).toMatch(/not configured/i);
    expect(res.body.details?.missing).toContain('CLOUDINARY_CLOUD_NAME');
  });

  it('fails with 415 on unsupported file types', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', Buffer.from('plain text file'), { filename: 'test.txt', contentType: 'text/plain' });

    expect(res.status).toBe(415);
    expect(res.body.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    expect(res.body.message).toMatch(/Unsupported file format/);
  });

  it('fails with 400 when file extension is image but magic bytes are invalid text', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);

    const fakeImageBuffer = Buffer.from('Not an actual image binary payload');
    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', fakeImageBuffer, { filename: 'fake.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_IMAGE_CONTENT');
    expect(res.body.message).toMatch(/does not match a valid/i);
  });

  it('fails with 413 on large files (>5MB)', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);

    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', largeBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(413);
    expect(res.body.code).toBe('FILE_TOO_LARGE');
    expect(res.body.message).toMatch(/too large/i);
  });

  it('fails with 400 when no file is attached under the image field', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('wrongField', validJpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(400);
  });

  it('successfully uploads valid photo and returns Cloudinary metadata', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);
    vi.mocked(cloudinaryService.uploadImage).mockResolvedValue({
      url: 'https://res.cloudinary.com/test/image/upload/v1/mobitech/products/test.jpg',
      publicId: 'mobitech/products/test',
      width: 1920,
      height: 1080,
      format: 'jpg',
      bytes: 245000,
      optimizedUrl: 'https://res.cloudinary.com/test/image/upload/f_auto,q_auto/v1/mobitech/products/test.jpg',
    });

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', validJpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('https://res.cloudinary.com/test/image/upload/v1/mobitech/products/test.jpg');
    expect(res.body.data.publicId).toBe('mobitech/products/test');
    expect(res.body.data.optimizedUrl).toBeDefined();
    expect(res.body.data.width).toBe(1920);
  });

  it('maps Cloudinary authentication error to 502 with actionable message', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);
    vi.mocked(cloudinaryService.uploadImage).mockRejectedValue(
      new CloudinaryServiceError('Cloudinary authentication failed. Please verify API credentials.', 502, 'UPSTREAM_AUTH_FAILED')
    );

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', validJpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(502);
    expect(res.body.code).toBe('UPSTREAM_AUTH_FAILED');
  });

  it('maps Cloudinary network timeout to 504 Gateway Timeout', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);
    vi.mocked(cloudinaryService.uploadImage).mockRejectedValue(
      new CloudinaryServiceError('Unable to reach Cloudinary image service. Please check network connectivity.', 504, 'UPSTREAM_TIMEOUT')
    );

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', validJpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(504);
    expect(res.body.code).toBe('UPSTREAM_TIMEOUT');
  });

  it('maps Cloudinary rate limiting to 429 Too Many Requests', async () => {
    vi.mocked(cloudinaryService.isConfigured).mockReturnValue(true);
    vi.mocked(cloudinaryService.uploadImage).mockRejectedValue(
      new CloudinaryServiceError('Cloudinary rate limit exceeded. Please try again later.', 429, 'UPSTREAM_RATE_LIMITED')
    );

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', 'Bearer admin-token')
      .attach('image', validJpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(429);
    expect(res.body.code).toBe('UPSTREAM_RATE_LIMITED');
  });
});
