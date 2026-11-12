import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { elements } from './core/data/elements';
import { useAppStore, type CategoryFilter } from './app/store';
import { categoryColors, categoryInkColors, categoryLabels } from './ui/tokens';
import { applyTheme } from './app/theme';
import { navigate, segments, useRoute } from './app/router';
import Table2D from './features/table2d/Table2D';
import ElementPanel from './features/element-panel/ElementPanel';
import { ConnectionStatus } from './ui/ConnectionStatus';
import { PwaBanner } from './ui/PwaBanner';
import type { ElementCategory } from './core/chemistry/types';

const LabScreen = lazy(() => import('./features/lab/LabScreen'));
const QuizScreen = lazy(() => import('./features/quiz/QuizScreen'));
const AboutScreen = lazy(() => import('./features/about/AboutScreen'));

const MODES = [
  { id: '', label: 'Jelajah', path: '/' },
  { id: 'lab', label: 'Laboratorium', path: '/lab' },
  { id: 'tantangan', label: 'Tantangan', path: '/tantangan' },
  { id: 'tentang', label: 'Tentang', path: '/tentang' },
];

const HINT_KEY = 'periodic-lab.hint-dismissed';

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '': {
    title: 'PeriodikLab — Tabel Periodik & Laboratorium Kimia',
    description:
      'Tabel periodik 118 unsur berbahasa Indonesia, lengkap dengan laboratorium reaksi virtual, stoikiometri, dan tantangan kimia tiga tingkat.',
  },
  lab: {
    title: 'Laboratorium Reaksi — PeriodikLab',
    description:
      'Campur atom di baki, atur kondisi reaksi, dan lihat stoikiometri, pereaksi pembatas, serta sisa zat secara langsung.',
  },
  tantangan: {
    title: 'Tantangan Kimia — PeriodikLab',
    description:
      'Latihan kimia tiga tingkat dengan pembahasan, pengulangan soal salah, dan tautan berbagi. Kalibrasi Kurikulum Merdeka dan GCSE.',
  },
  tentang: {
    title: 'Tentang, Sumber & Disclaimer — PeriodikLab',
    description:
      'Sumber data, sitasi reaksi, lisensi, disclaimer keselamatan, dan kebijakan penyimpanan lokal PeriodikLab.',
  },
  'tidak-ditemukan': {
    title: 'Halaman tidak ditemukan — PeriodikLab',
    description: 'Halaman yang Anda cari tidak tersedia. Kembali ke tabel periodik.',
  },
};

const QUIZ_LEVEL_TITLES: Record<string, string> = {
  dasar: 'Tantangan dasar — PeriodikLab',
  menengah: 'Tantangan menengah — PeriodikLab',
  mahir: 'Tantangan mahir — PeriodikLab',
};

/** Batasi meta description agar tidak terpotong di hasil pencarian. */
function clip(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : cut.length)}…`;
}

function metaFor(path: string) {
  const parts = segments(path);
  const mode = parts[0] ?? '';

  if (mode === 'unsur' && parts[1]) {
    const element = elements.find((el) => el.symbol === parts[1]);
    if (element) {
      return {
        title: `${element.name} (${element.symbol}) — Unsur ${element.z} | PeriodikLab`,
        description: clip(
          `${element.name} (${element.symbol}) adalah ${categoryLabels[element.category].toLowerCase()} bernomor atom ${element.z}. ${element.summary}`,
        ),
      };
    }
  }

  if (mode === 'tantangan' && parts[1] && QUIZ_LEVEL_TITLES[parts[1]]) {
    return {
      title: QUIZ_LEVEL_TITLES[parts[1]],
      description: `Paket soal kimia tingkat ${parts[1]} dengan pembahasan orisinal.`,
    };
  }

  return ROUTE_META[mode] ?? ROUTE_META['tidak-ditemukan'];
}

function TopBar() {
  const route = useRoute();
  const mode = segments(route.path)[0] ?? '';
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);
  const select = useAppStore((s) => s.select);
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return elements
      .filter(
        (el) =>
          el.symbol.toLowerCase().startsWith(q) ||
          el.name.toLowerCase().includes(q) ||
          String(el.z).startsWith(q),
      )
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        (wrapRef.current?.querySelector('input') as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (symbol: string) => {
    select(symbol);
    setQuery('');
    setOpen(false);
  };

  const isTable = mode === '' || mode === 'unsur';
  const categories = useMemo(() => {
    const present = new Set<ElementCategory>(elements.map((el) => el.category));
    return (Object.keys(categoryLabels) as ElementCategory[]).filter((key) => present.has(key));
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__row">
        <button type="button" className="brand" onClick={() => navigate('/')} aria-label="PeriodikLab — jelajah tabel periodik">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">
            Periodik<strong>Lab</strong>
          </span>
        </button>

        <nav className="mode-nav" aria-label="Mode aplikasi">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mode-nav__item${mode === item.id ? ' is-active' : ''}`}
              aria-current={mode === item.id ? 'page' : undefined}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="search" ref={wrapRef}>
          <label className="search__field">
            <span className="sr-only">Cari unsur</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="search__icon">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              type="text"
              inputMode="search"
              placeholder="Cari nama, simbol, atau nomor atom…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && results[0]) {
                  event.preventDefault();
                  choose(results[0].symbol);
                }
                if (event.key === 'Escape') {
                  setOpen(false);
                  setQuery('');
                }
              }}
              autoComplete="off"
            />
            <kbd className="search__kbd">Ctrl K</kbd>
          </label>

          {open && query.trim() !== '' && (
            <div className="search__results" role="listbox" aria-label="Hasil pencarian">
              {results.length === 0 && (
                <p className="search__empty">
                  Tidak ada unsur bernama “{query.trim()}”. Coba simbol (Fe) atau nomor atom
                  (26).
                </p>
              )}
              {results.map((el) => (
                <button
                  key={el.symbol}
                  type="button"
                  role="option"
                  aria-selected="false"
                  className="search__result"
                  onClick={() => choose(el.symbol)}
                >
                  <span className="search__z">{el.z}</span>
                  <span className="search__symbol">{el.symbol}</span>
                  <span className="search__name">{el.name}</span>
                  <span
                    className="search__cat"
                    style={{
                      ['--cat-color' as string]: categoryColors[el.category],
                      ['--cat-ink' as string]: categoryInkColors[el.category],
                    }}
                  >
                    {categoryLabels[el.category]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar">
          <ConnectionStatus />
          <button
            type="button"
            className="tool-btn tool-btn--theme"
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            title={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            onClick={toggleTheme}
          >
            <span className="tool-btn__icon" aria-hidden="true">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
                </svg>
              )}
            </span>
            <span className="tool-btn__label">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
          </button>
        </div>
      </div>

      {isTable && (
        <div className="chipbar" role="group" aria-label="Filter kategori unsur">
          <button
            type="button"
            className={`chip${category === 'all' ? ' is-active' : ''}`}
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
          >
            Semua
          </button>
          {categories.map((key) => (
            <button
              key={key}
              type="button"
              className={`chip${category === key ? ' is-active' : ''}`}
              onClick={() => setCategory(key as CategoryFilter)}
              aria-pressed={category === key}
            >
              <span
                className="chip__dot"
                style={{
                  ['--dot-color' as string]: categoryColors[key],
                  ['--dot-ink' as string]: categoryInkColors[key],
                }}
                aria-hidden="true"
              />
              {categoryLabels[key]}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function HintBar() {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(HINT_KEY) === '1',
  );

  if (dismissed) return null;

  return (
    <div className="hint">
      <span>Ketuk kartu untuk melihat detail · geser tabel untuk menjelajah</span>
      <button
        type="button"
        className="hint__close"
        aria-label="Tutup petunjuk"
        onClick={() => {
          localStorage.setItem(HINT_KEY, '1');
          setDismissed(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}

function ExploreScreen() {
  const select = useAppStore((s) => s.select);
  const selected = useAppStore((s) => s.selected);
  const element = selected ? elements.find((el) => el.symbol === selected) : null;

  return (
    <>
      <h1 className="sr-only">Tabel periodik interaktif PeriodikLab</h1>
      <div className="stage">
        <Table2D />
      </div>
      <ElementPanel />
      <HintBar />
      <p className="sr-only" aria-live="polite">
        {element
          ? `${element.name}, simbol ${element.symbol}, nomor atom ${element.z}, ${categoryLabels[element.category]}.`
          : ''}
      </p>
      <div className="sr-only">
        <h2>Daftar unsur yang tersedia</h2>
        <ul>
          {elements.map((el) => (
            <li key={el.symbol}>
              <button type="button" onClick={() => select(el.symbol)}>
                {el.z} {el.symbol} {el.name}, {categoryLabels[el.category]}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function App() {
  const route = useRoute();
  const mode = segments(route.path)[0] ?? '';
  const theme = useAppStore((s) => s.theme);
  const select = useAppStore((s) => s.select);
  const closePanel = useAppStore((s) => s.closePanel);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (mode === 'unsur') {
      const symbol = segments(route.path)[1];
      if (symbol) select(symbol);
    } else {
      closePanel();
    }
  }, [closePanel, mode, route.path, select]);

  useEffect(() => {
    const meta = metaFor(route.path);
    document.title = meta.title;
    const tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute('content', meta.description);
  }, [route.path]);

  return (
    <div className="app">
      <TopBar />
      <PwaBanner />
      <main className="app__main">
        {mode === '' || mode === 'unsur' ? <ExploreScreen /> : null}
        <Suspense
          fallback={
            <div className="route-loading" role="status">
              Memuat…
            </div>
          }
        >
          {mode === 'lab' ? <LabScreen initial={route.search.get('s')} /> : null}
          {mode === 'tantangan' ? (
            <QuizScreen focusSymbol={route.search.get('unsur')} path={route.path} />
          ) : null}
          {mode === 'tentang' ? <AboutScreen /> : null}
        </Suspense>
        {!['', 'unsur', 'lab', 'tantangan', 'tentang'].includes(mode) && (
          <div className="empty-route">
            <h1>Halaman tidak ditemukan</h1>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
              Kembali ke tabel
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
