import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'content');
const outDir = resolve(root, 'src/core/data');

const errors = [];
const warn = (msg) => errors.push(msg);

function readCsv(file) {
  const raw = readFileSync(resolve(contentDir, file), 'utf8');
  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  });
  if (parsed.errors.length) {
    for (const e of parsed.errors) warn(`${file}: ${e.message} (row ${e.row})`);
  }
  return parsed.data.filter((row) => Object.values(row).some((v) => v !== ''));
}

const pipe = (v) => (v ? String(v).split('|').map((s) => s.trim()).filter(Boolean) : []);
const num = (v) => (v === '' || v == null ? null : Number(v));
const int = (v) => (v === '' || v == null ? null : Number.parseInt(v, 10));
const bool = (v) => String(v).toLowerCase() === 'true';

function fail(msg) {
  warn(msg);
}

// ---------- elements ----------
const elements = readCsv('elements.csv').map((r) => ({
  z: int(r.z),
  symbol: r.symbol,
  name: r.name,
  category: r.category,
  group: int(r.group),
  period: int(r.period),
  block: r.block,
  mass: num(r.mass),
  electronConfig: r.electronConfig,
  shells: pipe(r.shells).map(Number),
  stateSTP: r.stateSTP,
  meltingK: num(r.meltingK),
  boilingK: num(r.boilingK),
  densityGcm3: num(r.density),
  electronegativity: num(r.electronegativity),
  atomicRadiusPm: num(r.radiusPm),
  ionizationKJmol: num(r.ionization),
  oxidationStates: pipe(r.oxidationStates).map(Number),
  isotopes: pipe(r.isotopes).map((s) => {
    const [massNumber, abundancePct, stable] = s.split(':');
    return {
      massNumber: Number(massNumber),
      abundancePct: abundancePct === '' ? undefined : Number(abundancePct),
      stable: bool(stable),
    };
  }),
  discoveredYear: int(r.discoveredYear),
  summary: r.summary,
  hazards: pipe(r.hazards),
  sources: pipe(r.sources),
}));

// ---------- species ----------
const species = readCsv('species.csv').map((r) => ({
  id: r.id,
  formula: r.formula,
  name: r.name,
  composition: Object.fromEntries(pipe(r.composition).map((p) => {
    const [el, n] = p.split(':');
    return [el, Number(n)];
  })),
  charge: int(r.charge) ?? 0,
  stateSTP: r.stateSTP,
  hazards: pipe(r.hazards),
  sources: pipe(r.sources),
}));

// ---------- reactions ----------
const multiset = (values) => values.reduce((acc, v) => acc.set(v, (acc.get(v) ?? 0) + 1), new Map());

const reactions = readCsv('reactions.csv').map((r) => ({
  id: r.id,
  reactants: pipe(r.reactants).map((p) => {
    const [id, coeff] = p.split(':');
    return { species: id, coeff: Number(coeff) };
  }),
  products: pipe(r.products).map((p) => {
    const [id, coeff] = p.split(':');
    return { species: id, coeff: Number(coeff) };
  }),
  conditions: pipe(r.conditions),
  bondTypes: pipe(r.bondTypes),
  deltaHkJmol: num(r.deltaH),
  observation: r.observation,
  explanation: r.explanation,
  hazards: pipe(r.hazards),
  curriculum: pipe(r.curriculum),
  sources: pipe(r.sources),
  priority: int(r.priority) ?? 0,
}));

// ---------- validation ----------
const byId = new Map(species.map((s) => [s.id, s]));
const elementBySymbol = new Map(elements.map((e) => [e.symbol, e]));

if (elementBySymbol.size !== elements.length) fail('elements.csv: simbol duplikat');
for (const el of elements) {
  if (!Number.isInteger(el.z)) fail(`element ${el.symbol}: z tidak valid`);
  if (el.period !== el.period) fail(`element ${el.symbol}: period hilang`);
  const shellSum = el.shells.reduce((a, b) => a + b, 0);
  if (shellSum !== el.z) fail(`element ${el.symbol}: shells berjumlah ${shellSum}, seharusnya ${el.z}`);
  if (!el.sources.length) fail(`element ${el.symbol}: tanpa sitasi`);
}

for (const sp of species) {
  for (const el of Object.keys(sp.composition)) {
    if (!elementBySymbol.has(el)) fail(`species ${sp.id}: unsur ${el} tidak ada di elements.csv`);
    if (!Number.isInteger(sp.composition[el]) || sp.composition[el] <= 0) {
      fail(`species ${sp.id}: koefisien ${el} tidak valid`);
    }
  }
  if (!sp.sources.length) fail(`species ${sp.id}: tanpa sitasi`);
}

const atomTally = (side) => {
  const tally = new Map();
  for (const { species: id, coeff } of side) {
    const sp = byId.get(id);
    if (!sp) {
      fail(`reaction: species "${id}" tidak ada di species.csv`);
      continue;
    }
    for (const [el, n] of Object.entries(sp.composition)) {
      tally.set(el, (tally.get(el) ?? 0) + n * coeff);
    }
  }
  return tally;
};

for (const rx of reactions) {
  if (!rx.reactants.length || !rx.products.length) fail(`reaction ${rx.id}: sisi kosong`);
  if (!rx.sources.length) fail(`reaction ${rx.id}: tanpa sitasi`);
  if (!rx.explanation) fail(`reaction ${rx.id}: tanpa penjelasan`);
  const left = atomTally(rx.reactants);
  const right = atomTally(rx.products);
  const keys = new Set([...left.keys(), ...right.keys()]);
  for (const k of keys) {
    if ((left.get(k) ?? 0) !== (right.get(k) ?? 0)) {
      fail(`reaction ${rx.id}: tidak setara pada ${k} (${left.get(k) ?? 0} vs ${right.get(k) ?? 0})`);
    }
  }
}

// ---------- peringatan (tidak menggagalkan build) ----------
const gcdOf = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
};

const ratioSignature = (tally) => {
  const entries = [...tally.entries()].filter(([, n]) => Number.isFinite(n) && n > 0);
  if (!entries.length) return '';
  const divisor = entries.map(([, n]) => n).reduce(gcdOf);
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([el, n]) => `${el}${n / divisor}`)
    .join('|');
};

const signatureBuckets = new Map();
for (const rx of reactions) {
  const tally = atomTally(rx.reactants);
  let total = 0;
  for (const [el, n] of tally) {
    total += n;
    if (n > 12) console.warn(`PERINGATAN: ${rx.id} memakai ${n} atom ${el} (batas chamber 12)`);
  }
  if (total > 24) console.warn(`PERINGATAN: ${rx.id} memakai ${total} atom pereaksi (batas chamber 24)`);

  const sig = ratioSignature(tally);
  if (!sig) continue;
  const ids = signatureBuckets.get(sig) ?? [];
  ids.push(rx.id);
  signatureBuckets.set(sig, ids);
}

for (const [sig, ids] of signatureBuckets) {
  if (ids.length > 1) {
    console.warn(`PERINGATAN: rasio ${sig} dipakai oleh ${ids.join(', ')} (mesin akan menandai ambigu)`);
  }
}


if (errors.length) {
  console.error('VALIDASI GAGAL:');
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}

// ---------- derive molar mass ----------
const massOf = byId.size && new Map(species.map((s) => [s.id, s]));
for (const sp of species) {
  let mass = 0;
  for (const [el, n] of Object.entries(sp.composition)) {
    const element = elementBySymbol.get(el);
    mass += element.mass * n;
  }
  sp.molarMass = Math.round(mass * 1000) / 1000;
}
void massOf;
void multiset;

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'elements.json'), JSON.stringify(elements, null, 2) + '\n', 'utf8');
writeFileSync(resolve(outDir, 'species.json'), JSON.stringify(species, null, 2) + '\n', 'utf8');
writeFileSync(resolve(outDir, 'reactions.json'), JSON.stringify(reactions, null, 2) + '\n', 'utf8');

console.log(`OK: ${elements.length} unsur, ${species.length} species, ${reactions.length} reaksi`);
