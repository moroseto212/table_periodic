import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { elements } from '../../core/data';
import { layoutElements } from './layout';
import { focusScrollTarget, type ScrollTarget } from './focus';
import { categoryColors, categoryInkColors, categoryLabels } from '../../ui/tokens';
import { useAppStore } from '../../app/store';
import { useMediaQuery } from '../../ui/useMediaQuery';

const fRow: Record<string, number> = { lanthanide: 9, actinide: 10 };

const DESKTOP_ZOOM = 1.8;
// Selaras dengan durasi transisi transform di index.css.
const MOVE_MS = 320;
// Buffer kecil agar timer finalisasi tidak mendahului transisi transform.
const ZOOM_MS = MOVE_MS + 20;

interface TableFrame {
  width: number;
  height: number;
}

interface ZoomPad {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface ZoomShift {
  x: number;
  y: number;
}

const ZERO_PAD: ZoomPad = { left: 0, top: 0, right: 0, bottom: 0 };
const ZERO_SHIFT: ZoomShift = { x: 0, y: 0 };

function samePad(a: ZoomPad, b: ZoomPad): boolean {
  return a.left === b.left && a.top === b.top && a.right === b.right && a.bottom === b.bottom;
}

export default function Table2D() {
  const select = useAppStore((s) => s.select);
  const selected = useAppStore((s) => s.selected);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const query = useAppStore((s) => s.query);
  const category = useAppStore((s) => s.category);

  const mobile = useMediaQuery('(max-width: 1023px)');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wrapRef = useRef<HTMLDivElement>(null);
  const zoomLayerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | null>(null);
  const entryTimer = useRef<number | null>(null);
  const enteredRef = useRef(false);
  const swapReadyRef = useRef(false);
  const closingRef = useRef(false);
  const prepRef = useRef(false);
  const entryTargetRef = useRef<ScrollTarget | null>(null);
  const padRef = useRef<ZoomPad>(ZERO_PAD);

  const [frame, setFrame] = useState<TableFrame | null>(null);
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(1);
  const [pad, setPad] = useState<ZoomPad>(ZERO_PAD);
  const [padReady, setPadReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const [snap, setSnap] = useState(false);
  const [exitShift, setExitShift] = useState<ZoomShift>(ZERO_SHIFT);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      if (entryTimer.current !== null) window.clearTimeout(entryTimer.current);
    },
    [],
  );

  // Siapkan fase masuk zoom: ukur ukuran dasar tabel, lalu tampilkan padding
  // tanpa transform (posisi visual tetap di tempat semula).
  useEffect(() => {
    if (!selected) {
      prepRef.current = false;
      return;
    }

    if (entryTimer.current !== null) {
      window.clearTimeout(entryTimer.current);
      entryTimer.current = null;
    }

    // Mobile tidak memakai zoom sama sekali: panel bawah hanya menampilkan
    // deskripsi, dan posisi tabel dibiarkan apa adanya.
    if (mobile) {
      prepRef.current = false;
      return;
    }

    const target = DESKTOP_ZOOM;

    if (frame) {
      if (prepRef.current) {
        prepRef.current = false;
        return;
      }

      // Sudah dalam mode zoom. Batalkan animasi tutup bila pengguna memilih
      // unsur lain saat panel sedang menutup.
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (closingRef.current) {
        closingRef.current = false;
        setClosing(false);
        setScale(target);
        swapReadyRef.current = true;
      }
      setExitShift((current) => (current === ZERO_SHIFT ? current : ZERO_SHIFT));
      return;
    }

    const table = tableRef.current;
    if (!table) return;
    const width = table.offsetWidth;
    const height = table.offsetHeight;
    if (width <= 0 || height <= 0) return;

    prepRef.current = true;
    enteredRef.current = false;
    swapReadyRef.current = false;
    closingRef.current = false;
    entryTargetRef.current = null;
    setFrame({ width, height });
    setZoom(target);
    setScale(1);
    setSnap(true);
    setExitShift(ZERO_SHIFT);
  }, [frame, mobile, selected]);

  // Perubahan breakpoint atau ukuran jendela: ukur ulang lalu zoom kembali.
  useEffect(() => {
    setFrame(null);
  }, [mobile]);

  useEffect(() => {
    const onResize = () => setFrame(null);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Tutup panel: pertahankan area scroll dan padding selama animasi, lalu
  // finalisasi dalam satu commit agar tabel tidak melompat.
  useEffect(() => {
    if (selected || !frame) return;

    const wrap = wrapRef.current;
    const table = tableRef.current;
    if (!wrap || !table) return;

    if (entryTimer.current !== null) {
      window.clearTimeout(entryTimer.current);
      entryTimer.current = null;
    }

    swapReadyRef.current = false;
    closingRef.current = true;

    const finalize = () => {
      closeTimer.current = null;
      enteredRef.current = false;
      swapReadyRef.current = false;
      closingRef.current = false;
      setFrame(null);
      setPad(ZERO_PAD);
      setPadReady(false);
      setZoom(1);
      setScale(1);
      setExitShift(ZERO_SHIFT);
      setClosing(false);
      setSnap(false);
    };

    if (reduceMotion) {
      finalize();
      return;
    }

    // Geser tabel kembali ke posisi istirahat lewat transform, bukan dengan
    // menyusutkan area scroll lebih dulu.
    setSnap(false);
    setExitShift({
      x: wrap.scrollLeft - table.offsetLeft,
      y: wrap.scrollTop - table.offsetTop,
    });
    setClosing(true);
    setScale(1);

    closeTimer.current = window.setTimeout(finalize, ZOOM_MS);

    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [frame, reduceMotion, selected]);

  // Setelah zoom-out selesai, kembalikan scroll dalam commit yang sama dengan
  // penghapusan transform agar tidak ada frame perantara yang melompat.
  // Di mobile tidak ada zoom, jadi posisi scroll harus dipertahankan apa adanya.
  useLayoutEffect(() => {
    if (mobile || frame || selected) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (wrap.scrollLeft !== 0 || wrap.scrollTop !== 0) {
      wrap.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    }
  }, [frame, mobile, selected]);

  // Ruang gulir ekstra di tiap sisi agar kartu paling tepi pun bisa dipusatkan
  // saat panel desktop mengurangi area terlihat. Mobile tidak memakai padding ini
  // karena tidak ada zoom.
  useLayoutEffect(() => {
    if (!frame) {
      setPad((current) => (samePad(current, ZERO_PAD) ? current : ZERO_PAD));
      setPadReady(false);
      return;
    }

    // Saat panel baru ditutup, padding dibekukan sampai animasi zoom-out selesai.
    if (!selected || closing) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    const panel = panelOpen ? document.querySelector<HTMLElement>('.element-panel') : null;
    const viewportWidth = wrap.clientWidth;
    const viewportHeight = wrap.clientHeight;
    const insetRight = panelOpen && !mobile ? (panel?.offsetWidth ?? 0) + 24 : 0;
    const visibleCenterX = Math.max(0, (viewportWidth - insetRight) / 2);
    const visibleCenterY = Math.max(0, viewportHeight / 2);
    const next: ZoomPad = {
      left: Math.round(visibleCenterX),
      right: Math.round(viewportWidth - visibleCenterX),
      top: Math.round(visibleCenterY),
      bottom: Math.round(viewportHeight - visibleCenterY),
    };

    setPad((current) => (samePad(current, next) ? current : next));
    setPadReady(true);
  }, [closing, frame, mobile, panelOpen, selected, zoom]);

  // Saat padding zoom berubah (mis. baru masuk mode zoom), geser scroll dengan
  // selisih padding supaya posisi visual tabel tidak melompat. Kompensasi ini
  // dijalankan sebelum paint sehingga pengguna hanya melihat animasi.
  useLayoutEffect(() => {
    const previous = padRef.current;
    padRef.current = pad;
    if (samePad(previous, pad) || !frame || closing || reduceMotion) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    const dx = pad.left - previous.left;
    const dy = pad.top - previous.top;
    if (dx !== 0) wrap.scrollLeft += dx;
    if (dy !== 0) wrap.scrollTop += dy;
  }, [closing, frame, pad, reduceMotion]);

  // Fase masuk zoom: scroll dibiarkan di posisi awal, lalu seluruh perpindahan
  // kamera (pan + skala) dianimasikan lewat satu transform. Dengan begitu pan
  // dan skala berjalan bersamaan di compositor.
  useLayoutEffect(() => {
    if (!selected || !frame || zoom === 1 || closing || !padReady || enteredRef.current) return;

    const wrap = wrapRef.current;
    const zoomLayer = zoomLayerRef.current;
    const table = tableRef.current;
    const cell = cellRefs.current[selected];
    if (!wrap || !zoomLayer || !table || !cell) return;

    const panel = panelOpen ? document.querySelector<HTMLElement>('.element-panel') : null;
    const insetRight = panelOpen && !mobile ? (panel?.offsetWidth ?? 0) + 24 : 0;

    const target = focusScrollTarget({
      zoom,
      viewportWidth: wrap.clientWidth,
      viewportHeight: wrap.clientHeight,
      contentWidth: wrap.scrollWidth,
      contentHeight: wrap.scrollHeight,
      zoomLayerLeft: zoomLayer.offsetLeft,
      zoomLayerTop: zoomLayer.offsetTop,
      tableLeft: table.offsetLeft,
      tableTop: table.offsetTop,
      cellLeft: cell.offsetLeft,
      cellTop: cell.offsetTop,
      cellWidth: cell.offsetWidth,
      cellHeight: cell.offsetHeight,
      insetRight,
      insetBottom: 0,
    });

    enteredRef.current = true;
    swapReadyRef.current = false;
    entryTargetRef.current = target;

    if (reduceMotion) {
      // `snap` masih true di sini, jadi perubahan skala diterapkan tanpa transisi.
      wrap.scrollTo({ left: target.left, top: target.top, behavior: 'auto' });
      setScale(zoom);
      setExitShift(ZERO_SHIFT);
      swapReadyRef.current = true;
      return;
    }

    // Transform akhir menggeser tabel sejauh selisih scroll, sehingga pada
    // akhir animasi posisinya sama dengan state scroll final.
    const startLeft = wrap.scrollLeft;
    const startTop = wrap.scrollTop;

    setSnap(false);
    setScale(zoom);
    setExitShift({ x: startLeft - target.left, y: startTop - target.top });

    entryTimer.current = window.setTimeout(() => {
      entryTimer.current = null;
      // Tukar transform dengan scroll final dalam satu commit (efek di bawah).
      setSnap(true);
      setExitShift(ZERO_SHIFT);
    }, ZOOM_MS);
  }, [closing, frame, mobile, padReady, panelOpen, reduceMotion, selected, zoom]);

  // Setelah animasi masuk selesai, pindahkan scroll ke target dan lepaskan
  // transform dalam commit yang sama agar tidak ada frame yang melompat.
  useLayoutEffect(() => {
    if (!snap || !enteredRef.current || closing) return;
    const wrap = wrapRef.current;
    const target = entryTargetRef.current;
    if (!wrap || !target) return;

    wrap.scrollTo({ left: target.left, top: target.top, behavior: 'auto' });
    swapReadyRef.current = true;

    const raf = requestAnimationFrame(() => setSnap(false));
    return () => cancelAnimationFrame(raf);
  }, [closing, snap]);

  // Saat berpindah unsur (sudah dalam mode zoom), geser kamera ke kartu baru.
  useEffect(() => {
    if (!selected || !frame || zoom === 1 || closing || !swapReadyRef.current) return;
    const wrap = wrapRef.current;
    const zoomLayer = zoomLayerRef.current;
    const table = tableRef.current;
    const cell = cellRefs.current[selected];
    if (!wrap || !zoomLayer || !table || !cell) return;

    const raf = requestAnimationFrame(() => {
      const panel = panelOpen ? document.querySelector<HTMLElement>('.element-panel') : null;
      const insetRight = panelOpen && !mobile ? (panel?.offsetWidth ?? 0) + 24 : 0;

      const target = focusScrollTarget({
        zoom,
        viewportWidth: wrap.clientWidth,
        viewportHeight: wrap.clientHeight,
        contentWidth: wrap.scrollWidth,
        contentHeight: wrap.scrollHeight,
        zoomLayerLeft: zoomLayer.offsetLeft,
        zoomLayerTop: zoomLayer.offsetTop,
        tableLeft: table.offsetLeft,
        tableTop: table.offsetTop,
        cellLeft: cell.offsetLeft,
        cellTop: cell.offsetTop,
        cellWidth: cell.offsetWidth,
        cellHeight: cell.offsetHeight,
        insetRight,
        insetBottom: 0,
      });

      wrap.scrollTo({
        left: target.left,
        top: target.top,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [closing, frame, mobile, panelOpen, reduceMotion, selected, zoom]);

  const placements = layoutElements(elements);
  const counters: Record<string, number> = {};

  const q = query.trim().toLowerCase();

  return (
    <div
      ref={wrapRef}
      className={`table2d-wrap${frame ? ' is-zoomed' : ''}${closing ? ' is-closing' : ''}`}
      data-panel-open={panelOpen ? 'true' : 'false'}
    >
      <div
        ref={zoomLayerRef}
        className="table2d-zoom"
        style={
          frame
            ? {
                width: frame.width * zoom + pad.left + pad.right,
                height: frame.height * zoom + pad.top + pad.bottom,
                padding: `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`,
              }
            : undefined
        }
      >
        <div
          ref={tableRef}
          className="table2d"
          role="list"
          aria-label="Tabel periodik 2D"
          style={
            frame
              ? {
                  width: frame.width,
                  height: frame.height,
                  margin: 0,
                  transition: snap ? 'none' : undefined,
                  ['--table-zoom' as string]: scale,
                  ['--table-shift-x' as string]: `${exitShift.x}px`,
                  ['--table-shift-y' as string]: `${exitShift.y}px`,
                }
              : { transition: 'none' }
          }
        >
          {placements.map(({ element }) => {
            const isF = element.group == null;
            let column = element.group ?? 0;
            let row = element.period;
            if (isF) {
              const key = element.category;
              counters[key] = (counters[key] ?? 0) + 1;
              column = 2 + counters[key];
              row = fRow[key] ?? 9;
            }
            const match =
              (!q ||
                element.symbol.toLowerCase().startsWith(q) ||
                element.name.toLowerCase().includes(q) ||
                String(element.z) === q) &&
              (category === 'all' || element.category === category);
            const isSelected = selected === element.symbol;

            return (
              <button
                key={element.symbol}
                ref={(node) => {
                  cellRefs.current[element.symbol] = node;
                }}
                type="button"
                role="listitem"
                className={`cell2d${match ? '' : ' is-dim'}${isSelected ? ' is-selected' : ''}`}
                style={{
                  gridColumn: column,
                  gridRow: row,
                  ['--cell-accent' as string]: categoryColors[element.category],
                  ['--cell-ink' as string]: categoryInkColors[element.category],
                }}
                onClick={() => select(element.symbol)}
                aria-label={`${element.name}, simbol ${element.symbol}, nomor atom ${element.z}, ${categoryLabels[element.category]}`}
              >
                <span className="cell2d__z">{element.z}</span>
                <span className="cell2d__symbol">{element.symbol}</span>
                <span className="cell2d__name">{element.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
