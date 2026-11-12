import { registerSW } from 'virtual:pwa-register';

interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let started = false;
let deferredPrompt: InstallPromptEvent | null = null;
let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null;

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  const event = deferredPrompt;
  deferredPrompt = null;
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome;
}

export async function applyUpdate(): Promise<void> {
  await updateServiceWorker?.(true);
}

/** Menangkap peluang instalasi PWA dari peramban. Aman dipanggil sebelum render. */
export function installPwaHooks(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pl:install-available'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pl:installed'));
  });
}

/**
 * Mendaftarkan service worker hanya di build produksi. Vite dev tidak memakai SW
 * agar perubahan kode langsung terlihat tanpa cache.
 */
export function registerServiceWorker(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;

  // Daftarkan setelah halaman selesai dimuat dan browser menganggur agar
  // unduhan precache tidak bersaing dengan LCP pada kunjungan pertama.
  const start = () => {
    updateServiceWorker = registerSW({
      immediate: true,
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('pl:pwa-ready'));
      },
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('pl:pwa-update'));
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return;
        // Periksa pembaruan saat tab aktif, paling sering sekali sejam.
        window.setInterval(
          () => {
            if (document.visibilityState === 'visible') void registration.update();
          },
          60 * 60 * 1000,
        );
      },
    });
  };

  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      window.setTimeout(start, 1200);
    }
  };

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}
