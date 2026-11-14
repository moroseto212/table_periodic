import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { prerenderPlugin } from './scripts/prerender-plugin.ts';

// Base deployment (mis. "/table_periodic/" untuk GitHub Pages). Kosong = "/".
const rawBase = process.env.BASE_PATH?.trim() || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
const asset = (path: string) => `${base}${path.replace(/^\/+/, '')}`;

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    prerenderPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'PeriodikLab — Tabel Periodik & Lab Kimia',
        short_name: 'PeriodikLab',
        description:
          'Tabel periodik interaktif, laboratorium reaksi, dan tantangan kimia berbahasa Indonesia.',
        lang: 'id',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#0F1016',
        theme_color: '#0F1016',
        categories: ['education', 'science'],
        icons: [
          {
            src: asset('icons/icon-192.png'),
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: asset('icons/icon-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: asset('icons/icon-maskable-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Laboratorium',
            short_name: 'Lab',
            description: 'Buka baki unsur dan mulai reaksi',
            url: asset('lab'),
            icons: [{ src: asset('icons/icon-192.png'), sizes: '192x192' }],
          },
          {
            name: 'Tantangan',
            short_name: 'Kuis',
            description: 'Latihan kimia tiga tingkat',
            url: asset('tantangan'),
            icons: [{ src: asset('icons/icon-192.png'), sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Hanya aplikasi shell + aset yang diprecache. Halaman per rute dilayani
        // lewat navigateFallback, jadi 125 HTML prerender tidak perlu diunduh
        // saat service worker memasang (menghemat ~900 KB pada kunjungan pertama).
        globPatterns: ['index.html', '**/*.{js,css,svg,png,json,woff2}'],
        // Gambar OG hanya dipakai crawler/sosial, tidak perlu ikut precache offline.
        globIgnores: ['og/**'],
        navigateFallback: asset('index.html'),
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
