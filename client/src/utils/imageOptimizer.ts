/**
 * Client-Side Image Optimizer
 * 
 * Features:
 * - Automatically downsizes oversized photos to max 2000x2000 preserving aspect ratio.
 * - Never enlarges smaller images.
 * - Preserves transparency for PNGs (does not convert transparent PNGs to JPEG).
 * - Applies adaptive quality (0.80 - 0.85) targeting ~1-2MB without visible quality loss.
 * - Avoids recompressing images that are already optimized.
 * - Fallbacks gracefully if canvas or browser processing encounters an issue.
 */

export interface OptimizeOptions {
  maxDimension?: number;
  initialQuality?: number;
  targetMaxBytes?: number;
  minQuality?: number;
}

export interface OptimizeResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  compressionRatio: number;
  format: string;
}

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates whether a file has a supported image MIME type or extension.
 */
export function validateImageFileType(file: File): { valid: boolean; error?: string } {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  const isMimeSupported = SUPPORTED_MIME_TYPES.includes(type);
  const isExtSupported = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp');

  if (!isMimeSupported && !isExtSupported) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please upload JPEG, PNG, or WEBP.`,
    };
  }

  return { valid: true };
}

/**
 * Loads a File into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image file '${file.name}'. The file may be corrupt.`));
    };
    img.src = objectUrl;
  });
}

/**
 * Checks if a canvas context contains transparent or translucent pixels.
 */
function hasCanvasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const step = Math.max(1, Math.floor(Math.min(width, height) / 40));
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        if (data[index + 3] < 250) {
          return true;
        }
      }
    }
  } catch {
    return true; // Fallback to safe assumption
  }
  return false;
}

/**
 * Canvas to Blob wrapper
 */
function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), format, quality);
  });
}

/**
 * Optimize an image file client-side before upload
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const {
    maxDimension = 2000,
    initialQuality = 0.85,
    targetMaxBytes = 2 * 1024 * 1024, // 2 MB
    minQuality = 0.72,
  } = options;

  // Validate file type
  const validation = validateImageFileType(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Load image to inspect dimensions
  const img = await loadImageFromFile(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // If already under maxDimension and under target file size, return as-is
  if (origWidth <= maxDimension && origHeight <= maxDimension && file.size <= 1.2 * 1024 * 1024) {
    return {
      file,
      originalSize: file.size,
      optimizedSize: file.size,
      width: origWidth,
      height: origHeight,
      compressionRatio: 1,
      format: file.type,
    };
  }

  // Compute scale while preserving aspect ratio (never upscale)
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (origWidth > maxDimension || origHeight > maxDimension) {
    if (origWidth >= origHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((origHeight * maxDimension) / origWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((origWidth * maxDimension) / origHeight);
    }
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // If context not available, return original
    return {
      file,
      originalSize: file.size,
      optimizedSize: file.size,
      width: origWidth,
      height: origHeight,
      compressionRatio: 1,
      format: file.type,
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Determine output format & transparency preservation
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  let outputFormat = file.type || 'image/jpeg';
  let preservePng = false;

  if (isPng) {
    const hasTransparency = hasCanvasTransparency(ctx, targetWidth, targetHeight);
    if (hasTransparency) {
      preservePng = true;
      outputFormat = 'image/png';
    } else {
      // Non-transparent PNG can be converted to WebP or JPEG for significant bandwidth savings
      outputFormat = 'image/jpeg';
    }
  } else if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
    outputFormat = 'image/webp';
  } else {
    outputFormat = 'image/jpeg';
  }

  // Adaptive quality loop
  let currentQuality = initialQuality;
  let blob: Blob | null = null;

  if (preservePng) {
    blob = await canvasToBlob(canvas, 'image/png', 1.0);
  } else {
    blob = await canvasToBlob(canvas, outputFormat, currentQuality);
    
    // If still over targetMaxBytes, try lower quality steps
    while (blob && blob.size > targetMaxBytes && currentQuality > minQuality) {
      currentQuality = Math.max(minQuality, currentQuality - 0.06);
      const nextBlob = await canvasToBlob(canvas, outputFormat, currentQuality);
      if (nextBlob) {
        blob = nextBlob;
      }
    }
  }

  // If compression produced a larger file than the original, keep original
  if (!blob || (blob.size >= file.size && origWidth <= maxDimension && origHeight <= maxDimension)) {
    return {
      file,
      originalSize: file.size,
      optimizedSize: file.size,
      width: origWidth,
      height: origHeight,
      compressionRatio: 1,
      format: file.type,
    };
  }

  // Determine new file extension
  let ext = '.jpg';
  if (outputFormat === 'image/png') ext = '.png';
  if (outputFormat === 'image/webp') ext = '.webp';

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${baseName}${ext}`;
  const optimizedFile = new File([blob], newFileName, { type: outputFormat });

  return {
    file: optimizedFile,
    originalSize: file.size,
    optimizedSize: blob.size,
    width: targetWidth,
    height: targetHeight,
    compressionRatio: Number((blob.size / file.size).toFixed(3)),
    format: outputFormat,
  };
}

/**
 * Optimizes Cloudinary delivery URLs by injecting automatic format and quality parameters (f_auto, q_auto).
 * Leaves local paths and non-Cloudinary URLs unmodified.
 */
export function getOptimizedDeliveryUrl(
  url: string,
  transformations?: { width?: number; height?: number }
): string {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }

  // Already transformed
  if (url.includes('/f_auto') || url.includes('/q_auto')) {
    return url;
  }

  const uploadSegment = '/image/upload/';
  const idx = url.indexOf(uploadSegment);
  if (idx === -1) {
    return url;
  }

  const params: string[] = ['f_auto', 'q_auto'];
  if (transformations?.width) {
    params.push(`w_${transformations.width}`, 'c_limit');
  }

  const transformString = params.join(',') + '/';
  return url.slice(0, idx + uploadSegment.length) + transformString + url.slice(idx + uploadSegment.length);
}

