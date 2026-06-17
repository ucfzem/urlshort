import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  await sql`CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(32) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    clicks INTEGER DEFAULT 0
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug)`;
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
