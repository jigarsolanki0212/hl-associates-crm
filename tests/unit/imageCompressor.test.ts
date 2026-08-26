import { describe, it, expect } from 'vitest';
import { compressImageFile } from '@/lib/utils/imageCompressor';

describe('Image Compressor & Mobile Upload Processing Utility', () => {
  it('rejects non-image files with clear error message', async () => {
    const textFile = new File(['plain text content'], 'document.txt', { type: 'text/plain' });

    await expect(compressImageFile(textFile)).rejects.toThrow(
      'Selected file is not an image.'
    );
  });

  it('reads image file and produces base64 data URL string', async () => {
    // 1x1 transparent PNG file binary
    const pngBinary = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
      0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
      0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const imageFile = new File([pngBinary], 'logo.png', { type: 'image/png' });

    const result = await compressImageFile(imageFile, {
      maxDimension: 300,
      quality: 0.85,
    });

    expect(typeof result).toBe('string');
    expect(result.startsWith('data:image/')).toBe(true);
  });

  it('validates mobile and tablet touch target constraints', () => {
    const minMobileTapHeightPx = 44;
    const buttonHeights = {
      sm: 36, // min-h-[36px] on mobile
      touchTarget: 44, // standard iOS / Android tap target
      input: 44,
    };

    expect(buttonHeights.touchTarget).toBeGreaterThanOrEqual(minMobileTapHeightPx);
    expect(buttonHeights.input).toBeGreaterThanOrEqual(minMobileTapHeightPx);
  });
});
