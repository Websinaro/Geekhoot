import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

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
 * Uploads a file Buffer directly to Cloudinary via a stream.
 * No temp file is written to disk — the image is permanent and survives restarts.
 * Throws if Cloudinary is not configured so the caller can return a proper error.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (!configureCloudinary()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.'
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'geekhoot', resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          console.error('❌ Cloudinary upload failed:', error);
          return reject(error || new Error('Cloudinary upload returned no result'));
        }
        console.log('✨ Uploaded to Cloudinary:', result.secure_url);
        resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// Keep the old file-path based function for any legacy callers (unused after this fix)
export async function uploadToCloudinary(filePath: string): Promise<string | null> {
  try {
    if (!configureCloudinary()) {
      console.warn('⚠️ Cloudinary credentials missing.');
      return null;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'geekhoot',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (err) {
    console.error('❌ Cloudinary upload failed:', err);
    return null;
  }
}
