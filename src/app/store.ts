import { create } from 'zustand';
import type { ElementCategory } from '../core/chemistry/types';
import { navigate } from './router';
import { initialTheme, persistTheme, type Theme } from './theme';

export type CategoryFilter = ElementCategory | 'all';

interface AppState {
  selected: string | null;
  hovered: string | null;
  query: string;
  category: CategoryFilter;
  panelOpen: boolean;
  theme: Theme;
  select: (symbol: string | null) => void;
  setHovered: (symbol: string | null) => void;
  setQuery: (query: string) => void;
  setCategory: (category: CategoryFilter) => void;
  closePanel: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selected: null,
  hovered: null,
  query: '',
  category: 'all',
  panelOpen: false,
  theme: initialTheme(),
  select: (symbol) => {
    set({ selected: symbol, panelOpen: symbol !== null });
    if (symbol) {
      const path = `/unsur/${symbol}`;
      if (window.location.pathname !== path) {
        // Ganti entri riwayat saat berpindah antar-unsur agar tombol kembali
        // tidak membuka ulang panel unsur sebelumnya.
        navigate(path, { replace: window.location.pathname.startsWith('/unsur/') });
      }
    }
  },
  setHovered: (symbol) => set({ hovered: symbol }),
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  closePanel: () => {
    set({ panelOpen: false, selected: null, hovered: null });
    if (window.location.pathname.startsWith('/unsur/')) {
      // Kembali ke tabel tanpa menumpuk riwayat, sehingga panel tidak
      // terbuka lagi saat pengguna menekan tombol kembali.
      navigate('/', { replace: true });
    }
  },
  setTheme: (theme) => {
    persistTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      persistTheme(theme);
      return { theme };
    }),
}));
