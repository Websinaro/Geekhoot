import crypto from 'crypto';
import https from 'https';

/**
 * Uploads a Buffer to Cloudinary using a raw signed multipart POST.
 * Bypasses the Cloudinary SDK entirely — avoids esbuild bundling issues
 * where the SDK's internal HTTP client (got) misbehaves in CJS bundles.
 *
 * Applies q_auto + f_auto via eager transformations so every delivered
 * image is automatically format- and quality-optimized.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, ' +
      'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.'
    );
  }

  const timestamp     = Math.floor(Date.now() / 1000).toString();
  const folder        = 'geekhoot';
  const eager         = 'f_auto,q_auto';          // optimize format + quality
  const eagerAsync    = 'false';

  // Cloudinary signature: sort params alphabetically, append secret, SHA-1
  const paramsToSign  =
    `eager=${eager}&eager_async=${eagerAsync}&folder=${folder}&timestamp=${timestamp}`;
  const signature     = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  // Build multipart/form-data manually — no external packages needed
  const boundary = `----CloudinaryBoundary${Date.now()}`;
  const CRLF     = '\r\n';

  function field(name: string, value: string): Buffer {
    return Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
      `${value}${CRLF}`
    );
  }

  const ext      = mimetype.split('/')[1]?.split('+')[0] || 'jpg';
  const filename = `upload_${timestamp}.${ext}`;

  const fileHeader = Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
    `Content-Type: ${mimetype}${CRLF}${CRLF}`
  );
  const fileFooter  = Buffer.from(CRLF);
  const closingLine = Buffer.from(`--${boundary}--${CRLF}`);

  const body = Buffer.concat([
    field('api_key',     apiKey),
    field('timestamp',   timestamp),
    field('folder',      folder),
    field('eager',       eager),
    field('eager_async', eagerAsync),
    field('signature',   signature),
    fileHeader,
    buffer,
    fileFooter,
    closingLine,
  ]);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.cloudinary.com',
        path:     `/v1_1/${cloudName}/image/upload`,
        method:   'POST',
        headers:  {
          'Content-Type':   `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode === 200 && parsed.secure_url) {
              // Return the eager URL with f_auto/q_auto if available,
              // otherwise fall back to the base secure_url
              const optimizedUrl =
                parsed.eager?.[0]?.secure_url ?? parsed.secure_url;
              console.log('✨ Uploaded to Cloudinary:', optimizedUrl);
              resolve(optimizedUrl);
            } else {
              console.error('❌ Cloudinary upload failed:', {
                status: res.statusCode,
                error:  parsed.error?.message,
                cloudName,
                apiKeyPrefix: apiKey.slice(0, 6) + '...',
              });
              reject(
                new Error(
                  `Cloudinary upload failed (${res.statusCode}): ` +
                  (parsed.error?.message ?? raw)
                )
              );
            }
          } catch {
            reject(new Error(`Cloudinary response parse error: ${raw}`));
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('❌ Cloudinary network error:', err.message);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}
