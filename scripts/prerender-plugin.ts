import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';

interface ElementRow {
  z: number;
  symbol: string;
  name: string;
  category: string;
  summary: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  alkali: 'logam alkali',
  alkaline: 'logam alkali tanah',
  transition: 'logam transisi',
  'post-transition': 'logam pascatransisi',
  metalloid: 'metaloid',
  nonmetal: 'nonlogam',
  halogen: 'halogen',
  noble: 'gas mulia',
  lanthanide: 'lantanida',
  actinide: 'aktinida',
};

const DEFAULT_SITE = 'https://periodiklab.example.com';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function shorten(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : cut.length)}…`;
}

interface PageMeta {
  path: string;
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

function buildHead(meta: PageMeta, site: string): string {
  const url = `${site}${meta.path === '/' ? '/' : meta.path}`;
  const image = `${site}/icons/icon-512.png`;
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="PeriodikLab" />',
    '<meta property="og:locale" content="id_ID" />',
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta name="twitter:card" content="summary" />',
  ];

  if (meta.jsonLd) {
    const json = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }

  return tags.join('\n    ');
}

const STRIP_PATTERNS: RegExp[] = [
  /<title>[\s\S]*?<\/title>\s*/gi,
  /<meta\s+name="description"[^>]*>\s*/gi,
  /<meta\s+property="og:[^"]+"[^>]*>\s*/gi,
  /<meta\s+name="twitter:card"[^>]*>\s*/gi,
  /<link\s+rel="canonical"[^>]*>\s*/gi,
];

function renderPage(base: string, meta: PageMeta, site: string): string {
  let html = base;
  for (const pattern of STRIP_PATTERNS) html = html.replace(pattern, '');
  const head = `\n    ${buildHead(meta, site)}\n  </head>`;
  return html.replace('</head>', head);
}

function writePage(dist: string, path: string, html: string): void {
  const target = path === '/' ? resolve(dist, 'index.html') : resolve(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
}

/**
 * Prerender metadata per rute dan sitemap. Dijalankan sebelum service worker
 * dibuat agar halaman hasil prerender ikut masuk precache.
 */
export function prerender(root = process.cwd()): void {
  const dist = resolve(root, 'dist');
  const base = readFileSync(resolve(dist, 'index.html'), 'utf8');
  const elements = JSON.parse(
    readFileSync(resolve(root, 'src/core/data/elements.json'), 'utf8'),
  ) as ElementRow[];

  const rawSite = process.env.SITE_URL?.trim();
  const site = (rawSite || DEFAULT_SITE).replace(/\/+$/, '');
  if (!rawSite) {
    console.warn(
      `[prerender] SITE_URL belum diset; canonical dan sitemap memakai placeholder ${DEFAULT_SITE}`,
    );
  }

  const pages: PageMeta[] = [
    {
      path: '/',
      title: 'PeriodikLab — Tabel Periodik & Laboratorium Kimia',
      description:
        'Jelajahi 118 unsur dalam tabel periodik interaktif, coba reaksi di laboratorium virtual, dan asah pemahaman lewat tantangan kimia berbahasa Indonesia.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PeriodikLab',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        inLanguage: 'id',
        url: `${site}/`,
        description:
          'Tabel periodik interaktif dengan laboratorium reaksi dan tantangan kimia.',
      },
    },
    {
      path: '/lab',
      title: 'Laboratorium Reaksi — PeriodikLab',
      description:
        'Campur atom di baki, atur kondisi reaksi, dan lihat stoikiometri, pereaksi pembatas, serta sisa zat secara langsung.',
    },
    {
      path: '/tantangan',
      title: 'Tantangan Kimia — PeriodikLab',
      description:
        'Latihan kimia tiga tingkat dengan pembahasan, pengulangan soal salah, dan tautan berbagi. Kalibrasi Kurikulum Merdeka dan GCSE.',
    },
    ...(['dasar', 'menengah', 'mahir'] as const).map<PageMeta>((level) => ({
      path: `/tantangan/${level}`,
      title: `Tantangan ${level} — PeriodikLab`,
      description: `Paket soal kimia tingkat ${level} berisi 10 pertanyaan orisinal dengan pembahasan.`,
    })),
    {
      path: '/tentang',
      title: 'Tentang, Sumber & Disclaimer — PeriodikLab',
      description:
        'Sumber data, sitasi reaksi, lisensi, disclaimer keselamatan, dan kebijakan penyimpanan lokal PeriodikLab.',
    },
  ];

  for (const element of elements) {
    const category = CATEGORY_LABELS[element.category] ?? element.category;
    pages.push({
      path: `/unsur/${element.symbol}`,
      title: `${element.name} (${element.symbol}) — Unsur ${element.z} | PeriodikLab`,
      description: shorten(
        `${element.name} (${element.symbol}) adalah ${category} bernomor atom ${element.z}. ${element.summary}`,
        155,
      ),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ChemicalSubstance',
        name: element.name,
        alternateName: element.symbol,
        identifier: element.symbol,
        atomicNumber: element.z,
        url: `${site}/unsur/${element.symbol}`,
      },
    });
  }

  for (const page of pages) {
    writePage(dist, page.path, renderPage(base, page, site));
  }

  // Fallback 404 untuk hosting statis yang mendukungnya.
  writeFileSync(resolve(dist, '404.html'), renderPage(base, {
    path: '/',
    title: 'Halaman tidak ditemukan — PeriodikLab',
    description: 'Halaman yang Anda cari tidak tersedia. Kembali ke tabel periodik.',
  }, site), 'utf8');

  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((page) => {
      const loc = `${site}${page.path}`;
      const priority = page.path === '/' ? '1.0' : page.path.startsWith('/unsur/') ? '0.7' : '0.8';
      return `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');
  writeFileSync(
    resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8',
  );

  writeFileSync(
    resolve(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
    'utf8',
  );

  console.log(`[prerender] ${pages.length} halaman + sitemap + robots.txt ditulis ke dist/`);
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) prerender();

/** Plugin Vite: jalankan prerender tepat sebelum VitePWA membuat service worker. */
export function prerenderPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: 'periodiklab-prerender',
    apply: 'build',
    configResolved(config) {
      root = config.root;
    },
    closeBundle: {
      order: 'pre',
      sequential: true,
      handler() {
        prerender(root);
      },
    },
  };
}
