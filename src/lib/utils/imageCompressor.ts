/**
 * Client-Side Image Compression & Optimization Utility
 * Automatically parses, scales, and compresses images from file upload inputs
 * to crisp, lightweight data URLs suitable for mobile, tablet, and desktop storage.
 */

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxDimension = 320,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image.');
  }

  // Handle environment where FileReader is not available (Node.js / Unit tests)
  if (typeof FileReader === 'undefined') {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type || 'image/png'};base64,${base64}`;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        reject(new Error('Image reader returned empty result.'));
        return;
      }

      // Check if browser environment with Image and Canvas
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        resolve(src);
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if image decode fails
        resolve(src);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Scale dimensions proportionally
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }

          // Optional: fill white background for transparent PNGs converting to JPEG
          if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed data URL
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // Fallback to raw data url on any canvas issue
          resolve(src);
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
