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
 * Detects whether the current environment supports exporting HTML5 Canvas to WebP.
 */
function isWebpExportSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
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
 * Optimize an image file client-side before upload:
 * - Converts product images to WebP automatically.
 * - Preserves PNG transparency (WebP natively supports 8-bit alpha channels).
 * - Downsizes oversized images to max 2000px preserving aspect ratio.
 * - Applies adaptive quality (0.80 - 0.85) targeting ~1-2MB.
 * - Gracefully falls back to JPEG/PNG if WebP export is unsupported.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const {
    maxDimension = 2000,
    initialQuality = 0.82,
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

  // If already WebP, within max dimensions, and under target file size, return as-is
  const isAlreadyWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
  if (isAlreadyWebp && origWidth <= maxDimension && origHeight <= maxDimension && file.size <= 1.2 * 1024 * 1024) {
    return {
      file,
      originalSize: file.size,
      optimizedSize: file.size,
      width: origWidth,
      height: origHeight,
      compressionRatio: 1,
      format: 'image/webp',
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

  // Determine output format: convert to WebP automatically while preserving PNG transparency
  const webpSupported = isWebpExportSupported();
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const hasTransparency = isPng && hasCanvasTransparency(ctx, targetWidth, targetHeight);

  let outputFormat = 'image/webp';
  let preservePng = false;

  if (webpSupported) {
    // WebP natively preserves alpha transparency with high compression efficiency
    outputFormat = 'image/webp';
  } else {
    // Fallback if browser canvas does not support WebP export
    if (hasTransparency) {
      preservePng = true;
      outputFormat = 'image/png';
    } else {
      outputFormat = 'image/jpeg';
    }
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
      currentQuality = Math.max(minQuality, currentQuality - 0.05);
      const nextBlob = await canvasToBlob(canvas, outputFormat, currentQuality);
      if (nextBlob) {
        blob = nextBlob;
      }
    }
  }

  if (!blob) {
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
  let ext = '.webp';
  if (outputFormat === 'image/png') ext = '.png';
  else if (outputFormat === 'image/jpeg') ext = '.jpg';

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
 * Also routes external images (e.g. thumb.wikimedia.org) through Cloudinary fetch for automatic WebP conversion,
 * adaptive quality, and CDN caching. Leaves local paths unmodified.
 */
const CLOUDINARY_CLOUD_NAME = 'k3exmer1';

export function getOptimizedDeliveryUrl(
  url: string,
  transformations?: { width?: number; height?: number }
): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // 1. Cloudinary upload assets
  if (url.includes('res.cloudinary.com')) {
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

  // 2. External HTTP/HTTPS URLs (e.g. thumb.wikimedia.org):
  // Route through Cloudinary fetch for modern format (WebP/AVIF), quality optimization, and CDN edge caching
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const widthParam = transformations?.width ? `,w_${transformations.width},c_limit` : ',w_500,c_limit';
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto${widthParam}/${url}`;
  }

  // 3. Local assets with converted WebP counterparts
  // If products or components reference local .png images that have modern WebP equivalents in client/public/images:
  if (
    url.endsWith('.png') &&
    (url.includes('/collections/') ||
      url.includes('hero-products') ||
      url.includes('brand-showcase') ||
      url.includes('icon-'))
  ) {
    return url.replace(/\.png$/i, '.webp');
  }

  return url;
}

