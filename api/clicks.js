import { initDB, getClicksForLink } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { linkId } = req.query;
  if (!linkId) return res.status(400).json({ error: 'Missing linkId' });

  await initDB();
  const clicks = await getClicksForLink(Number(linkId));
  return res.status(200).json(clicks);
}
