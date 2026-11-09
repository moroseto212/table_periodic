import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { buildIndex, normalizeRatio, react } from './engine';
import type { AtomCount, Condition, Reaction, Species } from './types';
import { MAX_ATOMS_PER_ELEMENT, MAX_ATOMS_TOTAL } from './types';
import { elements, reactionIndex, reactions, species } from '../data';

const speciesById = new Map(species.map((s) => [s.id, s]));

function chamberFor(reactionId: string, scale = 1): AtomCount {
  const reaction = reactions.find((r) => r.id === reactionId);
  if (!reaction) throw new Error(`Reaksi tidak ada: ${reactionId}`);
  const atoms: AtomCount = {};
  for (const { species: id, coeff } of reaction.reactants) {
    const sp = speciesById.get(id);
    if (!sp) throw new Error(`Species tidak ada: ${id}`);
    for (const [el, n] of Object.entries(sp.composition)) {
      atoms[el] = (atoms[el] ?? 0) + n * coeff * scale;
    }
  }
  return atoms;
}

function atomTally(side: Reaction['reactants']): AtomCount {
  const tally: AtomCount = {};
  for (const { species: id, coeff } of side) {
    const sp = speciesById.get(id);
    if (!sp) throw new Error(`Species tidak ada: ${id}`);
    for (const [el, n] of Object.entries(sp.composition)) {
      tally[el] = (tally[el] ?? 0) + n * coeff;
    }
  }
  return tally;
}

/* ------------------------- dataset sintetis untuk cabang ------------------------- */

function syntheticSpeciesOf(element: 'X' | 'Y', count: 1 | 2): Species {
  return {
    id: `${element.toLowerCase()}${count}`,
    formula: count === 1 ? element : `${element}${count}`,
    name: `Sintetis ${element}${count}`,
    composition: { [element]: count },
    charge: 0,
    stateSTP: 'gas',
    hazards: [],
    sources: ['uji'],
    molarMass: 1,
  };
}

const syntheticSpecies: Species[] = [
  syntheticSpeciesOf('X', 1),
  syntheticSpeciesOf('Y', 1),
  syntheticSpeciesOf('X', 2),
  syntheticSpeciesOf('Y', 2),
];

function syntheticReaction(
  id: string,
  reactants: { species: string; coeff: number }[],
  options: { priority?: number; conditions?: Condition[] } = {},
): Reaction {
  return {
    id,
    reactants,
    products: [{ species: 'x1', coeff: 1 }],
    conditions: options.conditions ?? [],
    bondTypes: ['kovalen'],
    deltaHkJmol: null,
    observation: 'sintetis',
    explanation: 'sintetis',
    hazards: [],
    curriculum: ['merdeka-e'],
    sources: ['uji'],
    priority: options.priority ?? 0,
  };
}

describe('dataset kimia', () => {
  it('setiap reaksi setara (atom kiri = atom kanan)', () => {
    for (const rx of reactions) {
      const left = atomTally(rx.reactants);
      const right = atomTally(rx.products);
      expect(left, rx.id).toEqual(right);
    }
  });

  it('setiap unsur punya jumlah elektron sesuai nomor atom', () => {
    for (const el of elements) {
      expect(el.shells.reduce((a, b) => a + b, 0), el.symbol).toBe(el.z);
      expect(el.sources.length, el.symbol).toBeGreaterThan(0);
    }
  });

  it('setiap reaksi punya sitasi dan penjelasan', () => {
    for (const rx of reactions) {
      expect(rx.sources.length, rx.id).toBeGreaterThan(0);
      expect(rx.explanation.length, rx.id).toBeGreaterThan(0);
    }
  });

  it('massa molar dihitung konsisten dari komposisi', () => {
    const massBySymbol = new Map(elements.map((e) => [e.symbol, e.mass]));
    for (const sp of species) {
      const expected = Object.entries(sp.composition).reduce(
        (sum, [el, n]) => sum + (massBySymbol.get(el) ?? 0) * n,
        0,
      );
      expect(Math.abs(sp.molarMass - expected), sp.id).toBeLessThan(0.01);
    }
  });
});

describe('react() - pencocokan rasio atom', () => {
  it('4 H + 2 O menghasilkan 2 H2O', () => {
    const outcome = react(chamberFor('h2-o2-water', 1), reactionIndex);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind !== 'reacted') return;
    expect(outcome.reaction.id).toBe('h2-o2-water');
    expect(outcome.scale).toBe(1);
    expect(outcome.products).toEqual([{ species: 'H2O', coeff: 2 }]);
    expect(outcome.leftover).toEqual({});
  });

  it('memberi hasil yang proporsional saat jumlah atom digandakan', () => {
    const outcome = react(chamberFor('h2-o2-water', 2), reactionIndex);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind !== 'reacted') return;
    expect(outcome.scale).toBe(2);
    expect(outcome.products).toEqual([{ species: 'H2O', coeff: 4 }]);
  });

  it('rasio karbon-oksigen menentukan produk: CO2 vs CO', () => {
    const dioxide = react({ C: 1, O: 2 }, reactionIndex);
    expect(dioxide.kind).toBe('reacted');
    if (dioxide.kind === 'reacted') expect(dioxide.reaction.id).toBe('c-o2-dioxide');

    const monoxide = react({ C: 2, O: 2 }, reactionIndex);
    expect(monoxide.kind).toBe('reacted');
    if (monoxide.kind === 'reacted') {
      expect(monoxide.reaction.id).toBe('c-o2-monoxide');
      expect(monoxide.products).toEqual([{ species: 'CO', coeff: 2 }]);
    }
  });

  it('Na + Cl membentuk garam ionik', () => {
    const outcome = react({ Na: 2, Cl: 2 }, reactionIndex);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind === 'reacted') {
      expect(outcome.reaction.id).toBe('na-cl2-salt');
      expect(outcome.reaction.bondTypes).toContain('ion');
    }
  });

  it('reaksi yang butuh kondisi mengembalikan inert dengan alasan kondisi', () => {
    const outcome = react({ N: 2, H: 6 }, reactionIndex);
    expect(outcome).toEqual({
      kind: 'inert',
      reason: 'conditions',
      missingConditions: expect.arrayContaining(['heat', 'catalyst', 'pressure']),
    });
  });

  it('reaksi yang butuh kondisi berjalan bila kondisi tersedia', () => {
    const outcome = react({ N: 2, H: 6 }, reactionIndex, {
      conditions: ['heat', 'catalyst', 'pressure'],
    });
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind === 'reacted') expect(outcome.reaction.id).toBe('n2-h2-ammonia');
  });

  it('melaporkan kondisi yang kurang juga pada rasio pereaksi pembatas', () => {
    // N2 + 3H2 tepat; 1 N + 4 H menyisakan H, tetapi tetap butuh kondisi Haber.
    const outcome = react({ N: 1, H: 4 }, reactionIndex);
    expect(outcome.kind).toBe('inert');
    if (outcome.kind !== 'inert') return;
    expect(outcome.reason).toBe('conditions');
    expect(outcome.missingConditions).toEqual(
      expect.arrayContaining(['heat', 'catalyst', 'pressure']),
    );
  });

  it('menangani pereaksi pembatas: sisa atom dilaporkan', () => {
    const outcome = react({ H: 3, O: 1 }, reactionIndex);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind === 'reacted') {
      expect(outcome.scale).toBe(0.5);
      expect(outcome.products).toEqual([{ species: 'H2O', coeff: 1 }]);
      expect(outcome.leftover).toEqual({ H: 1 });
    }
  });

  it('menampilkan koefisien pecahan apa adanya tanpa membulatkan', () => {
    // 2 H + 1 O adalah tepat satu molekul H2O; persamaan memakai 1 H2 + ½ O2.
    const outcome = react({ H: 2, O: 1 }, reactionIndex);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind !== 'reacted') return;
    expect(outcome.scale).toBe(0.5);
    expect(outcome.products).toEqual([{ species: 'H2O', coeff: 1 }]);
    expect(outcome.leftover).toEqual({});

    const o2 = outcome.reaction.reactants.find(
      (side) => speciesById.get(side.species)?.formula === 'O2',
    );
    expect(o2).toBeDefined();
    expect((o2?.coeff ?? 0) * outcome.scale).toBe(0.5);
  });

  it('memperlakukan kelebihan oksigen sebagai pereaksi pembatas, bukan error', () => {
    // Rasio H2O3 tidak sama dengan H2O2, jadi air tetap menjadi satu-satunya aturan yang cocok.
    const outcome = react({ H: 2, O: 3 }, reactionIndex);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind !== 'reacted') return;
    expect(outcome.reaction.id).toBe('h2-o2-water');
    expect(outcome.products).toEqual([{ species: 'H2O', coeff: 1 }]);
    expect(outcome.leftover).toEqual({ O: 2 });
  });

  it('tidak mengklaim reaksi untuk campuran yang tidak masuk akal', () => {
    expect(react({ C: 1, H: 3, O: 1 }, reactionIndex)).toEqual({
      kind: 'inert',
      reason: 'no-rule',
    });
    expect(react({}, reactionIndex)).toEqual({ kind: 'inert', reason: 'no-rule' });
  });

  it('mendeteksi duplikasi rasio sebagai ambiguity', () => {
    const duplicate = buildIndex([...reactions, { ...reactions[0], id: 'dup', priority: -1 }], species);
    const outcome = react({ H: 2, O: 1 }, duplicate);
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind === 'reacted') {
      expect(outcome.reaction.id).toBe('h2-o2-water');
      expect(outcome.ambiguousWith).toContain('dup');
    }
  });
});

describe('react() - cabang tepi dan tie-break', () => {
  it('normalizeRatio menangani input kosong dan jumlah tidak valid', () => {
    expect(normalizeRatio({})).toEqual({ ratio: {}, scale: 0 });
    expect(normalizeRatio({ H: 0, O: -2, C: 4 })).toEqual({ ratio: { C: 1 }, scale: 4 });
  });

  it('buildIndex melempar saat species tidak dikenal', () => {
    const broken = syntheticReaction('rusak', [{ species: 'tidak-ada', coeff: 1 }]);
    expect(() => buildIndex([broken], syntheticSpecies)).toThrow(/Species tidak dikenal/);
  });

  it('mengurutkan reaksi berprioritas sama berdasarkan id', () => {
    const base = syntheticReaction('zzz-seri', [{ species: 'x1', coeff: 1 }], { priority: 5 });
    const other = { ...base, id: 'aaa-seri' };
    const index = buildIndex([base, other], syntheticSpecies);
    const bucket = index.bySignature.get(index.all[0].signature) ?? [];
    expect(bucket.map((entry) => entry.reaction.id)).toEqual(['aaa-seri', 'zzz-seri']);
  });

  it('mengabaikan jumlah atom non-finitif dan non-positif', () => {
    expect(react({ H: Number.NaN, O: -3 }, reactionIndex)).toEqual({
      kind: 'inert',
      reason: 'no-rule',
    });
  });

  it('memilih prioritas lebih tinggi saat pereaksi pembatas menghasilkan unit sama', () => {
    const low = syntheticReaction('x1-y2-rendah', [
      { species: 'x1', coeff: 1 },
      { species: 'y1', coeff: 2 },
    ], { priority: 1 });
    const high = syntheticReaction('x2-y1-tinggi', [
      { species: 'x1', coeff: 2 },
      { species: 'y1', coeff: 1 },
    ], { priority: 9 });

    const chamber = { X: 3, Y: 2 };
    const outcome = react(chamber, buildIndex([low, high], syntheticSpecies));
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind === 'reacted') expect(outcome.reaction.id).toBe('x2-y1-tinggi');

    // Urutan dibalik: kandidat pertama berprioritas tinggi harus tetap menang.
    const reversed = react(chamber, buildIndex([high, low], syntheticSpecies));
    expect(reversed.kind).toBe('reacted');
    if (reversed.kind === 'reacted') expect(reversed.reaction.id).toBe('x2-y1-tinggi');
  });

  it('memilih unit pembatas terbesar meski prioritas lebih rendah', () => {
    const small = syntheticReaction('x1-y2-kecil', [
      { species: 'x1', coeff: 1 },
      { species: 'y1', coeff: 2 },
    ], { priority: 9 });
    const large = syntheticReaction('x1-y1-besar', [
      { species: 'x1', coeff: 1 },
      { species: 'y1', coeff: 1 },
    ], { priority: 1 });

    const outcome = react({ X: 3, Y: 2 }, buildIndex([small, large], syntheticSpecies));
    expect(outcome.kind).toBe('reacted');
    if (outcome.kind !== 'reacted') return;
    expect(outcome.reaction.id).toBe('x1-y1-besar');
    expect(outcome.scale).toBe(2);
  });

  it('melaporkan kondisi dari kandidat pembatas berprioritas tertinggi', () => {
    const heat = syntheticReaction('x1-y2-panas', [
      { species: 'x1', coeff: 1 },
      { species: 'y1', coeff: 2 },
    ], { conditions: ['heat'], priority: 1 });
    const catalyst = syntheticReaction('x2-y1-katalis', [
      { species: 'x1', coeff: 2 },
      { species: 'y1', coeff: 1 },
    ], { conditions: ['catalyst'], priority: 9 });

    const outcome = react({ X: 3, Y: 2 }, buildIndex([heat, catalyst], syntheticSpecies));
    expect(outcome).toEqual({
      kind: 'inert',
      reason: 'conditions',
      missingConditions: ['catalyst'],
    });
  });

  it('mengurutkan kandidat pembatas berdasarkan unit terbesar', () => {
    const small = syntheticReaction('x1-y2-kecil', [
      { species: 'x1', coeff: 1 },
      { species: 'y1', coeff: 2 },
    ], { conditions: ['heat'], priority: 9 });
    const large = syntheticReaction('x2-y1-besar', [
      { species: 'x1', coeff: 2 },
      { species: 'y1', coeff: 1 },
    ], { conditions: ['pressure'], priority: 1 });

    const outcome = react({ X: 6, Y: 2 }, buildIndex([small, large], syntheticSpecies));
    expect(outcome).toEqual({
      kind: 'inert',
      reason: 'conditions',
      missingConditions: ['pressure'],
    });
  });
});

describe('react() - sifat fungsional', () => {
  it('setiap reaksi cocok dengan chamber yang dibangun dari dirinya sendiri', () => {
    for (const rx of reactions) {
      for (const scale of [1, 2, 3]) {
        const chamber = chamberFor(rx.id, scale);
        const values = Object.values(chamber);
        const total = values.reduce((a, b) => a + b, 0);
        if (values.some((n) => n > MAX_ATOMS_PER_ELEMENT) || total > MAX_ATOMS_TOTAL) continue;

        const outcome = react(chamber, reactionIndex, {
          conditions: rx.conditions,
        });
        expect(outcome.kind, `${rx.id} x${scale}`).toBe('reacted');
        if (outcome.kind !== 'reacted') continue;
        expect(outcome.reaction.id, `${rx.id} x${scale}`).toBe(rx.id);
        expect(outcome.scale, `${rx.id} x${scale}`).toBe(scale);
        expect(outcome.leftover, `${rx.id} x${scale}`).toEqual({});
      }
    }
  });

  it('tidak pernah melempar dan selalu mengembalikan bentuk yang valid', () => {
    const symbols = elements.map((e) => e.symbol);
    const arbChamber = fc
      .array(fc.tuple(fc.constantFrom(...symbols), fc.integer({ min: 1, max: 12 })), {
        maxLength: 4,
      })
      .map((pairs) =>
        pairs.reduce<AtomCount>((acc, [el, n]) => {
          acc[el] = (acc[el] ?? 0) + n;
          return acc;
        }, {}),
      );

    fc.assert(
      fc.property(arbChamber, (chamber) => {
        const outcome = react(chamber, reactionIndex);
        if (outcome.kind === 'reacted') {
          expect(outcome.scale).toBeGreaterThan(0);
          expect(outcome.products.length).toBeGreaterThan(0);
        } else {
          expect(['no-rule', 'conditions']).toContain(outcome.reason);
        }
      }),
      { numRuns: 500 },
    );
  });

  it('deterministik: input sama menghasilkan output sama', () => {
    const chamber = { Fe: 4, O: 6 };
    const a = react(chamber, reactionIndex);
    const b = react(chamber, reactionIndex);
    expect(a).toEqual(b);
  });
});
