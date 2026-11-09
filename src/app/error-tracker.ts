export interface ErrorRecord {
  at: string;
  message: string;
  source?: string;
  stack?: string;
}

const STORAGE_KEY = 'periodic-lab.error-log';
const MAX_RECORDS = 25;

function readLog(): ErrorRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ErrorRecord =>
        typeof item === 'object' && item !== null && typeof (item as ErrorRecord).message === 'string',
    );
  } catch {
    return [];
  }
}

export function readErrors(): ErrorRecord[] {
  return readLog();
}

export function clearErrors(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Penyimpanan bisa diblokir; abaikan.
  }
}

export function recordError(record: ErrorRecord): void {
  try {
    const next = [record, ...readLog()].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Jangan sampai pelaporan error ikut membuat aplikasi gagal.
  }
  console.warn('[PeriodikLab]', record.message);
}

/**
 * Penangkap error global ringan tanpa backend. Catatan terakhir disimpan lokal
 * agar bisa diperiksa lewat halaman Tentang saat pengguna melaporkan masalah.
 */
export function installErrorTracking(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    recordError({
      at: new Date().toISOString(),
      message: event.message || 'Kesalahan skrip tidak dikenal',
      source: event.filename
        ? `${event.filename}:${event.lineno ?? 0}:${event.colno ?? 0}`
        : undefined,
      stack: event.error instanceof Error ? event.error.stack : undefined,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason;
    recordError({
      at: new Date().toISOString(),
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}
