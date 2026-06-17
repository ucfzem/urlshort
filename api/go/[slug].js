import { initDB, getLinkBySlug, recordClick } from '../_lib/db.js';

const BOT_RE = /bot|crawl|spider|scrape|Googlebot|bingbot|Baidu|Yandex|facebookexternalhit|Twitterbot|WhatsApp/i;

function htmlPage(link, referer, domain) {
  const url = link.url.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const title = link.title || url;
  const shortUrl = `${domain}/go/${link.slug}`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Redirection — ${title}</title>
<meta name="robots" content="noindex,follow">
<meta property="og:title" content="${title}">
<meta property="og:url" content="${shortUrl}">
<meta http-equiv="refresh" content="3;url=${url}">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0f1e;color:#f0f4ff;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#111827;border:1px solid #1f2a3e;border-radius:12px;padding:2.5rem;text-align:center;max-width:420px;width:90%}
.logo{font-size:1.5rem;font-weight:700;margin-bottom:1.5rem;color:#4f6eff}
p{color:#6b7fa8;font-size:0.9rem;margin-bottom:1rem;word-break:break-all}
a{color:#4f6eff;text-decoration:none}
a:hover{text-decoration:underline}
.btn-copy{display:inline-block;margin-top:1rem;padding:0.5rem 1.2rem;background:#4f6eff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600;transition:opacity 0.2s}
.btn-copy:hover{opacity:0.8}
.countdown{font-size:2rem;font-weight:700;color:#4f6eff;margin:1rem 0}
.bar{height:3px;background:#1f2a3e;border-radius:2px;overflow:hidden;margin-top:1rem}
.bar-inner{height:100%;background:#4f6eff;width:100%;animation:shrink 3s linear forwards}
@keyframes shrink{to{width:0%}}
.toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:0.6rem 1.2rem;border-radius:8px;font-size:0.85rem;font-weight:600;opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:100}
.toast.show{opacity:1}
</style>
</head>
<body>
<div class="card">
<div class="logo">Lnk</div>
<p>Redirection vers</p>
<p style="font-size:0.8rem;color:#8b9cc4">${url}</p>
<div class="countdown" id="countdown">3</div>
<p style="font-size:0.8rem;color:#4b5a7a">Redirection automatique dans <span id="sec">3</span>s</p>
<p style="margin-top:1rem;font-size:0.8rem;color:#4b5a7a"><a href="${url}" rel="nofollow">Cliquez ici</a> si rien ne se passe</p>
<button class="btn-copy" onclick="copyLink()">Copier le lien</button>
<div class="bar"><div class="bar-inner"></div></div>
</div>
<div class="toast" id="toast"></div>
<script>
(function(){var t=3,i=document.getElementById('countdown'),s=document.getElementById('sec');var h=setInterval(function(){t--;if(t<=0){clearInterval(h);window.location.replace('${url}')}i.textContent=t;s.textContent=t})})()
function copyLink(){navigator.clipboard.writeText('${shortUrl}').then(function(){var e=document.getElementById('toast');e.textContent='Copié !';e.classList.add('show');setTimeout(function(){e.classList.remove('show')},2500)})}
</script>
</body>
</html>`;
}

function isBot(ua) {
  return BOT_RE.test(ua || '');
}

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  await initDB();
  const link = await getLinkBySlug(slug);

  if (!link) {
    return res.status(404).send('Link not found');
  }

  const ua = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';

  if (isBot(ua)) {
    res.writeHead(301, { Location: link.url });
    return res.end();
  }

  await recordClick(link.id, referer, ua);

  const domain = req.headers['x-forwarded-host'] || req.headers.host || 'urlshort.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const base = `${proto}://${domain}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlPage(link, referer, base));
}
