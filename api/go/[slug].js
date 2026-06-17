import { initDB, getLinkBySlug } from '../_lib/db.js';

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  await initDB();
  const link = await getLinkBySlug(slug);

  if (!link) {
    return res.status(404).send('Link not found');
  }

  res.writeHead(301, { Location: link.url });
  res.end();
}
