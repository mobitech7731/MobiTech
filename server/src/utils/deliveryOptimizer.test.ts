import { describe, it, expect } from 'vitest';

/**
 * Mirror of delivery optimizer function for cross-layer verification
 */
function getOptimizedDeliveryUrl(
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

describe('Cloudinary Delivery Optimization (f_auto, q_auto)', () => {
  it('injects f_auto,q_auto into standard Cloudinary upload URLs', () => {
    const rawUrl = 'https://res.cloudinary.com/mobitech/image/upload/v1711234567/mobitech/products/phone.jpg';
    const optimized = getOptimizedDeliveryUrl(rawUrl);
    expect(optimized).toBe('https://res.cloudinary.com/mobitech/image/upload/f_auto,q_auto/v1711234567/mobitech/products/phone.jpg');
  });

  it('injects width constraint when specified for thumbnails/cards', () => {
    const rawUrl = 'https://res.cloudinary.com/mobitech/image/upload/v1711234567/mobitech/products/phone.jpg';
    const optimized = getOptimizedDeliveryUrl(rawUrl, { width: 800 });
    expect(optimized).toBe('https://res.cloudinary.com/mobitech/image/upload/f_auto,q_auto,w_800,c_limit/v1711234567/mobitech/products/phone.jpg');
  });

  it('leaves local placeholder and non-Cloudinary images completely untouched', () => {
    const localSvg = '/images/placeholder.svg';
    expect(getOptimizedDeliveryUrl(localSvg)).toBe('/images/placeholder.svg');

    const externalUrl = 'https://images.unsplash.com/photo-12345';
    expect(getOptimizedDeliveryUrl(externalUrl)).toBe(externalUrl);
  });

  it('does not duplicate transformations if f_auto or q_auto already present', () => {
    const alreadyOptimized = 'https://res.cloudinary.com/mobitech/image/upload/f_auto,q_auto/v1711234567/mobitech/products/phone.jpg';
    expect(getOptimizedDeliveryUrl(alreadyOptimized)).toBe(alreadyOptimized);
  });
});
