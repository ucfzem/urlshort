import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  await sql`CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(32) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    title TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    clicks INTEGER DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
    referer TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks(link_id)`;
  // migration: add title column if missing (v2)
  try { await sql`ALTER TABLE links ADD COLUMN IF NOT EXISTS title TEXT DEFAULT ''`; } catch (_) {}
}

export async function getLinkBySlug(slug) {
  const rows = await sql`
    UPDATE links SET clicks = clicks + 1 WHERE slug = ${slug} RETURNING *
  `;
  return rows[0] || null;
}

export async function createLink(slug, url) {
  const rows = await sql`
    INSERT INTO links (slug, url) VALUES (${slug}, ${url}) RETURNING *
  `;
  return rows[0];
}

export async function listLinks() {
  const rows = await sql`
    SELECT * FROM links ORDER BY created_at DESC
  `;
  return rows;
}

export async function deleteLink(id) {
  await sql`DELETE FROM links WHERE id = ${id}`;
}

export async function slugExists(slug) {
  const rows = await sql`SELECT 1 FROM links WHERE slug = ${slug}`;
  return rows.length > 0;
}

export async function recordClick(linkId, referer, userAgent) {
  await sql`
    INSERT INTO clicks (link_id, referer, user_agent)
    VALUES (${linkId}, ${referer || ''}, ${userAgent || ''})
  `;
}

export async function getClicksForLink(linkId) {
  const rows = await sql`
    SELECT referer, user_agent, created_at FROM clicks
    WHERE link_id = ${linkId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows;
}

export async function getAllSlugs() {
  const rows = await sql`
    SELECT slug, url, title, created_at FROM links ORDER BY created_at DESC
  `;
  return rows;
}
