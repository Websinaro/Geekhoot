import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

function configureCloudinary(): boolean {
  if (isConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isConfigured = true;
    console.log('☁️ Cloudinary system successfully initialized.');
    return true;
  }
  return false;
}

/**
 * Uploads a file Buffer to Cloudinary using a base64 data URI.
 * This uses a signed upload (api_key + api_secret) — no upload preset needed.
 * Images are stored permanently on Cloudinary and survive server restarts.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (!configureCloudinary()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.'
    );
  }

  // Convert buffer to base64 data URI — works with cloudinary.uploader.upload() directly
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'geekhoot',
      resource_type: 'image',
    });
    console.log('✨ Uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (err: any) {
    console.error('❌ Cloudinary upload failed:', {
      message: err?.message,
      http_code: err?.http_code,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_prefix: process.env.CLOUDINARY_API_KEY?.slice(0, 6) + '...',
    });
    throw new Error(`Cloudinary upload failed (${err?.http_code || 'unknown'}): ${err?.message}`);
  }
}
