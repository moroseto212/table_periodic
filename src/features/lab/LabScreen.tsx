import { useEffect, useMemo, useState } from 'react';
import { elements, reactionIndex, speciesById } from '../../core/data';
import { react } from '../../core/chemistry/engine';
import type {
  AtomCount,
  BondType,
  Condition,
  ElementCategory,
  ReactionOutcome,
} from '../../core/chemistry/types';
import { MAX_ATOMS_PER_ELEMENT, MAX_ATOMS_TOTAL } from '../../core/chemistry/types';
import { categoryColors, categoryInkColors, categoryLabels } from '../../ui/tokens';
import Formula, { formatCoeff } from '../../ui/Formula';
import { buildPresets, type LabPreset } from './presets';

import { withBase } from '../../app/router';

const LAST_KEY = 'periodic-lab.last-experiment';

const CONDITION_LABELS: Record<Condition, string> = {
  heat: 'Panaskan',
  catalyst: 'Katalis',
  pressure: 'Tekanan tinggi',
  aqueous: 'Larutan air',
};

const BOND_LABELS: Record<BondType, string> = {
  kovalen: 'Kovalen',
  'kovalen-polar': 'Kovalen polar',
  ion: 'Ionik',
  logam: 'Logam',
};

type TrayGroup = 'all' | 'logam' | 'nonlogam' | 'metaloid' | 'noble';

const TRAY_GROUPS: { id: TrayGroup; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'logam', label: 'Logam' },
  { id: 'nonlogam', label: 'Nonlogam' },
  { id: 'metaloid', label: 'Metaloid' },
  { id: 'noble', label: 'Gas mulia' },
];

const METAL_CATEGORIES: ElementCategory[] = [
  'alkali',
  'alkaline',
  'transition',
  'post-transition',
  'lanthanide',
  'actinide',
];

function matchesGroup(category: ElementCategory, group: TrayGroup): boolean {
  if (group === 'all') return true;
  if (group === 'noble') return category === 'noble';
  if (group === 'metaloid') return category === 'metalloid';
  if (group === 'nonlogam') return category === 'nonmetal' || category === 'halogen';
  return METAL_CATEGORIES.includes(category);
}

/** Ringkasan isi chamber, mis. "2 H + 1 O". */
function chamberFormula(chamber: AtomCount): string {
  return Object.entries(chamber)
    .map(([symbol, count]) => `${count} ${symbol}`)
    .join(' + ');
}

function conditionsLabel(conditions: Condition[]): string {
  return conditions.map((condition) => CONDITION_LABELS[condition].toLowerCase()).join(' dan ');
}

// Resep dibangun sekali dari data reaksi yang sudah ada.
const PRESETS = buildPresets(reactionIndex, speciesById);

function totalAtoms(chamber: AtomCount): number {
  return Object.values(chamber).reduce((a, b) => a + b, 0);
}

function parseChamber(raw: string | null): AtomCount {
  if (!raw) return {};
  const out: AtomCount = {};
  for (const part of raw.split(',')) {
    const [symbol, rawCount] = part.split(':');
    const element = elements.find((el) => el.symbol === symbol?.trim());
    if (!element) continue;
    const count = rawCount == null ? 1 : Number(rawCount);
    if (!Number.isFinite(count) || count < 1) continue;
    out[element.symbol] = Math.min(MAX_ATOMS_PER_ELEMENT, Math.floor(count));
  }
  return out;
}

function encodeChamber(chamber: AtomCount): string {
  return Object.entries(chamber)
    .filter(([, n]) => n > 0)
    .map(([symbol, n]) => `${symbol}:${n}`)
    .join(',');
}

function chamberToDots(chamber: AtomCount): { symbol: string; index: number }[] {
  const dots: { symbol: string; index: number }[] = [];
  for (const [symbol, count] of Object.entries(chamber)) {
    for (let i = 0; i < count; i += 1) dots.push({ symbol, index: dots.length });
  }
  return dots;
}

function Equation({ outcome }: { outcome: Extract<ReactionOutcome, { kind: 'reacted' }> }) {
  const { reaction, scale, products } = outcome;
  return (
    <p className="equation" aria-label="Persamaan reaksi">
      {reaction.reactants.map((side, index) => {
        const species = speciesById.get(side.species);
        return (
          <span key={side.species} className="equation__species">
            {index > 0 && <span className="equation__op">+</span>}
            <span className="equation__coeff">{formatCoeff(side.coeff * scale)}</span>
            <Formula formula={species?.formula ?? side.species} />
          </span>
        );
      })}
      <span className="equation__op">→</span>
      {products.map((product, index) => {
        const species = speciesById.get(product.species);
        return (
          <span key={product.species} className="equation__species">
            {index > 0 && <span className="equation__op">+</span>}
            <span className="equation__coeff">{formatCoeff(product.coeff)}</span>
            <Formula formula={species?.formula ?? product.species} />
          </span>
        );
      })}
    </p>
  );
}

function ResultCard({
  outcome,
  onRepeat,
  onShare,
  onEnableConditions,
  shareLabel,
}: {
  outcome: ReactionOutcome;
  onRepeat: () => void;
  onShare: () => void;
  onEnableConditions: (conditions: Condition[]) => void;
  shareLabel: string;
}) {
  if (outcome.kind === 'inert') {
    const needsConditions = outcome.reason === 'conditions' && outcome.missingConditions?.length;
    return (
      <div className="result result--inert">
        <span className="result__kicker">Hasil</span>
        <h2>Tidak bereaksi</h2>
        {needsConditions ? (
          <>
            <p>
              Campuran ini punya aturan reaksi, tetapi tidak berjalan pada kondisi standar. Butuh{' '}
              {outcome.missingConditions!.map((c) => CONDITION_LABELS[c].toLowerCase()).join(', ')}.
            </p>
            <div className="result__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onEnableConditions(outcome.missingConditions!)}
              >
                Aktifkan kondisi
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              Atom-atom ini tidak membentuk produk pada kondisi standar. Ini bukan kesalahan —
              coba rasio atom yang berbeda, atau pilih unsur lain dari baki.
            </p>
            <p className="result__aside">
              Mesin reaksi mencocokkan rasio atom, bukan molekul. Contoh: 2 atom H + 1 atom O
              membentuk H<sub>2</sub>O.
            </p>
            <div className="result__actions">
              <button type="button" className="btn" onClick={onRepeat}>
                Bersihkan chamber
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const { reaction } = outcome;
  const leftover = Object.entries(outcome.leftover);

  return (
    <div className="result result--ok">
      <span className="result__kicker">Reaksi berhasil</span>
      <h2>{reaction.products.map((p) => speciesById.get(p.species)?.name ?? p.species).join(' + ')}</h2>

      <Equation outcome={outcome} />

      <div className="result__facts">
        <div>
          <span>Jenis ikatan</span>
          <strong>{reaction.bondTypes.map((b) => BOND_LABELS[b]).join(', ')}</strong>
        </div>
        <div>
          <span>Energi</span>
          <strong>
            {reaction.deltaHkJmol == null
              ? '—'
              : reaction.deltaHkJmol < 0
                ? `Eksoterm ${Math.abs(reaction.deltaHkJmol)} kJ/mol`
                : `Endoterm ${reaction.deltaHkJmol} kJ/mol`}
          </strong>
        </div>
        <div>
          <span>Massa molar produk</span>
          <strong>
            {outcome.products
              .map((p) => {
                const sp = speciesById.get(p.species);
                return sp ? `${sp.formula} ${sp.molarMass} g/mol` : p.species;
              })
              .join(' · ')}
          </strong>
        </div>
      </div>

      <p className="result__observation">{reaction.observation.replace(/[.!?]+$/, '')}.</p>
      <p className="result__explanation">{reaction.explanation}</p>

      {leftover.length > 0 && (
        <p className="result__leftover">
          <strong>Sisa pereaksi:</strong>{' '}
          {leftover.map(([symbol, n]) => `${n} atom ${symbol}`).join(', ')} tidak bereaksi.
          Inilah konsep pereaksi pembatas.
        </p>
      )}

      {outcome.ambiguousWith.length > 0 && (
        <p className="result__aside">
          Rasio ini juga cocok untuk reaksi lain: {outcome.ambiguousWith.join(', ')}.
        </p>
      )}

      <div className="result__sources">
        <span>Sumber</span>
        <ul>
          {reaction.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="result__actions">
        <button type="button" className="btn" onClick={onRepeat}>
          Ulangi
        </button>
        <button type="button" className="btn btn--primary" onClick={onShare}>
          {shareLabel}
        </button>
      </div>
    </div>
  );
}

export default function LabScreen({ initial }: { initial: string | null }) {
  const [chamber, setChamber] = useState<AtomCount>(() => parseChamber(initial));
  const [history, setHistory] = useState<AtomCount[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [outcome, setOutcome] = useState<ReactionOutcome | null>(null);
  const [shareLabel, setShareLabel] = useState('Bagikan');
  const [bump, setBump] = useState(false);
  const [restorePrompt, setRestorePrompt] = useState<AtomCount | null>(null);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<TrayGroup>('all');
  const [announcement, setAnnouncement] = useState('');

  const total = totalAtoms(chamber);
  const dots = useMemo(() => chamberToDots(chamber), [chamber]);

  const filteredElements = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return elements.filter((element) => {
      if (!matchesGroup(element.category, group)) return false;
      if (!needle) return true;
      return (
        element.name.toLowerCase().includes(needle) ||
        element.symbol.toLowerCase().includes(needle) ||
        String(element.z) === needle
      );
    });
  }, [query, group]);

  useEffect(() => {
    if (initial) setChamber(parseChamber(initial));
  }, [initial]);

  useEffect(() => {
    if (initial) return;
    try {
      const raw = localStorage.getItem(LAST_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { chamber?: AtomCount };
      if (saved.chamber && totalAtoms(saved.chamber) > 0) setRestorePrompt(saved.chamber);
    } catch {
      // localStorage tidak tersedia: abaikan.
    }
  }, [initial]);

  const mutate = (next: AtomCount) => {
    setHistory((prev) => [...prev.slice(-19), chamber]);
    setChamber(next);
    setOutcome(null);
  };

  const addAtom = (symbol: string) => {
    const current = chamber[symbol] ?? 0;
    if (total >= MAX_ATOMS_TOTAL || current >= MAX_ATOMS_PER_ELEMENT) {
      setBump(true);
      window.setTimeout(() => setBump(false), 420);
      return;
    }
    mutate({ ...chamber, [symbol]: current + 1 });
  };

  const removeAtom = (symbol: string) => {
    const current = chamber[symbol] ?? 0;
    if (current <= 0) return;
    const next = { ...chamber };
    if (current === 1) delete next[symbol];
    else next[symbol] = current - 1;
    mutate(next);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setChamber(last);
    setOutcome(null);
  };

  const clear = () => {
    if (total === 0) return;
    mutate({});
  };

  const toggleCondition = (condition: Condition) => {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    );
    setOutcome(null);
  };

  const applyPreset = (preset: LabPreset) => {
    setHistory((prev) => [...prev.slice(-19), chamber]);
    setChamber({ ...preset.chamber });
    setConditions([...preset.conditions]);
    setOutcome(null);
    setAnnouncement(
      `Resep ${preset.label} dimuat: ${chamberFormula(preset.chamber)}${
        preset.conditions.length > 0 ? `, kondisi ${conditionsLabel(preset.conditions)}` : ''
      }.`,
    );
  };

  const resetTrayFilters = () => {
    setQuery('');
    setGroup('all');
  };

  const run = () => {
    if (total === 0) return;
    const result = react(chamber, reactionIndex, { conditions });
    setOutcome(result);
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ chamber, conditions }));
    } catch {
      // abaikan
    }
  };

  const share = () => {
    const encoded = encodeChamber(chamber);
    const target = withBase(`/lab?s=${encodeURIComponent(encoded)}`);
    const url = `${window.location.origin}${target}`;
    window.history.replaceState({}, '', target);
    navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setShareLabel('Tautan disalin');
        window.setTimeout(() => setShareLabel('Bagikan'), 1800);
      })
      .catch(() => {
        setShareLabel('Salin manual');
        window.setTimeout(() => setShareLabel('Bagikan'), 1800);
      });
  };

  return (
    <div className="lab">
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      <section className="lab__bench" aria-label="Meja kerja laboratorium">
        <header className="lab__head">
          <div>
            <h1>Laboratorium</h1>
            <p>
              Susun atom atau pilih resep cepat, lalu reaksikan. Chamber mencocokkan rasio atom,
              bukan molekul.
            </p>
          </div>
          <div className="lab__counter" aria-live="polite">
            <strong>{total}</strong>
            <span>/ {MAX_ATOMS_TOTAL} atom</span>
          </div>
        </header>

        {restorePrompt && (
          <div className="restore">
            <span>Lanjutkan eksperimen terakhir?</span>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => {
                setChamber(restorePrompt);
                setRestorePrompt(null);
              }}
            >
              Lanjutkan
            </button>
            <button type="button" className="icon-btn" onClick={() => setRestorePrompt(null)} aria-label="Tolak">
              ✕
            </button>
          </div>
        )}

        <div className={`chamber${bump ? ' is-bumping' : ''}`}>
          <div className="chamber__visual" aria-hidden="true">
            {dots.map((dot) => {
              const element = elements.find((el) => el.symbol === dot.symbol);
              const angle = dot.index * 137.508;
              const radius = 18 + (dot.index % 5) * 9;
              return (
                <span
                  key={`${dot.symbol}-${dot.index}`}
                  className="chamber__atom"
                  style={{
                    ['--atom-color' as string]: element
                      ? categoryColors[element.category]
                      : '#ffffff',
                    left: `${50 + Math.cos((angle * Math.PI) / 180) * radius}%`,
                    top: `${50 + Math.sin((angle * Math.PI) / 180) * radius}%`,
                    animationDelay: `${dot.index * 90}ms`,
                  }}
                >
                  {dot.symbol}
                </span>
              );
            })}
            {dots.length === 0 && (
              <p className="chamber__empty">
                Chamber kosong. Ketuk unsur di baki, atau pilih resep cepat di atas.
              </p>
            )}
          </div>

          <div className="chamber__chips">
            {Object.entries(chamber).map(([symbol, count]) => (
              <span className="atom-chip" key={symbol}>
                <span className="atom-chip__symbol">{symbol}</span>
                <span className="atom-chip__count">×{count}</span>
                <button
                  type="button"
                  className="atom-chip__remove"
                  onClick={() => removeAtom(symbol)}
                  aria-label={`Kurangi satu atom ${symbol}`}
                  title={`Kurangi satu atom ${symbol}`}
                >
                  −
                </button>
                <button
                  type="button"
                  className="atom-chip__add"
                  onClick={() => addAtom(symbol)}
                  disabled={total >= MAX_ATOMS_TOTAL || count >= MAX_ATOMS_PER_ELEMENT}
                  aria-label={`Tambah satu atom ${symbol}`}
                  title={`Tambah satu atom ${symbol}`}
                >
                  +
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="conditions" role="group" aria-label="Kondisi reaksi">
          <span className="conditions__label">Kondisi</span>
          {(Object.keys(CONDITION_LABELS) as Condition[]).map((condition) => (
            <button
              key={condition}
              type="button"
              className={`chip chip--condition${conditions.includes(condition) ? ' is-active' : ''}`}
              aria-pressed={conditions.includes(condition)}
              onClick={() => toggleCondition(condition)}
            >
              {CONDITION_LABELS[condition]}
            </button>
          ))}
        </div>

        <section className="lab__presets" aria-label="Resep cepat">
          <div className="lab__presets-head">
            <span className="lab__presets-label">Resep cepat</span>
            <span className="lab__presets-hint">Sekali ketuk, rasio langsung terisi</span>
          </div>
          <div className="lab__presets-row">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="preset"
                onClick={() => applyPreset(preset)}
                title={`${preset.productName} — ${chamberFormula(preset.chamber)}${
                  preset.conditions.length > 0
                    ? ` (butuh ${conditionsLabel(preset.conditions)})`
                    : ''
                }`}
                aria-label={`Resep ${preset.label}: ${chamberFormula(preset.chamber)}${
                  preset.conditions.length > 0
                    ? `, kondisi ${conditionsLabel(preset.conditions)}`
                    : ''
                }`}
              >
                <span className="preset__formula">
                  <Formula formula={preset.formula} />
                </span>
                <span className="preset__label">{preset.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="lab__actions">
          <button
            type="button"
            className="btn btn--primary btn--wide"
            onClick={run}
            disabled={total === 0}
            title={total === 0 ? 'Tambahkan atom dulu' : 'Jalankan reaksi'}
          >
            Reaksikan
          </button>
          <button type="button" className="btn" onClick={undo} disabled={history.length === 0}>
            Undo
          </button>
          <button type="button" className="btn" onClick={clear} disabled={total === 0}>
            Bersihkan
          </button>
        </div>

        <div className="tray__tools">
          <input
            type="search"
            className="tray__search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari unsur (mis. Fe, besi, 26)"
            aria-label="Cari unsur berdasarkan nama, simbol, atau nomor atom"
            autoComplete="off"
            enterKeyHint="search"
          />
          <div className="tray__filters" role="group" aria-label="Filter kategori unsur">
            {TRAY_GROUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip chip--filter${group === item.id ? ' is-active' : ''}`}
                aria-pressed={group === item.id}
                onClick={() => setGroup(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {filteredElements.length} unsur ditemukan
        </p>
        <div className="tray" aria-label="Baki unsur">
          <div className="tray__scroll">
            {filteredElements.map((element) => {
              const count = chamber[element.symbol] ?? 0;
              return (
                <button
                  key={element.symbol}
                  type="button"
                  className={`tray__chip${count > 0 ? ' has-count' : ''}`}
                  style={{
                    ['--tray-color' as string]: categoryColors[element.category],
                    ['--tray-ink' as string]: categoryInkColors[element.category],
                  }}
                  onClick={() => addAtom(element.symbol)}
                  aria-label={`${element.symbol}${element.z}${count > 0 ? count : ''} — tambah atom ${element.name}`}
                  title={`${element.name} — ${categoryLabels[element.category]}`}
                >
                  <span className="tray__symbol">{element.symbol}</span>
                  <span className="tray__z">{element.z}</span>
                  {count > 0 && <span className="tray__count">{count}</span>}
                </button>
              );
            })}
            {filteredElements.length === 0 && (
              <p className="tray__empty">
                Tidak ada unsur yang cocok dengan pencarian.
                <button type="button" className="btn btn--small" onClick={resetTrayFilters}>
                  Reset filter
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="lab__result" aria-label="Hasil reaksi" aria-live="polite">
        {outcome ? (
          <ResultCard
            outcome={outcome}
            onRepeat={() => {
              setHistory((prev) => [...prev.slice(-19), chamber]);
              setChamber({});
              setOutcome(null);
            }}
            onShare={share}
            onEnableConditions={(missing) => {
              setConditions((prev) => [...new Set([...prev, ...missing])]);
              setOutcome(null);
            }}
            shareLabel={shareLabel}
          />
        ) : (
          <div className="result result--idle">
            <span className="result__kicker">Siap</span>
            <h2>Belum ada reaksi</h2>
            <p>
              Tambahkan atom dari baki, pilih resep cepat, atur kondisi bila perlu, lalu tekan{' '}
              <strong>Reaksikan</strong>. Kamu bisa mengulang dan membagikan eksperimen lewat
              tautan.
            </p>
            <ul className="result__tips">
              {PRESETS.slice(0, 3).map((preset) => (
                <li key={preset.id}>
                  {chamberFormula(preset.chamber)} → {preset.label.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
