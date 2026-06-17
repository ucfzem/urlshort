import { initDB, getAllSlugs } from './_lib/db.js';

export default async function handler(req, res) {
  const domain = req.headers['x-forwarded-host'] || req.headers.host || 'urlshort.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const base = `${proto}://${domain}`;

  await initDB();
  const slugs = await getAllSlugs();

  const urls = slugs.map(s => `  <url>
    <loc>${base}/go/${s.slug}</loc>
    <lastmod>${new Date(s.created_at).toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`).join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
}
