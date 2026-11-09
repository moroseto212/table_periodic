import type {
  AtomCount,
  Condition,
  IndexedReaction,
  Reaction,
  ReactionIndex,
  ReactionOutcome,
  Species,
} from './types';
import { MAX_ATOMS_PER_ELEMENT, MAX_ATOMS_TOTAL } from './types';

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/** Bagi multiset atom dengan GCD sehingga menjadi rasio terkecil. */
export function normalizeRatio(atoms: AtomCount): { ratio: AtomCount; scale: number } {
  const entries = Object.entries(atoms).filter(([, n]) => Number.isFinite(n) && n > 0);
  if (entries.length === 0) return { ratio: {}, scale: 0 };
  const divisor = entries.map(([, n]) => n).reduce((a, b) => gcd(a, b));
  const ratio: AtomCount = {};
  for (const [el, n] of entries) ratio[el] = n / divisor;
  return { ratio, scale: divisor };
}

/** Kunci stabil dan deterministik, mis. "C1|O2" */
export function signature(atoms: AtomCount): string {
  return Object.keys(atoms)
    .sort()
    .map((el) => `${el}${atoms[el]}`)
    .join('|');
}

function atomsOfReactionSide(
  side: Reaction['reactants'],
  speciesById: Map<string, Species>,
): AtomCount {
  const atoms: AtomCount = {};
  for (const { species: id, coeff } of side) {
    const sp = speciesById.get(id);
    if (!sp) throw new Error(`Species tidak dikenal: ${id}`);
    for (const [el, n] of Object.entries(sp.composition)) {
      atoms[el] = (atoms[el] ?? 0) + n * coeff;
    }
  }
  return atoms;
}

/** Bangun indeks pencarian berbasis rasio atom. */
export function buildIndex(reactions: Reaction[], species: Species[]): ReactionIndex {
  const speciesById = new Map(species.map((s) => [s.id, s]));
  const bySignature = new Map<string, IndexedReaction[]>();
  const all: IndexedReaction[] = [];

  for (const reaction of reactions) {
    const atoms = atomsOfReactionSide(reaction.reactants, speciesById);
    const { ratio } = normalizeRatio(atoms);
    const entry: IndexedReaction = {
      reaction,
      ratio,
      signature: signature(ratio),
      priority: reaction.priority,
      gcd: Object.values(atoms).reduce((a, b) => gcd(a, b)),
    };
    const bucket = bySignature.get(entry.signature);
    if (bucket) bucket.push(entry);
    else bySignature.set(entry.signature, [entry]);
    all.push(entry);
  }

  for (const bucket of bySignature.values()) {
    bucket.sort((a, b) => b.priority - a.priority || a.reaction.id.localeCompare(b.reaction.id));
  }

  return { bySignature, all };
}

export interface ReactOptions {
  /** Kondisi yang tersedia di chamber. Default: kondisi standar (kosong). */
  conditions?: Condition[];
}

function subtract(atoms: AtomCount, minus: AtomCount, times: number): AtomCount {
  const out: AtomCount = {};
  for (const [el, n] of Object.entries(atoms)) {
    const rest = n - (minus[el] ?? 0) * times;
    if (rest > 0) out[el] = rest;
  }
  return out;
}

function reacted(
  entry: IndexedReaction,
  /** Banyak satuan rasio ternormalisasi yang bereaksi (k). */
  ratioUnits: number,
  leftover: AtomCount,
  ambiguousWith: string[],
): ReactionOutcome {
  // Satu satuan persamaan = `gcd` satuan rasio. Jadi satuan persamaan = k / gcd.
  const scale = ratioUnits / entry.gcd;
  return {
    kind: 'reacted',
    reaction: entry.reaction,
    scale,
    products: entry.reaction.products.map((p) => ({
      species: p.species,
      // Koefisien boleh pecahan (mis. ½O2) dan ditampilkan apa adanya.
      coeff: Number((p.coeff * scale).toFixed(6)),
    })),
    leftover,
    ambiguousWith,
  };
}

/**
 * Mesin reaksi inti. Murni, deterministik, total (tidak pernah melempar untuk input valid).
 *
 * Chamber berisi ATOM; dataset berisi MOLEKUL. Pencocokan dilakukan pada rasio atom
 * ternormalisasi, sehingga { H: 4, O: 2 } cocok dengan 2H2 + O2 -> 2H2O.
 */
export function react(
  chamber: AtomCount,
  index: ReactionIndex,
  options: ReactOptions = {},
): ReactionOutcome {
  const atoms: AtomCount = {};
  for (const [el, n] of Object.entries(chamber)) {
    if (Number.isFinite(n) && n > 0) atoms[el] = Math.floor(n);
  }

  const values = Object.values(atoms);
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0 || total > MAX_ATOMS_TOTAL) {
    return { kind: 'inert', reason: 'no-rule' };
  }
  if (values.some((n) => n > MAX_ATOMS_PER_ELEMENT)) {
    return { kind: 'inert', reason: 'no-rule' };
  }

  const { ratio, scale: ratioUnits } = normalizeRatio(atoms);
  const candidates = index.bySignature.get(signature(ratio)) ?? [];
  const available = options.conditions ?? [];

  if (candidates.length > 0) {
    const usable = candidates.filter((c) =>
      c.reaction.conditions.every((cond) => available.includes(cond)),
    );

    if (usable.length > 0) {
      const winner = usable[0];
      const others = usable.slice(1).map((c) => c.reaction.id);
      return reacted(winner, ratioUnits, {}, others);
    }

    const missing = new Set<Condition>();
    for (const c of candidates) for (const cond of c.reaction.conditions) missing.add(cond);
    return {
      kind: 'inert',
      reason: 'conditions',
      missingConditions: [...missing],
    };
  }

  // Pereaksi pembatas: konsumsi sebagian, sisakan kelebihan.
  // Hanya diizinkan jika sisa hanya berisi unsur yang memang ada di rasio reaksi,
  // agar mesin tidak mengklaim reaksi yang secara kimia tidak masuk akal.
  let best: { entry: IndexedReaction; units: number; leftover: AtomCount } | null = null;
  const blocked: { entry: IndexedReaction; units: number; missing: Condition[] }[] = [];

  for (const entry of index.all) {
    const keys = Object.keys(entry.ratio);
    if (!keys.every((el) => (atoms[el] ?? 0) > 0)) continue;

    let limit = Number.POSITIVE_INFINITY;
    for (const el of keys) {
      limit = Math.min(limit, Math.floor((atoms[el] ?? 0) / entry.ratio[el]));
    }
    if (!Number.isFinite(limit) || limit < 1) continue;

    const leftover = subtract(atoms, entry.ratio, limit);
    const leftoverKeys = Object.keys(leftover);
    if (leftoverKeys.length === 0) continue;
    if (leftoverKeys.some((el) => !keys.includes(el))) continue;

    // Rasio ini secara stoikiometri cocok, tetapi kondisi belum dipenuhi.
    // Laporkan kondisi yang kurang, jangan diam-diam menjadi "tidak bereaksi".
    const missing = entry.reaction.conditions.filter((cond) => !available.includes(cond));
    if (missing.length > 0) {
      blocked.push({ entry, units: limit, missing });
      continue;
    }

    const better =
      !best || limit > best.units || (limit === best.units && entry.priority > best.entry.priority);
    if (better) best = { entry, units: limit, leftover };
  }

  if (best) {
    return reacted(best.entry, best.units, best.leftover, []);
  }

  if (blocked.length > 0) {
    blocked.sort(
      (a, b) => b.units - a.units || b.entry.priority - a.entry.priority,
    );
    return { kind: 'inert', reason: 'conditions', missingConditions: blocked[0].missing };
  }

  return { kind: 'inert', reason: 'no-rule' };
}
