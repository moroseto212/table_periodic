import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';

interface ElementRow {
  z: number;
  symbol: string;
  name: string;
  category: string;
  group: number | null;
  period: number;
  block: string;
  mass: number;
  electronConfig: string;
  stateSTP: string;
  discoveredYear: number | null;
  summary: string;
}

interface ReactionRow {
  id: string;
  reactants: { species: string; coeff: number }[];
  products: { species: string; coeff: number }[];
  conditions: string[];
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

const STATE_LABELS: Record<string, string> = {
  solid: 'padat',
  liquid: 'cair',
  gas: 'gas',
};

/**
 * Domain utama untuk canonical, og:url, sitemap, dan robots.txt.
 * Hanya ada satu host publik agar sinyal peringkat tidak terpecah.
 * Ubah lewat env SITE_URL bila perlu.
 */
const DEFAULT_SITE = 'https://periodiclab.my.id';

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

function readJson<T>(root: string, path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
}

function numberId(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value);
}

interface LinkItem {
  path: string;
  label: string;
  hint?: string;
}

interface LinkGroup {
  heading: string;
  items: LinkItem[];
}

interface Fact {
  label: string;
  value: string;
}

interface PageMeta {
  path: string;
  title: string;
  description: string;
  heading: string;
  intro: string[];
  facts?: Fact[];
  groups?: LinkGroup[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const NAV: LinkItem[] = [
  { path: '/', label: 'Tabel periodik' },
  { path: '/lab', label: 'Laboratorium' },
  { path: '/tantangan', label: 'Tantangan' },
  { path: '/tentang', label: 'Tentang' },
];

function buildHead(meta: PageMeta, site: string, preloads: string[] = []): string {
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
    '<meta property="og:image:width" content="512" />',
    '<meta property="og:image:height" content="512" />',
    '<meta property="og:image:alt" content="Logo PeriodikLab" />',
    '<meta name="twitter:card" content="summary" />',
  ];

  if (meta.jsonLd) {
    const data = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
    const json = JSON.stringify(data.length === 1 ? data[0] : data).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }

  tags.push(...preloads);

  return tags.join('\n    ');
}

/**
 * Konten HTML di dalam #root: tampil sebelum JavaScript siap, lalu diganti
 * aplikasi React. Memberi crawler dan pengunjung tanpa JS judul, ringkasan,
 * serta tautan yang bisa diikuti.
 */
function renderBody(meta: PageMeta, base: string): string {
  const href = (path: string) => (path === '/' ? base : `${base}${path.replace(/^\/+/, '')}`);

  const nav = NAV.map(
    (item) =>
      `<a href="${escapeHtml(href(item.path))}"${
        item.path === meta.path ? ' aria-current="page"' : ''
      }>${escapeHtml(item.label)}</a>`,
  ).join(' ');

  const facts = meta.facts?.length
    ? `<dl class="seo__facts">${meta.facts
        .map(
          (fact) =>
            `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`,
        )
        .join('')}</dl>`
    : '';

  const groups = (meta.groups ?? [])
    .map(
      (group) => `<section class="seo__group">
        <h2>${escapeHtml(group.heading)}</h2>
        <ul>${group.items
          .map(
            (item) =>
              `<li><a href="${escapeHtml(href(item.path))}">${escapeHtml(item.label)}</a>${
                item.hint ? ` <span>${escapeHtml(item.hint)}</span>` : ''
              }</li>`,
          )
          .join('')}</ul>
      </section>`,
    )
    .join('\n      ');

  return `<div class="seo">
      <header class="seo__bar">
        <a class="seo__brand" href="${escapeHtml(base)}">PeriodikLab</a>
        <nav class="seo__nav" aria-label="Navigasi utama">${nav}</nav>
      </header>
      <main class="seo__main">
        <h1>${escapeHtml(meta.heading)}</h1>
        ${meta.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ')}
        ${facts}
        ${groups}
        <p class="seo__more"><a href="${escapeHtml(href('/'))}">Buka tabel periodik interaktif</a> — semua fitur berjalan di browser dan bisa dipasang sebagai aplikasi.</p>
      </main>
    </div>`;
}

const STRIP_PATTERNS: RegExp[] = [
  /<title>[\s\S]*?<\/title>\s*/gi,
  /<meta\s+name="description"[^>]*>\s*/gi,
  /<meta\s+property="og:[^"]+"[^>]*>\s*/gi,
  /<meta\s+name="twitter:card"[^>]*>\s*/gi,
  /<link\s+rel="canonical"[^>]*>\s*/gi,
];

function renderPage(
  baseHtml: string,
  meta: PageMeta,
  site: string,
  base: string,
  preloads: string[] = [],
): string {
  let html = baseHtml;
  for (const pattern of STRIP_PATTERNS) html = html.replace(pattern, '');
  const head = `\n    ${buildHead(meta, site, preloads)}\n  </head>`;
  html = html.replace('</head>', head);
  return html.replace('<div id="root"></div>', `<div id="root">${renderBody(meta, base)}</div>`);
}

function writePage(dist: string, path: string, html: string): void {
  const target = path === '/' ? resolve(dist, 'index.html') : resolve(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
}

function breadcrumbJsonLd(
  site: string,
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site}${item.path === '/' ? '/' : item.path}`,
    })),
  };
}

function buildPages(
  root: string,
  elements: ElementRow[],
  site: string,
): PageMeta[] {
  const reactions = readJson<ReactionRow[]>(root, 'src/core/data/reactions.json');
  const featured = ['H', 'C', 'N', 'O', 'Na', 'Mg', 'Al', 'Si', 'S', 'Cl', 'Fe', 'Cu']
    .map((symbol) => elements.find((element) => element.symbol === symbol))
    .filter((element): element is ElementRow => Boolean(element));

  const pages: PageMeta[] = [
    {
      path: '/',
      title: 'PeriodikLab — Tabel Periodik & Laboratorium Kimia',
      description:
        'Tabel periodik 118 unsur berbahasa Indonesia, lengkap dengan laboratorium reaksi virtual, stoikiometri, dan tantangan kimia tiga tingkat.',
      heading: 'Tabel Periodik Interaktif & Laboratorium Kimia',
      intro: [
        'PeriodikLab merangkum 118 unsur dalam tabel periodik 2D berbahasa Indonesia. Setiap unsur punya halaman berisi nomor atom, massa, konfigurasi elektron, wujud pada suhu kamar, dan ringkasan sifatnya.',
        'Selain menjelajah, kamu bisa menyusun atom di laboratorium reaksi virtual — lengkap dengan stoikiometri, pereaksi pembatas, dan sisa zat — lalu menguji pemahaman lewat tantangan tiga tingkat. Semua berjalan di browser, bisa dipasang sebagai aplikasi, dan tetap terbuka saat offline.',
      ],
      facts: [
        { label: 'Unsur', value: '118' },
        { label: 'Reaksi terkurasi', value: String(reactions.length) },
        { label: 'Tingkat tantangan', value: '3' },
        { label: 'Bahasa', value: 'Indonesia' },
      ],
      groups: [
        {
          heading: 'Mulai dari sini',
          items: [
            { path: '/lab', label: 'Laboratorium reaksi', hint: 'susun atom dan lihat hasilnya' },
            { path: '/tantangan', label: 'Tantangan kimia', hint: 'tiga tingkat dengan pembahasan' },
            { path: '/tentang', label: 'Sumber data & disclaimer' },
          ],
        },
        {
          heading: 'Unsur yang sering dicari',
          items: featured.map((element) => ({
            path: `/unsur/${element.symbol}`,
            label: `${element.name} (${element.symbol})`,
            hint: `nomor atom ${element.z}`,
          })),
        },
        {
          heading: 'Indeks 118 unsur',
          items: elements.map((element) => ({
            path: `/unsur/${element.symbol}`,
            label: `${element.symbol} · ${element.name}`,
          })),
        },
      ],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'PeriodikLab',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web',
          inLanguage: 'id',
          url: `${site}/`,
          description:
            'Tabel periodik interaktif dengan laboratorium reaksi dan tantangan kimia.',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'PeriodikLab',
          alternateName: 'PeriodikLab — Tabel Periodik & Lab Kimia',
          url: `${site}/`,
          inLanguage: 'id',
        },
      ],
    },
    {
      path: '/lab',
      title: 'Laboratorium Reaksi — PeriodikLab',
      description:
        'Campur atom di baki, atur kondisi reaksi, dan lihat stoikiometri, pereaksi pembatas, serta sisa zat secara langsung.',
      heading: 'Laboratorium Reaksi Kimia Virtual',
      intro: [
        'Laboratorium PeriodikLab mencocokkan rasio atom, bukan molekul. Pilih unsur dari baki, atur kondisi bila perlu, lalu tekan Reaksikan untuk melihat persamaan setara, pereaksi pembatas, dan zat sisa.',
        'Beberapa reaksi baru berjalan dengan kondisi tertentu, misalnya panaskan, katalis, atau tekanan tinggi. Kamu bisa menambah dan mengurangi atom langsung dari chip, membagikan tautan eksperimen, atau mengembalikan langkah terakhir lewat tombol Undo.',
        'Batas percobaan adalah 24 atom total dan 12 atom per unsur agar hasil tetap mudah dibaca. Seluruh perhitungan berjalan lokal di browser.',
      ],
      facts: [
        { label: 'Unsur tersedia', value: '118' },
        { label: 'Reaksi terkurasi', value: String(reactions.length) },
        { label: 'Batas atom', value: '24 per percobaan' },
        { label: 'Kondisi', value: 'panas, katalis, tekanan' },
      ],
      groups: [
        {
          heading: 'Halaman terkait',
          items: [
            { path: '/', label: 'Tabel periodik 118 unsur' },
            { path: '/tantangan', label: 'Tantangan kimia' },
            { path: '/tentang', label: 'Cara data reaksi disusun' },
          ],
        },
      ],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'LearningResource',
          name: 'Laboratorium Reaksi Kimia Virtual PeriodikLab',
          description:
            'Susun atom, atur kondisi reaksi, dan lihat persamaan setara, pereaksi pembatas, serta sisa zat secara langsung.',
          url: `${site}/lab`,
          inLanguage: 'id',
          learningResourceType: 'Laboratorium virtual',
          educationalLevel: 'Sekolah menengah',
          isAccessibleForFree: true,
          about: [
            { '@type': 'Thing', name: 'Kimia' },
            { '@type': 'Thing', name: 'Stoikiometri' },
            { '@type': 'Thing', name: 'Persamaan reaksi' },
          ],
          isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
        },
        breadcrumbJsonLd(site, [
          { name: 'Tabel periodik', path: '/' },
          { name: 'Laboratorium', path: '/lab' },
        ]),
      ],
    },
    {
      path: '/tantangan',
      title: 'Tantangan Kimia — PeriodikLab',
      description:
        'Latihan kimia tiga tingkat dengan pembahasan, pengulangan soal salah, dan tautan berbagi. Kalibrasi Kurikulum Merdeka dan GCSE.',
      heading: 'Tantangan Kimia Tiga Tingkat',
      intro: [
        'Tantangan PeriodikLab berisi tiga paket soal berbahasa Indonesia: Dasar untuk simbol dan fakta unsur, Menengah untuk konfigurasi elektron, ikatan, dan reaksi umum, serta Mahir untuk stoikiometri, pereaksi pembatas, dan kondisi reaksi.',
        'Setiap sesi memuat 10 soal pilihan ganda dengan pembahasan. Soal yang salah bisa diulang dalam satu sesi baru, skor terbaik disimpan di perangkat, dan hasilnya bisa dibagikan lewat tautan.',
      ],
      facts: [
        { label: 'Tingkat', value: '3' },
        { label: 'Soal per sesi', value: '10' },
        { label: 'Kurikulum', value: 'Merdeka & GCSE' },
      ],
      groups: [
        {
          heading: 'Pilih tingkat',
          items: [
            { path: '/tantangan/dasar', label: 'Dasar', hint: 'simbol, nama, dan fakta dasar unsur' },
            {
              path: '/tantangan/menengah',
              label: 'Menengah',
              hint: 'konfigurasi elektron, ikatan, dan reaksi umum',
            },
            {
              path: '/tantangan/mahir',
              label: 'Mahir',
              hint: 'stoikiometri, pereaksi pembatas, kondisi reaksi',
            },
          ],
        },
        {
          heading: 'Halaman terkait',
          items: [
            { path: '/', label: 'Tabel periodik 118 unsur' },
            { path: '/lab', label: 'Laboratorium reaksi' },
          ],
        },
      ],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Tantangan Kimia — PeriodikLab',
          description:
            'Latihan kimia tiga tingkat berbahasa Indonesia dengan pembahasan tiap soal.',
          url: `${site}/tantangan`,
          inLanguage: 'id',
          isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
          hasPart: (['dasar', 'menengah', 'mahir'] as const).map((level) => ({
            '@type': 'Quiz',
            name: `Tantangan ${level.charAt(0).toUpperCase() + level.slice(1)}`,
            url: `${site}/tantangan/${level}`,
          })),
        },
        breadcrumbJsonLd(site, [
          { name: 'Tabel periodik', path: '/' },
          { name: 'Tantangan', path: '/tantangan' },
        ]),
      ],
    },
    ...(['dasar', 'menengah', 'mahir'] as const).map<PageMeta>((level) => {
      const label = level.charAt(0).toUpperCase() + level.slice(1);
      const blurbs: Record<typeof level, string> = {
        dasar: 'Simbol, nama, nomor atom, dan fakta dasar unsur.',
        menengah: 'Konfigurasi elektron, ikatan kimia, dan reaksi umum.',
        mahir: 'Stoikiometri, pereaksi pembatas, dan kondisi reaksi.',
      };
      return {
        path: `/tantangan/${level}`,
        title: `Tantangan ${label} — PeriodikLab`,
        description: `Paket soal kimia tingkat ${level} berisi 10 pertanyaan orisinal dengan pembahasan.`,
        heading: `Tantangan Kimia Tingkat ${label}`,
        intro: [
          `Paket ${level} berisi 10 soal pilihan ganda yang diacak dari bank soal PeriodikLab. Cakupannya ${blurbs[level].toLowerCase()} Setiap jawaban disertai pembahasan singkat agar bisa dipelajari ulang.`,
          'Skor terbaik tersimpan di perangkat, sesi yang belum selesai bisa dilanjutkan, dan soal yang salah dapat diulang sebagai sesi baru. Tidak perlu akun dan tidak ada data yang dikirim ke server.',
        ],
        facts: [
          { label: 'Jumlah soal', value: '10 per sesi' },
          { label: 'Pembahasan', value: 'ya, tiap soal' },
          { label: 'Penyimpanan', value: 'lokal di perangkat' },
        ],
        groups: [
          {
            heading: 'Tingkat lain',
            items: (['dasar', 'menengah', 'mahir'] as const)
              .filter((item) => item !== level)
              .map((item) => ({
                path: `/tantangan/${item}`,
                label: item.charAt(0).toUpperCase() + item.slice(1),
                hint: blurbs[item],
              })),
          },
          {
            heading: 'Halaman terkait',
            items: [
              { path: '/tantangan', label: 'Semua tantangan' },
              { path: '/lab', label: 'Laboratorium reaksi' },
              { path: '/', label: 'Tabel periodik' },
            ],
          },
        ],
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Quiz',
            name: `Tantangan Kimia Tingkat ${label}`,
            description: blurbs[level],
            url: `${site}/tantangan/${level}`,
            inLanguage: 'id',
            educationalLevel: level,
            isAccessibleForFree: true,
            about: { '@type': 'Thing', name: 'Kimia' },
            isPartOf: {
              '@type': 'CollectionPage',
              name: 'Tantangan Kimia',
              url: `${site}/tantangan`,
            },
          },
          breadcrumbJsonLd(site, [
            { name: 'Tabel periodik', path: '/' },
            { name: 'Tantangan', path: '/tantangan' },
            { name: label, path: `/tantangan/${level}` },
          ]),
        ],
      };
    }),
    {
      path: '/tentang',
      title: 'Tentang, Sumber & Disclaimer — PeriodikLab',
      description:
        'Sumber data, sitasi reaksi, lisensi, disclaimer keselamatan, dan kebijakan penyimpanan lokal PeriodikLab.',
      heading: 'Tentang PeriodikLab',
      intro: [
        'PeriodikLab adalah proyek edukasi kimia berbahasa Indonesia: tabel periodik 118 unsur, laboratorium reaksi, dan tantangan tiga tingkat. Tujuannya membantu siswa membaca tabel periodik dan memahami stoikiometri tanpa perangkat lunak tambahan.',
        'Data unsur dirangkum dari PubChem, NIST, dan sumber kurikulum; reaksi terkurasi disertai sitasi. PeriodikLab bukan pengganti buku teks atau prosedur laboratorium nyata — selalu ikuti petunjuk guru dan aturan keselamatan.',
        'Semua preferensi, skor tantangan, dan draf eksperimen disimpan di localStorage perangkat. Tidak ada akun, pelacakan iklan, atau pengiriman data ke server.',
      ],
      facts: [
        { label: 'Unsur', value: '118' },
        { label: 'Reaksi', value: String(reactions.length) },
        { label: 'Lisensi', value: 'lihat halaman sumber' },
        { label: 'Data pribadi', value: 'tidak dikumpulkan' },
      ],
      groups: [
        {
          heading: 'Jelajahi',
          items: [
            { path: '/', label: 'Tabel periodik' },
            { path: '/lab', label: 'Laboratorium reaksi' },
            { path: '/tantangan', label: 'Tantangan kimia' },
          ],
        },
      ],
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'Tentang PeriodikLab',
          url: `${site}/tentang`,
          inLanguage: 'id',
          isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
          mainEntity: { '@type': 'Organization', name: 'PeriodikLab' },
        },
        breadcrumbJsonLd(site, [
          { name: 'Tabel periodik', path: '/' },
          { name: 'Tentang', path: '/tentang' },
        ]),
      ],
    },
  ];

  const categoryMembers = new Map<string, ElementRow[]>();
  for (const element of elements) {
    const list = categoryMembers.get(element.category) ?? [];
    list.push(element);
    categoryMembers.set(element.category, list);
  }

  for (const element of elements) {
    const category = CATEGORY_LABELS[element.category] ?? element.category;
    const state = STATE_LABELS[element.stateSTP] ?? element.stateSTP;
    const position = [
      element.group != null ? `golongan ${element.group}` : null,
      `periode ${element.period}`,
      `blok ${element.block}`,
    ]
      .filter(Boolean)
      .join(', ');

    const index = elements.findIndex((item) => item.z === element.z);
    const previous = index > 0 ? elements[index - 1] : null;
    const next = index >= 0 && index < elements.length - 1 ? elements[index + 1] : null;

    const peers = (categoryMembers.get(element.category) ?? [])
      .filter((item) => item.z !== element.z)
      .slice(0, 8);

    const intro = [
      `${element.name} (${element.symbol}) adalah ${category} bernomor atom ${element.z}. ${element.summary}`,
      `Di tabel periodik, ${element.name} berada pada ${position}. Massa atomnya ${numberId(
        element.mass,
      )} u, berwujud ${state} pada suhu kamar, dengan konfigurasi elektron ${element.electronConfig}.`,
    ];

    if (element.discoveredYear != null) {
      intro.push(`Unsur ini tercatat ditemukan pada tahun ${element.discoveredYear}.`);
    }

    if (peers.length > 0) {
      intro.push(
        `Sesama ${category} antara lain ${peers
          .slice(0, 5)
          .map((item) => `${item.name} (${item.symbol})`)
          .join(', ')}.`,
      );
    }

    const facts: Fact[] = [
      { label: 'Nomor atom', value: String(element.z) },
      { label: 'Simbol', value: element.symbol },
      { label: 'Kategori', value: category },
      { label: 'Massa atom', value: `${numberId(element.mass)} u` },
      { label: 'Wujud (suhu kamar)', value: state },
      { label: 'Konfigurasi elektron', value: element.electronConfig },
    ];

    const groups: LinkGroup[] = [];
    const around: LinkItem[] = [];
    if (previous) {
      around.push({
        path: `/unsur/${previous.symbol}`,
        label: `← ${previous.name} (${previous.symbol})`,
        hint: `nomor atom ${previous.z}`,
      });
    }
    around.push({ path: '/', label: 'Tabel periodik lengkap' });
    if (next) {
      around.push({
        path: `/unsur/${next.symbol}`,
        label: `${next.name} (${next.symbol}) →`,
        hint: `nomor atom ${next.z}`,
      });
    }
    groups.push({ heading: 'Unsur di sekitar', items: around });

    if (peers.length > 0) {
      groups.push({
        heading: `Unsur lain dalam kategori ${category}`,
        items: peers.map((item) => ({
          path: `/unsur/${item.symbol}`,
          label: `${item.name} (${item.symbol})`,
          hint: `nomor atom ${item.z}`,
        })),
      });
    }

    groups.push({
      heading: 'Coba di laboratorium',
      items: [
        { path: '/lab', label: 'Laboratorium reaksi', hint: 'susun atom dari unsur ini' },
        { path: '/tantangan', label: 'Tantangan kimia', hint: 'uji pemahaman' },
      ],
    });

    pages.push({
      path: `/unsur/${element.symbol}`,
      title: `${element.name} (${element.symbol}) — Unsur ${element.z} | PeriodikLab`,
      description: shorten(
        `${element.name} (${element.symbol}) adalah ${category} bernomor atom ${element.z}. ${element.summary}`,
        155,
      ),
      heading: `${element.name} (${element.symbol})`,
      intro,
      facts,
      groups,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ChemicalSubstance',
          name: element.name,
          alternateName: element.symbol,
          identifier: element.symbol,
          atomicNumber: element.z,
          url: `${site}/unsur/${element.symbol}`,
          isPartOf: { '@type': 'WebSite', name: 'PeriodikLab', url: `${site}/` },
        },
        breadcrumbJsonLd(site, [
          { name: 'Tabel periodik', path: '/' },
          { name: `${element.name} (${element.symbol})`, path: `/unsur/${element.symbol}` },
        ]),
      ],
    });
  }

  return pages;
}

/**
 * Prerender metadata per rute dan sitemap. Dijalankan sebelum service worker
 * dibuat agar halaman hasil prerender ikut masuk precache.
 */
export function prerender(root = process.cwd(), base = '/'): void {
  const dist = resolve(root, 'dist');
  const baseHtml = readFileSync(resolve(dist, 'index.html'), 'utf8');
  const elements = readJson<ElementRow[]>(root, 'src/core/data/elements.json');

  const rawSite = process.env.SITE_URL?.trim();
  const site = (rawSite || DEFAULT_SITE).replace(/\/+$/, '');
  if (!rawSite) {
    console.warn(`[prerender] SITE_URL belum diset; canonical memakai ${DEFAULT_SITE}`);
  }

  const pages = buildPages(root, elements, site);

  const assetFiles = readdirSync(resolve(dist, 'assets'));
  const preload = (pattern: RegExp): string[] =>
    assetFiles
      .filter((file) => pattern.test(file))
      .map((file) => `<link rel="modulepreload" crossorigin href="${base}assets/${file}" />`);

  // Mulai unduh chunk rute lebih awal agar LCP halaman itu tidak menunggu
  // eksekusi bundel utama menemukan dynamic import.
  const preloadsFor = (path: string): string[] => {
    if (path === '/lab') return [...preload(/^LabScreen-.*\.js$/), ...preload(/^data-.*\.js$/)];
    if (path.startsWith('/tantangan')) {
      return [...preload(/^QuizScreen-.*\.js$/), ...preload(/^quiz-.*\.js$/)];
    }
    if (path === '/tentang') return [...preload(/^AboutScreen-.*\.js$/), ...preload(/^data-.*\.js$/)];
    return [];
  };

  for (const page of pages) {
    writePage(dist, page.path, renderPage(baseHtml, page, site, base, preloadsFor(page.path)));
  }

  // Fallback 404 untuk hosting statis yang mendukungnya.
  writeFileSync(
    resolve(dist, '404.html'),
    renderPage(
      baseHtml,
      {
        path: '/',
        title: 'Halaman tidak ditemukan — PeriodikLab',
        description: 'Halaman yang Anda cari tidak tersedia. Kembali ke tabel periodik.',
        heading: 'Halaman tidak ditemukan',
        intro: [
          'Alamat yang Anda buka tidak tersedia di PeriodikLab. Gunakan tautan di bawah untuk kembali ke tabel periodik, laboratorium, atau tantangan.',
        ],
        groups: [
          {
            heading: 'Kembali ke',
            items: [
              { path: '/', label: 'Tabel periodik 118 unsur' },
              { path: '/lab', label: 'Laboratorium reaksi' },
              { path: '/tantangan', label: 'Tantangan kimia' },
            ],
          },
        ],
      },
      site,
      base,
    ),
    'utf8',
  );

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
  let base = '/';
  return {
    name: 'periodiklab-prerender',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      base = config.base;
    },
    closeBundle: {
      order: 'pre',
      sequential: true,
      handler() {
        prerender(root, base);
      },
    },
  };
}
