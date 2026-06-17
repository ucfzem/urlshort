export default function handler(req, res) {
  const domain = req.headers['x-forwarded-host'] || req.headers.host || 'urlshort.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const base = `${proto}://${domain}`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(`User-agent: *
Allow: /
Sitemap: ${base}/sitemap.xml
`);
}
