import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { cloudinaryService, CloudinaryServiceError } from "../services/cloudinary.service.js";
import { isValidImageBuffer } from "../utils/imageValidation.js";

const router = Router();

// Configure multer for memory storage with a strict 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp") {
      cb(null, true);
    } else {
      const err = new Error("Unsupported file format. Please upload JPEG, PNG, or WEBP.");
      (err as unknown as { code: string }).code = "UNSUPPORTED_FORMAT";
      cb(err);
    }
  },
});

router.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          code: "NO_FILE_PROVIDED",
          message: "No image file provided in the 'image' field.",
        });
        return;
      }

      // Check whether Cloudinary storage is configured
      if (!cloudinaryService.isConfigured()) {
        const status = cloudinaryService.getStatus();
        res.status(503).json({
          success: false,
          code: "STORAGE_NOT_CONFIGURED",
          message: "Image storage service is not configured on the server. Please add CLOUDINARY credentials to server/.env.",
          details: {
            missing: status.missing,
          },
        });
        return;
      }

      // Validate actual buffer content magic bytes
      const validation = isValidImageBuffer(req.file.buffer);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          code: "INVALID_IMAGE_CONTENT",
          message: "The uploaded file content does not match a valid JPEG, PNG, or WEBP image.",
        });
        return;
      }

      const result = await cloudinaryService.uploadImage(req.file.buffer, "mobitech/products");

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof CloudinaryServiceError) {
        res.status(error.status).json({
          success: false,
          code: error.code,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  }
);

// Multer and file upload error handling middleware
router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        code: "FILE_TOO_LARGE",
        message: "File is too large. Maximum size is 5MB.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      code: error.code || "UPLOAD_ERROR",
      message: error.message,
    });
    return;
  }

  if (error instanceof Error && (error.message.includes("Unsupported file format") || (error as unknown as { code?: string }).code === "UNSUPPORTED_FORMAT")) {
    res.status(415).json({
      success: false,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: error.message,
    });
    return;
  }

  next(error);
});

export default router;
