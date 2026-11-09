import { useEffect, useState } from 'react';

/**
 * Status koneksi + konfirmasi service worker siap offline.
 * Hanya muncul saat offline atau beberapa detik setelah aplikasi siap offline.
 */
export function ConnectionStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    const onReady = () => {
      setReady(true);
      window.setTimeout(() => setReady(false), 5000);
    };

    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    window.addEventListener('pl:pwa-ready', onReady);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
      window.removeEventListener('pl:pwa-ready', onReady);
    };
  }, []);

  if (online && !ready) return null;

  return (
    <span
      className={`conn-pill${online ? ' conn-pill--ready' : ' conn-pill--offline'}`}
      role="status"
      aria-live="polite"
    >
      {online ? 'Siap offline' : 'Mode offline'}
    </span>
  );
}
