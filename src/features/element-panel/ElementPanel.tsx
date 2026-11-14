import { useEffect, useRef, useState } from 'react';
import type { Element, ElementCategory } from '../../core/chemistry/types';
import { elements } from '../../core/data/elements';
import { categoryColors, categoryInkColors, categoryLabels } from '../../ui/tokens';
import { useAppStore } from '../../app/store';
import { navigate } from '../../app/router';
import { groupPath, periodPath } from '../../content/categories';

const GHS_LABELS: Record<string, string> = {
  GHS02: 'Mudah terbakar',
  GHS03: 'Pengoksidasi',
  GHS04: 'Gas bertekanan',
  GHS05: 'Korosif',
  GHS06: 'Toksin akut',
  GHS07: 'Iritan',
  GHS08: 'Bahaya kesehatan',
};

const STATE_LABELS: Record<string, string> = {
  solid: 'Padat',
  liquid: 'Cair',
  gas: 'Gas',
  aqueous: 'Larutan',
};

type Tab = 'ringkasan' | 'sifat' | 'kulit' | 'tren' | 'bahaya';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'sifat', label: 'Sifat' },
  { id: 'kulit', label: 'Kulit e⁻' },
  { id: 'tren', label: 'Tren' },
  { id: 'bahaya', label: 'Bahaya' },
];

function fmt(value: number | null, unit = '', digits = 2): string {
  if (value == null) return '—';
  return `${value.toLocaleString('id-ID', { maximumFractionDigits: digits })}${unit}`;
}

function CategoryBadge({ category }: { category: ElementCategory }) {
  return (
    <span
      className="badge"
      style={{
        ['--badge-color' as string]: categoryColors[category],
        ['--badge-ink' as string]: categoryInkColors[category],
      }}
    >
      <span className="badge__dot" aria-hidden="true" />
      {categoryLabels[category]}
    </span>
  );
}

function SummaryTab({ element }: { element: Element }) {
  return (
    <div className="panel-stack">
      <p className="panel-summary">{element.summary}</p>

      <dl className="facts">
        <div className="fact">
          <dt>Massa atom</dt>
          <dd>{fmt(element.mass, ' u', 4)}</dd>
        </div>
        <div className="fact">
          <dt>Fasa (STP)</dt>
          <dd>{STATE_LABELS[element.stateSTP] ?? element.stateSTP}</dd>
        </div>
        <div className="fact">
          <dt>Golongan / periode</dt>
          <dd>
            {element.group ?? 'f-blok'} · {element.period}
          </dd>
        </div>
        <div className="fact">
          <dt>Ditemukan</dt>
          <dd>{element.discoveredYear ?? 'Sejak zaman kuno'}</dd>
        </div>
      </dl>

      <div className="panel-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(`/lab?s=${element.symbol}`)}
        >
          Buka di Laboratorium
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate(`/tantangan?unsur=${element.symbol}`)}
        >
          Tantang saya
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate(groupPath(element.category))}
        >
          Semua {categoryLabels[element.category].toLowerCase()}
        </button>
        <button type="button" className="btn" onClick={() => navigate(periodPath(element.period))}>
          Periode {element.period}
        </button>
      </div>
    </div>
  );
}

function PropertiesTab({ element }: { element: Element }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Titik leleh', value: fmt(element.meltingK, ' K', 1) },
    { label: 'Titik didih', value: fmt(element.boilingK, ' K', 1) },
    { label: 'Massa jenis', value: fmt(element.densityGcm3, ' g/cm³', 3) },
    { label: 'Elektronegativitas', value: fmt(element.electronegativity, '', 2) },
    { label: 'Jari-jari atom', value: fmt(element.atomicRadiusPm, ' pm', 0) },
    { label: 'Energi ionisasi', value: fmt(element.ionizationKJmol, ' kJ/mol', 1) },
    {
      label: 'Bilangan oksidasi',
      value: element.oxidationStates.length ? element.oxidationStates.join(', ') : '—',
    },
    { label: 'Blok', value: `${element.block}-blok` },
  ];

  return (
    <dl className="facts facts--dense">
      {rows.map((row) => (
        <div className="fact" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ShellsTab({ element }: { element: Element }) {
  const max = Math.max(...element.shells, 1);
  return (
    <div className="panel-stack">
      <div className="electron-config">
        <span className="electron-config__label">Konfigurasi</span>
        <code>{element.electronConfig}</code>
      </div>
      <ul className="shells" aria-label="Elektron per kulit">
        {element.shells.map((count, index) => (
          <li className="shell" key={index}>
            <span className="shell__name">Kulit {index + 1}</span>
            <span className="shell__bar" aria-hidden="true">
              <span style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="shell__count">{count} e⁻</span>
          </li>
        ))}
      </ul>
      <p className="panel-note">
        Total {element.shells.reduce((a, b) => a + b, 0)} elektron, sama dengan nomor atom{' '}
        {element.z}.
      </p>
    </div>
  );
}

function TrendsTab({ element }: { element: Element }) {
  const peers = elements.filter(
    (el) => el.period === element.period && el.group != null && element.group != null,
  );
  const metric = (el: Element) => el.electronegativity;
  const values = peers.map(metric).filter((v): v is number => v != null);
  const max = values.length ? Math.max(...values) : 1;

  return (
    <div className="panel-stack">
      <p className="panel-note">
        Elektronegativitas unsur segolongan periode {element.period}. Nilai naik ke arah kanan
        karena muatan inti efektif bertambah.
      </p>
      <ul className="trend-list">
        {peers.map((peer) => {
          const value = metric(peer);
          const pct = value == null ? 0 : (value / max) * 100;
          return (
            <li className={peer.symbol === element.symbol ? 'is-current' : ''} key={peer.symbol}>
              <span className="trend-list__symbol">{peer.symbol}</span>
              <span className="trend-list__bar">
                <span
                  style={{
                    width: `${pct}%`,
                    ['--bar-color' as string]: categoryColors[peer.category],
                    ['--bar-ink' as string]: categoryInkColors[peer.category],
                  }}
                />
              </span>
              <span className="trend-list__value">{value == null ? '—' : value.toFixed(2)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HazardsTab({ element }: { element: Element }) {
  return (
    <div className="panel-stack">
      {element.hazards.length ? (
        <ul className="hazard-list">
          {element.hazards.map((code) => (
            <li key={code}>
              <span className="hazard-code">{code}</span>
              <span>{GHS_LABELS[code] ?? 'Bahaya bahan kimia'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel-note">
          Tidak ada klasifikasi bahaya GHS yang tercatat untuk bentuk unsur ini pada kondisi
          standar. Tetap tangani dengan prosedur laboratorium yang benar.
        </p>
      )}

      <div className="sources">
        <span className="sources__label">Sumber data</span>
        <ul>
          {element.sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ElementPanel() {
  const selected = useAppStore((s) => s.selected);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const closePanel = useAppStore((s) => s.closePanel);
  const [tab, setTab] = useState<Tab>('ringkasan');
  const [switching, setSwitching] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const previousSelected = useRef(selected);
  const switchTimer = useRef<number | null>(null);

  const element = selected ? elements.find((el) => el.symbol === selected) ?? null : null;

  useEffect(() => {
    setTab('ringkasan');
  }, [selected]);

  useEffect(() => {
    const previous = previousSelected.current;
    previousSelected.current = selected;

    if (!selected || !panelOpen || !previous || previous === selected) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setSwitching(true);
    if (switchTimer.current !== null) window.clearTimeout(switchTimer.current);
    switchTimer.current = window.setTimeout(() => {
      setSwitching(false);
      switchTimer.current = null;
    }, 340);
  }, [panelOpen, selected]);

  useEffect(
    () => () => {
      if (switchTimer.current !== null) window.clearTimeout(switchTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePanel, panelOpen]);

  if (!element) return null;

  return (
    <aside
      ref={panelRef}
      className={`element-panel${panelOpen ? ' is-open' : ''}${switching ? ' is-switching' : ''}`}
      aria-label={`Detail unsur ${element.name}`}
      aria-hidden={!panelOpen || switching}
      inert={!panelOpen || switching ? true : undefined}
    >
      <div className="element-panel__handle" aria-hidden="true" />

      <header className="element-panel__head">
        <div className="element-panel__identity">
          <span
            className="element-panel__symbol"
            style={{
              ['--accent-color' as string]: categoryColors[element.category],
              ['--accent-ink' as string]: categoryInkColors[element.category],
            }}
          >
            {element.symbol}
          </span>
          <div>
            <h2>{element.name}</h2>
            <p className="element-panel__meta">
              Z = {element.z} · {fmt(element.mass, ' u', 3)}
            </p>
            <CategoryBadge category={element.category} />
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={closePanel} aria-label="Tutup panel">
          ✕
        </button>
      </header>

      <div className="tabs" role="tablist" aria-label="Bagian detail unsur">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="element-panel__body" role="tabpanel">
        {tab === 'ringkasan' && <SummaryTab element={element} />}
        {tab === 'sifat' && <PropertiesTab element={element} />}
        {tab === 'kulit' && <ShellsTab element={element} />}
        {tab === 'tren' && <TrendsTab element={element} />}
        {tab === 'bahaya' && <HazardsTab element={element} />}
      </div>
    </aside>
  );
}
