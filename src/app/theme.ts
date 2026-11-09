export type Theme = 'dark' | 'light';

export const THEME_KEY = 'periodic-lab.theme';

/** Tema bawaan mengikuti preferensi sistem. */
export function systemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Pilihan eksplisit pengguna, atau null bila belum pernah memilih. */
export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export function initialTheme(): Theme {
  return readStoredTheme() ?? systemTheme();
}

export function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Penyimpanan bisa diblokir; tema tetap berlaku untuk sesi ini.
  }
}

/** Sinkronkan atribut <html>, color-scheme, dan theme-color peramban. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F6FB' : '#0F1016');
}
