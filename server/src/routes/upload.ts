import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp") {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Please upload JPEG, PNG, or WEBP."));
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
        res.status(400).json({ success: false, message: "No image file provided" });
        return;
      }

      if (!cloudinaryService.isConfigured()) {
        res.status(503).json({ success: false, message: "Cloudinary configuration is missing on the server" });
        return;
      }

      const result = await cloudinaryService.uploadImage(req.file.buffer, "mobitech/products");

      res.status(200).json({
        success: true,
        data: result, // { url, publicId }
      });
    } catch (error: any) {
      if (error.message.includes("Unsupported file format") || error.message.includes("too large")) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        next(error);
      }
    }
  }
);

// We need an error handling middleware specifically for multer errors thrown before our route handler
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: "File is too large. Maximum size is 5MB." });
      return;
    }
    res.status(400).json({ success: false, message: error.message });
    return;
  } else if (error && error.message === "Unsupported file format. Please upload JPEG, PNG, or WEBP.") {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
  next(error);
});

export default router;
