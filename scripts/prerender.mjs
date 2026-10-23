// Post-build step (npm run build): pre-renders the marketing site so search
// engines, link previews and AI crawlers get real HTML, and generates the
// static Hebrew pages (intent landing pages, the public exercise library),
// sitemap.xml and 404.html. Runs after `vite build` and the SSR build of
// src/site/entry-server.tsx into .ssr/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, '.ssr');
const ORIGIN = 'https://rkpilatestudio.com';
const TODAY = new Date().toISOString().slice(0, 10);

const ssr = await import(pathToFileURL(path.join(SSR_DIR, 'entry-server.js')).href);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLdTag = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const clip = (text, max = 165) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
};

// ---- home pages: inject the rendered markup and the structured data ----
for (const [lang, file] of [['he', 'index.html'], ['en', 'en/index.html']]) {
  const target = path.join(DIST, file);
  const { html, jsonLd } = ssr.renderHome(lang);
  let page = fs.readFileSync(target, 'utf8');
  if (!page.includes('<div id="root"></div>') || !page.includes('<!--structured-data-->')) {
    throw new Error(`${file}: placeholders not found`);
  }
  page = page.replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);
  page = page.replace('<!--structured-data-->', () => jsonLdTag(jsonLd));
  fs.writeFileSync(target, page);
}

// ---- the lesson builder (/app/): client-rendered, so only structured data ----
{
  const target = path.join(DIST, 'app/index.html');
  const page = fs.readFileSync(target, 'utf8');
  if (!page.includes('</head>')) throw new Error('app/index.html: </head> not found');
  fs.writeFileSync(target, page.replace('</head>', () => `  ${jsonLdTag(ssr.appStructuredData())}\n  </head>`));
}

// ---- llms.txt: a Markdown guide to the site for AI assistants ----
fs.writeFileSync(path.join(DIST, 'llms.txt'), ssr.renderLlmsTxt());

// ---- static pages ----
const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const css = home.match(/href="\.\/(assets\/site-[^"]+\.css)"/)?.[1];
if (!css) throw new Error('site stylesheet not found in dist/index.html');

function staticDocument({ root, url, title, description, html, jsonLd, robots = 'index, follow, max-image-preview:large, max-snippet:-1' }) {
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="${robots}" />
    ${url ? `<link rel="canonical" href="${url}" />` : ''}
    <meta name="theme-color" content="#faf8f3" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:site_name" content="פילאטיס בתנועה" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    ${url ? `<meta property="og:url" content="${url}" />` : ''}
    <meta property="og:image" content="${ORIGIN}/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="${root}favicon.ico" sizes="48x48" />
    <link rel="icon" href="${root}favicon-96x96.png" type="image/png" sizes="96x96" />
    <link rel="icon" href="${root}favicon-192x192.png" type="image/png" sizes="192x192" />
    <link rel="apple-touch-icon" href="${root}apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300..700&family=Heebo:wght@300..700&display=swap" />
    <link rel="stylesheet" href="${root}${css}" />
    ${jsonLd ? jsonLdTag(jsonLd) : ''}
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-Z43V0E6JK6"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-Z43V0E6JK6');
    </script>
    <script src="${root}analytics.js" defer></script>
  </head>
  <body>
    <div id="root">${html}</div>
  </body>
</html>
`;
}

const pages = ssr.renderStaticPages();
const seen = new Set();
for (const page of pages) {
  if (seen.has(page.path)) throw new Error(`duplicate page path ${page.path}`);
  seen.add(page.path);
  const depth = page.path.split('/').filter(Boolean).length;
  const out = path.join(DIST, page.path, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(
    out,
    staticDocument({
      root: '../'.repeat(depth),
      url: `${ORIGIN}/${page.path}`,
      title: page.title,
      description: clip(page.description),
      html: page.html,
      jsonLd: page.jsonLd,
    })
  );
}

// GitHub Pages serves 404.html for any missing path, so it uses root-absolute links.
fs.writeFileSync(
  path.join(DIST, '404.html'),
  staticDocument({ root: '/', title: 'העמוד לא נמצא | פילאטיס בתנועה', description: 'העמוד שחיפשת לא נמצא.', html: ssr.render404(), robots: 'noindex' })
);

// ---- sitemap.xml ----
// x-default is the Hebrew home page: most visitors are Hebrew speakers.
const alternates = ['he', 'en', 'x-default']
  .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l === 'en' ? 'en/' : ''}" />`)
  .join('\n');
const entry = (loc, { images = [], extra = '' } = {}) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
${extra}${images.map((src) => `    <image:image><image:loc>${src}</image:loc></image:image>`).join('\n')}${images.length ? '\n' : ''}  </url>`;
const urls = [
  entry(`${ORIGIN}/`, {
    extra: `${alternates}\n`,
    images: ['og-image.jpg', 'photos/rotem.webp', 'certificates/mat-2026.webp', 'certificates/apparatus-2026.webp'].map((p) => `${ORIGIN}/${p}`),
  }),
  entry(`${ORIGIN}/en/`, { extra: `${alternates}\n`, images: [`${ORIGIN}/og-image-en.jpg`] }),
  entry(`${ORIGIN}/app/`),
  ...pages.map((p) => entry(`${ORIGIN}/${p.path}`)),
];
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`
);

fs.rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: 2 home pages, ${pages.length} static pages, 404.html, llms.txt, sitemap.xml (${urls.length} URLs)`);
