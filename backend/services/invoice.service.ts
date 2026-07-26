import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BRAND_RED = '#e0122a';
const BRAND_BLACK = '#0b0b0d';
const MUTED = '#6b6b70';

// Vite copies `public/*` to the dist root in production builds, while in dev
// (tsx running from the repo root) it's still under `public/`. Try both.
function resolveLogoPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'public', 'logo.png'),
    path.join(process.cwd(), 'logo.png'),
    path.join(__dirname, '..', '..', 'public', 'logo.png'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
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

function drawWatermark(doc: PDFKit.PDFDocument, logoBuffer: Buffer | null) {
  const { width, height } = doc.page;
  doc.save();
  doc.opacity(0.06);
  doc.rotate(-35, { origin: [width / 2, height / 2] });

  if (logoBuffer) {
    const size = 220;
    try {
      doc.image(logoBuffer, width / 2 - size / 2, height / 2 - size - 30, { width: size, height: size });
    } catch {
      // ignore malformed logo buffer, text watermark below still renders
    }
  }

  doc.font('Helvetica-Bold').fontSize(64).fillColor(BRAND_RED)
    .text('GEEKHOOT', -200, height / 2 + 10, { width: width + 400, align: 'center' });

  doc.restore();
  doc.opacity(1);
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number, logoBuffer: Buffer | null, redrawHeader: () => void) {
  const bottomLimit = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottomLimit) {
    doc.addPage();
    drawWatermark(doc, logoBuffer);
    redrawHeader();
  }
}

export async function generateInvoicePdfBuffer(params: {
  orders: InvoiceOrderItem[];
  customer: InvoiceCustomer;
  locationUrl?: string | null;
}): Promise<Buffer> {
  const { orders, customer, locationUrl } = params;

  const logoPath = resolveLogoPath();
  const logoBuffer = logoPath ? fs.readFileSync(logoPath) : null;
  const productImageBuffers = await Promise.all(
    orders.map((o) => fetchImageBuffer(o.product.images?.[0]))
  );

  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  drawWatermark(doc, logoBuffer);

  const orderCodes = orders.map((o) => o.orderCode).filter(Boolean).join(', ') || '—';
  const grandTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const drawHeader = () => {
    doc.y = 40;
    if (logoBuffer) {
      try { doc.image(logoBuffer, left, 40, { width: 34, height: 34 }); } catch { /* skip */ }
    }
    doc.font('Helvetica-Bold').fontSize(20).fillColor(BRAND_BLACK)
      .text('GeekHoot', left + 42, 46);

    doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND_RED)
      .text('INVOICE', left, 40, { width: pageWidth, align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
      .text(`Order ID(s): ${orderCodes}`, left, 66, { width: pageWidth, align: 'right' })
      .text(`Date: ${invoiceDate}`, left, 79, { width: pageWidth, align: 'right' });

    doc.moveTo(left, 100).lineTo(left + pageWidth, 100).lineWidth(1.5).strokeColor(BRAND_RED).stroke();
    doc.y = 114;
  };

  drawHeader();

  // ---- Bill To / delivery block ----
  const addressLines = [
    customer.houseNo,
    customer.streetNear,
    customer.road,
    [customer.district, customer.state].filter(Boolean).join(', '),
    customer.pincode,
  ].filter(Boolean);
  if (addressLines.length === 0 && customer.address) addressLines.push(customer.address);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_BLACK).text('Bill To', left, doc.y);
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_BLACK).text(customer.name);
  doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).text(customer.phone);
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(9.5).fillColor(BRAND_BLACK);
  addressLines.forEach((line) => doc.text(String(line)));

  if (locationUrl) {
    doc.moveDown(0.2);
    const linkY = doc.y;
    doc.fillColor(BRAND_RED).font('Helvetica-Bold').fontSize(9.5).text('View delivery location on map ->', left, linkY);
    doc.link(left, linkY, 220, 14, locationUrl);
    doc.fillColor(BRAND_BLACK);
  }

  doc.moveDown(1);

  // ---- Table ----
  const colImage = 46;
  const colQty = 40;
  const colPrice = 80;
  const colSubtotal = 90;
  const colProduct = pageWidth - colImage - colQty - colPrice - colSubtotal;

  const tableLeft = left;
  const drawTableHeader = () => {
    const y = doc.y;
    doc.rect(tableLeft, y, pageWidth, 22).fill(BRAND_BLACK);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
    let x = tableLeft;
    doc.text('IMAGE', x + 6, y + 6, { width: colImage - 6 }); x += colImage;
    doc.text('PRODUCT', x + 6, y + 6, { width: colProduct - 6 }); x += colProduct;
    doc.text('QTY', x, y + 6, { width: colQty, align: 'center' }); x += colQty;
    doc.text('PRICE', x, y + 6, { width: colPrice, align: 'right' }); x += colPrice;
    doc.text('SUBTOTAL', x, y + 6, { width: colSubtotal - 6, align: 'right' });
    doc.y = y + 22;
    doc.fillColor(BRAND_BLACK);
  };

  drawTableHeader();

  const rowHeight = 46;
  orders.forEach((order, i) => {
    ensureSpace(doc, rowHeight, logoBuffer, () => {
      drawHeader();
      drawTableHeader();
    });

    const y = doc.y;
    if (i % 2 === 1) {
      doc.rect(tableLeft, y, pageWidth, rowHeight).fill('#f7f7f8');
      doc.fillColor(BRAND_BLACK);
    }

    let x = tableLeft;
    const imgBuf = productImageBuffers[i];
    if (imgBuf) {
      try { doc.image(imgBuf, x + 3, y + 3, { width: 40, height: 40, fit: [40, 40] }); } catch { /* skip broken image */ }
    } else {
      doc.rect(x + 3, y + 3, 40, 40).strokeColor('#e5e5e5').lineWidth(1).stroke();
    }
    x += colImage;

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(BRAND_BLACK)
      .text(order.product.name, x + 6, y + 8, { width: colProduct - 10 });
    if (order.size) {
      doc.font('Helvetica').fontSize(8).fillColor(MUTED)
        .text(`Size: ${order.size}`, x + 6, y + 22, { width: colProduct - 10 });
    }
    if (order.orderCode) {
      doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
        .text(`#${order.orderCode}`, x + 6, y + 33, { width: colProduct - 10 });
    }
    x += colProduct;

    doc.font('Helvetica').fontSize(9.5).fillColor(BRAND_BLACK)
      .text(String(order.quantity), x, y + 16, { width: colQty, align: 'center' });
    x += colQty;

    doc.text(formatCurrency(order.product.price), x, y + 16, { width: colPrice, align: 'right' });
    x += colPrice;

    doc.font('Helvetica-Bold').text(formatCurrency(order.totalAmount), x, y + 16, { width: colSubtotal - 6, align: 'right' });

    doc.moveTo(tableLeft, y + rowHeight).lineTo(tableLeft + pageWidth, y + rowHeight).strokeColor('#e5e5e5').lineWidth(0.5).stroke();
    doc.y = y + rowHeight;
  });

  // ---- Totals ----
  ensureSpace(doc, 70, logoBuffer, () => { drawHeader(); });
  doc.moveDown(0.6);
  const totalBoxWidth = 220;
  const totalBoxX = tableLeft + pageWidth - totalBoxWidth;
  const totalY = doc.y;
  doc.rect(totalBoxX, totalY, totalBoxWidth, 34).fill(BRAND_RED);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13)
    .text('GRAND TOTAL', totalBoxX + 12, totalY + 10, { width: totalBoxWidth - 24 - 90 });
  doc.fontSize(14).text(formatCurrency(grandTotal), totalBoxX, totalY + 9, { width: totalBoxWidth - 12, align: 'right' });
  doc.y = totalY + 46;
  doc.fillColor(BRAND_BLACK);

  // ---- Footer ----
  ensureSpace(doc, 40, logoBuffer, () => { drawHeader(); });
  doc.moveDown(1);
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
    .text('Thank you for shopping with GeekHoot — Gear up. Stand out.', left, doc.y, { width: pageWidth, align: 'center' })
    .text(`Generated on ${new Date().toLocaleString('en-IN')}`, left, doc.y + 2, { width: pageWidth, align: 'center' });

  doc.end();
  return done;
}
