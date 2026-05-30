import { Router, Request, Response } from 'express';
import prisma from '../prisma/db';

const router = Router();

const BASE_URL = 'https://mygeekhoot.onrender.com';

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { url: '/',         changefreq: 'daily',   priority: '1.0' },
  { url: '/products', changefreq: 'daily',   priority: '0.9' },
  { url: '/login',    changefreq: 'monthly', priority: '0.3' },
  { url: '/signup',   changefreq: 'monthly', priority: '0.3' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

function toW3CDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const today = toW3CDate(new Date());

    const staticEntries = STATIC_PAGES.map(
      (page) => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    ).join('');

    const productEntries = products.map(
      (p) => `
  <url>
    <loc>${BASE_URL}/product/${escapeXml(p.id)}</loc>
    <lastmod>${toW3CDate(p.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${productEntries}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1 hour
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Failed to generate sitemap');
  }
});

export default router;
