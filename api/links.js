import { initDB, createLink, listLinks, deleteLink, slugExists } from './_lib/db.js';
import { generateSlug } from './_lib/slug.js';

export default async function handler(req, res) {
  await initDB();

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const links = await listLinks();
    return res.status(200).json(links);
  }

  if (req.method === 'POST') {
    const { url, slug } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let finalSlug = slug || generateSlug();
    if (slug && await slugExists(slug)) {
      return res.status(409).json({ error: 'Slug already taken' });
    }

    const link = await createLink(finalSlug, url);
    return res.status(201).json(link);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await deleteLink(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
