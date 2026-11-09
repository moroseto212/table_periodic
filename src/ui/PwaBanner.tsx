import { useEffect, useState } from 'react';
import { applyUpdate, canInstall, promptInstall } from '../app/pwa';

/**
 * Baris tipis di bawah topbar: ajakan memasang PWA atau memuat versi baru.
 * Tidak muncul bila peramban tidak mendukung instalasi.
 */
export function PwaBanner() {
  const [installable, setInstallable] = useState(() => canInstall());
  const [updateReady, setUpdateReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onInstall = () => {
      setInstallable(true);
      setHidden(false);
    };
    const onInstalled = () => setInstallable(false);
    const onUpdate = () => {
      setUpdateReady(true);
      setHidden(false);
    };

    window.addEventListener('pl:install-available', onInstall);
    window.addEventListener('pl:installed', onInstalled);
    window.addEventListener('pl:pwa-update', onUpdate);
    return () => {
      window.removeEventListener('pl:install-available', onInstall);
      window.removeEventListener('pl:installed', onInstalled);
      window.removeEventListener('pl:pwa-update', onUpdate);
    };
  }, []);

  if (hidden || (!installable && !updateReady)) return null;

  return (
    <div className="pwa-banner" role="status">
      <span className="pwa-banner__text">
        {updateReady
          ? 'Versi baru PeriodikLab tersedia.'
          : 'Pasang PeriodikLab agar bisa dibuka offline.'}
      </span>
      {updateReady ? (
        <button
          type="button"
          className="btn btn--small btn--primary"
          onClick={() => void applyUpdate()}
        >
          Muat ulang
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--small btn--primary"
          onClick={async () => {
            const result = await promptInstall();
            if (result !== 'unavailable') setInstallable(false);
          }}
        >
          Pasang
        </button>
      )}
      <button
        type="button"
        className="icon-btn"
        aria-label="Tutup pemberitahuan"
        onClick={() => setHidden(true)}
      >
        ✕
      </button>
    </div>
  );
}
