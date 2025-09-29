import fs from 'node:fs'; import path from 'node:path';
const base = process.env.SITE_URL || 'https://www.travelpack.ai';
const routes = ['/', '/features', '/plan', '/examples', '/preview', '/blog'];
const urls = routes.map(r => `<url><loc>${base}${r}</loc></url>`).join('');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
const out = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(out, xml);
console.log('Sitemap written to', out);
