import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BRAND_RED = '#e0122a';
const BRAND_BLACK = '#0b0b0d';
const MUTED = '#6b6b70';
const LINE_GRAY = '#d9d9db';

// Fixed "Ship From" address — GeekHoot's own address, same on every invoice.
const FROM_ADDRESS = {
  name: 'GeekHoot',
  lines: ['Kallara', 'Thiruvananthapuram', 'Kurumbayam PO', 'Pin: 695608'],
  phone: '6238777570',
};

// Vite copies `public/*` to the dist root in production builds, while in dev
// (tsx running from the repo root) it's still under `public/`. Try both.
function resolveFromPublic(...segments: string[]): string | null {
  const candidates = [
    path.join(process.cwd(), 'public', ...segments),
    path.join(process.cwd(), ...segments),
    path.join(__dirname, '..', '..', 'public', ...segments),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

/**
 * Optional custom font for the "GEEKHOOT" watermark text, matching the site's
 * own display typeface (Space Grotesk). Drop a TTF/OTF file at
 * `public/fonts/watermark.ttf` (or .otf) to use it — if it's not there, this
 * falls back to the built-in Helvetica-Bold automatically, so the invoice
 * still renders fine either way.
 */
function resolveWatermarkFont(): string | null {
  return (
    resolveFromPublic('fonts', 'watermark.ttf') ||
    resolveFromPublic('fonts', 'watermark.otf') ||
    resolveFromPublic('fonts', 'SpaceGrotesk-Bold.ttf')
  );
}

export interface InvoiceOrderItem {
  orderCode: string | null;
  quantity: number;
  size: string | null;
  totalAmount: number;
  product: {
    name: string;
    price: number;
    images: string[];
  };
}

export interface InvoiceCustomer {
  name: string;
  phone: string;
  address?: string | null;
  houseNo?: string | null;
  streetNear?: string | null;
  road?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
}

// Best-effort remote image fetch — invoice generation should never fail just
// because one product photo couldn't be downloaded in time.
async function fetchImageBuffer(url?: string): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const res = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer', timeout: 8000 });
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

function formatCurrency(n: number): string {
  return `Rs. ${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/** Faint diagonal GeekHoot watermark, scaled to fit inside this compact label. */
function drawWatermark(doc: PDFKit.PDFDocument, logoBuffer: Buffer | null, watermarkFont: string, height: number, width: number, left: number, top: number) {
  const cx = left + width / 2;
  const cy = top + height / 2;
  doc.save();
  doc.opacity(0.055);
  doc.rotate(-28, { origin: [cx, cy] });

  if (logoBuffer) {
    const size = Math.min(height * 0.62, 90);
    try {
      doc.image(logoBuffer, cx - size / 2, cy - size - 8, { width: size, height: size });
    } catch {
      // ignore malformed logo buffer, text watermark below still renders
    }
  }

  doc.font(watermarkFont).fontSize(Math.min(height * 0.22, 30)).fillColor(BRAND_RED)
    .text('GEEKHOOT', left - width * 0.4, cy + 6, { width: width * 1.8, align: 'center' });

  doc.restore();
  doc.opacity(1);
}

export async function generateInvoicePdfBuffer(params: {
  orders: InvoiceOrderItem[];
  customer: InvoiceCustomer;
  locationUrl?: string | null;
}): Promise<Buffer> {
  const { orders, customer, locationUrl } = params;

  const logoPath = resolveFromPublic('logo.png');
  const logoBuffer = logoPath ? fs.readFileSync(logoPath) : null;
  const productImageBuffers = await Promise.all(
    orders.map((o) => fetchImageBuffer(o.product.images?.[0]))
  );

  // A standard small shipping-label size (4in x 6in) — narrow enough to print
  // small and stick straight onto the outgoing package, like a normal courier label.
  const width = 4 * 72;
  const height = 6 * 72;

  const doc = new PDFDocument({ size: [width, height], margin: 0, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  let watermarkFont = 'Helvetica-Bold';
  const customFontPath = resolveWatermarkFont();
  if (customFontPath) {
    try {
      doc.registerFont('Watermark', customFontPath);
      watermarkFont = 'Watermark';
    } catch {
      // malformed/unsupported font file — silently keep the Helvetica-Bold fallback
    }
  }

  const orderCodes = orders.map((o) => o.orderCode).filter(Boolean).join(', ') || '—';
  const grandTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const pad = 12;
  const contentLeft = pad;
  const contentWidth = width - pad * 2;

  drawWatermark(doc, logoBuffer, watermarkFont, height, width, 0, 0);

  let y = 10;

  // ---- Header row ----
  if (logoBuffer) {
    try { doc.image(logoBuffer, contentLeft, y, { width: 22, height: 22 }); } catch { /* skip */ }
  }
  doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND_BLACK)
    .text('GeekHoot', contentLeft + 28, y + 4);

  doc.font('Helvetica-Bold').fontSize(13).fillColor(BRAND_RED)
    .text('INVOICE', contentLeft, y, { width: contentWidth, align: 'right' });
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
    .text(`#${orderCodes}  |  ${invoiceDate}`, contentLeft, y + 15, { width: contentWidth, align: 'right' });

  y += 28;
  doc.moveTo(contentLeft, y).lineTo(contentLeft + contentWidth, y).lineWidth(1.4).strokeColor(BRAND_RED).stroke();
  y += 10;

  // ---- FROM (stacked, full width — narrow label has no room for side-by-side columns) ----
  doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED).text('FROM', contentLeft, y);
  y += 11;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_BLACK).text(FROM_ADDRESS.name, contentLeft, y, { width: contentWidth });
  y += 12;
  doc.font('Helvetica').fontSize(8).fillColor(BRAND_BLACK);
  FROM_ADDRESS.lines.forEach((line) => {
    doc.text(line, contentLeft, y, { width: contentWidth });
    y += 10.5;
  });
  doc.fillColor(MUTED).text(`Ph: ${FROM_ADDRESS.phone}`, contentLeft, y, { width: contentWidth });
  y += 16;

  doc.moveTo(contentLeft, y).lineTo(contentLeft + contentWidth, y).lineWidth(0.5).strokeColor(LINE_GRAY).stroke();
  y += 10;

  // ---- TO (stacked, full width) ----
  const addressLines = [
    customer.houseNo,
    customer.streetNear,
    customer.road,
    [customer.district, customer.state].filter(Boolean).join(', '),
    customer.pincode ? `Pin: ${customer.pincode}` : null,
  ].filter(Boolean) as string[];
  if (addressLines.length === 0 && customer.address) addressLines.push(customer.address);

  doc.font('Helvetica-Bold').fontSize(7).fillColor(BRAND_RED).text('TO', contentLeft, y);
  y += 11;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND_BLACK).text(customer.name, contentLeft, y, { width: contentWidth });
  y += 12;
  doc.font('Helvetica').fontSize(8).fillColor(BRAND_BLACK);
  addressLines.forEach((line) => {
    doc.text(String(line), contentLeft, y, { width: contentWidth, ellipsis: true });
    y += 10.5;
  });
  doc.fillColor(MUTED).text(`Ph: ${customer.phone}`, contentLeft, y, { width: contentWidth });
  y += 10.5;

  if (locationUrl) {
    doc.fillColor(BRAND_RED).font('Helvetica-Bold').fontSize(7.5).text('View delivery location ->', contentLeft, y, { width: contentWidth });
    doc.link(contentLeft, y, contentWidth, 10, locationUrl);
    y += 10.5;
  }

  y += 6;
  doc.moveTo(contentLeft, y).lineTo(contentLeft + contentWidth, y).lineWidth(0.5).strokeColor(LINE_GRAY).stroke();
  y += 8;

  // ---- Product table ----
  const colImage = 28;
  const colQty = 26;
  const colPrice = 55;
  const colSubtotal = 62;
  const colProduct = contentWidth - colImage - colQty - colPrice - colSubtotal;

  doc.rect(contentLeft, y, contentWidth, 15).fill(BRAND_BLACK);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.5);
  let hx = contentLeft;
  doc.text('IMG', hx + 3, y + 5, { width: colImage - 3 }); hx += colImage;
  doc.text('PRODUCT', hx + 4, y + 5, { width: colProduct - 4 }); hx += colProduct;
  doc.text('QTY', hx, y + 5, { width: colQty, align: 'center' }); hx += colQty;
  doc.text('PRICE', hx, y + 5, { width: colPrice, align: 'right' }); hx += colPrice;
  doc.text('SUBTOTAL', hx, y + 5, { width: colSubtotal - 4, align: 'right' });
  y += 15;

  // Space left for the table before the total bar
  const bottomLimit = height - pad - 20;
  const availableForRows = Math.max(bottomLimit - y, 20);
  const rowHeight = Math.max(20, Math.min(34, availableForRows / Math.max(orders.length, 1)));

  orders.forEach((order, i) => {
    if (y + rowHeight > bottomLimit) return; // guard against a very long cart overflowing this compact label
    if (i % 2 === 1) {
      doc.rect(contentLeft, y, contentWidth, rowHeight).fill('#f7f7f8');
    }

    let x = contentLeft;
    const imgSize = Math.min(rowHeight - 6, 26);
    const imgBuf = productImageBuffers[i];
    if (imgBuf) {
      try { doc.image(imgBuf, x + 2, y + (rowHeight - imgSize) / 2, { width: imgSize, height: imgSize, fit: [imgSize, imgSize] }); } catch { /* skip */ }
    } else {
      doc.rect(x + 2, y + (rowHeight - imgSize) / 2, imgSize, imgSize).strokeColor(LINE_GRAY).lineWidth(0.5).stroke();
    }
    x += colImage;

    const nameY = rowHeight > 24 ? y + 4 : y + (rowHeight - 7) / 2;
    doc.font('Helvetica-Bold').fontSize(7).fillColor(BRAND_BLACK)
      .text(order.product.name, x + 3, nameY, { width: colProduct - 6, ellipsis: rowHeight <= 24 });
    if (order.size && rowHeight > 24) {
      doc.font('Helvetica').fontSize(6).fillColor(MUTED)
        .text(`Size: ${order.size}`, x + 3, nameY + 9, { width: colProduct - 6 });
    }
    x += colProduct;

    const midY = y + rowHeight / 2 - 3.5;
    doc.font('Helvetica').fontSize(7).fillColor(BRAND_BLACK)
      .text(String(order.quantity), x, midY, { width: colQty, align: 'center' });
    x += colQty;

    doc.text(formatCurrency(order.product.price), x, midY, { width: colPrice, align: 'right' });
    x += colPrice;

    doc.font('Helvetica-Bold').text(formatCurrency(order.totalAmount), x, midY, { width: colSubtotal - 4, align: 'right' });

    doc.moveTo(contentLeft, y + rowHeight).lineTo(contentLeft + contentWidth, y + rowHeight).strokeColor(LINE_GRAY).lineWidth(0.4).stroke();
    y += rowHeight;
  });

  // ---- Grand total ----
  const totalBarY = height - pad - 18;
  doc.rect(contentLeft, totalBarY, contentWidth, 18).fill(BRAND_RED);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
    .text('GRAND TOTAL', contentLeft + 8, totalBarY + 5, { width: contentWidth - 16 - 90 });
  doc.text(formatCurrency(grandTotal), contentLeft, totalBarY + 5, { width: contentWidth - 8, align: 'right' });

  doc.end();
  return done;
}
