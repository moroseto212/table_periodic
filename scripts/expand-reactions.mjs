/**
 * Ekspansi konten sekali jalan: gabungkan batch spesies + reaksi terkurasi.
 *
 * Skrip ini:
 *  1. membaca species.csv dan reactions.csv yang ada,
 *  2. menambahkan entri baru dari scripts/content/reactions-batch.mjs (id lama menang),
 *  3. memvalidasi keseimbangan atom, batas chamber, dan tabrakan signature,
 *  4. menulis ulang kedua CSV dengan urutan yang stabil.
 *
 * CSV tetap menjadi sumber kebenaran. Jalankan ulang aman (idempoten).
 *
 * Jalankan: node scripts/expand-reactions.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';
import { batchReactions, batchSpecies } from './content/reactions-batch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const speciesPath = resolve(root, 'content/species.csv');
const reactionsPath = resolve(root, 'content/reactions.csv');
const elementsPath = resolve(root, 'content/elements.csv');

const SPECIES_HEADERS = [
  'id',
  'formula',
  'name',
  'composition',
  'charge',
  'stateSTP',
  'hazards',
  'sources',
];
const REACTION_HEADERS = [
  'id',
  'reactants',
  'products',
  'conditions',
  'bondTypes',
  'deltaH',
  'observation',
  'explanation',
  'hazards',
  'curriculum',
  'sources',
  'priority',
];

const CONDITIONS = new Set(['heat', 'catalyst', 'pressure', 'aqueous']);
const BONDS = new Set(['kovalen', 'kovalen-polar', 'ion', 'logam']);
const CURRICULA = new Set(['merdeka-e', 'merdeka-f', 'gcse']);
const MAX_ATOMS_TOTAL = 24;
const MAX_ATOMS_PER_ELEMENT = 12;

const readCsv = (path) =>
  Papa.parse(readFileSync(path, 'utf8'), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  }).data.filter((row) => Object.values(row).some((v) => v !== ''));

const existingSpecies = readCsv(speciesPath);
const existingReactions = readCsv(reactionsPath);
const elementSymbols = new Set(readCsv(elementsPath).map((row) => row.symbol));

const splitPipe = (value) => (value ? String(value).split('|').map((s) => s.trim()).filter(Boolean) : []);

const parseComposition = (raw) => {
  const out = {};
  for (const part of splitPipe(raw)) {
    const [el, n] = part.split(':');
    out[el.trim()] = Number(n);
  }
  return out;
};

const parseSide = (raw) =>
  splitPipe(raw).map((part) => {
    const [species, coeff] = part.split(':');
    return { species: species.trim(), coeff: Number(coeff) };
  });

const errors = [];
const fail = (msg) => errors.push(msg);

/** Batch ditulis ringkas; normalkan ke bentuk CSV. */
function toSpeciesRow(entry) {
  return {
    id: entry.id,
    formula: entry.formula,
    name: entry.name,
    composition: entry.composition,
    charge: String(entry.charge ?? 0),
    stateSTP: entry.state,
    hazards: entry.hazards ?? '',
    sources: entry.sources,
  };
}

function toReactionRow(entry) {
  return {
    id: entry.id,
    reactants: entry.reactants,
    products: entry.products,
    conditions: entry.conditions ?? '',
    bondTypes: entry.bond,
    deltaH: entry.dh == null ? '' : String(entry.dh),
    observation: entry.obs,
    explanation: entry.exp,
    hazards: entry.hazards ?? '',
    curriculum: entry.curriculum,
    sources: entry.sources,
    priority: String(entry.priority),
  };
}

// ---------- gabungkan (id lama dipertahankan kecuali --update) ----------
const updateExisting = process.argv.includes('--update');
const speciesById = new Map(existingSpecies.map((row) => [row.id, row]));
const addedSpecies = [];
for (const entry of batchSpecies) {
  const row = toSpeciesRow(entry);
  if (speciesById.has(row.id)) {
    if (updateExisting) speciesById.set(row.id, row);
    continue;
  }
  speciesById.set(row.id, row);
  addedSpecies.push(row);
}

const reactionById = new Map(existingReactions.map((row) => [row.id, row]));
const addedReactions = [];
for (const entry of batchReactions) {
  const row = toReactionRow(entry);
  if (reactionById.has(row.id)) {
    if (updateExisting) reactionById.set(row.id, row);
    continue;
  }
  reactionById.set(row.id, row);
  addedReactions.push(row);
}

const speciesRows = [
  ...existingSpecies.map((row) => speciesById.get(row.id)),
  ...addedSpecies,
];
const reactionRows = [
  ...existingReactions.map((row) => reactionById.get(row.id)),
  ...addedReactions,
];

// ---------- validasi ----------
const speciesMap = new Map();
for (const row of speciesRows) {
  if (speciesMap.has(row.id)) fail(`species ${row.id}: id duplikat`);
  const composition = parseComposition(row.composition);
  const symbols = Object.keys(composition);
  if (symbols.length === 0) fail(`species ${row.id}: komposisi kosong`);
  for (const symbol of symbols) {
    if (!elementSymbols.has(symbol)) fail(`species ${row.id}: unsur ${symbol} tidak ada`);
    if (!Number.isInteger(composition[symbol]) || composition[symbol] <= 0) {
      fail(`species ${row.id}: jumlah ${symbol} tidak valid`);
    }
  }
  if (!splitPipe(row.sources).length) fail(`species ${row.id}: tanpa sitasi`);
  if (!row.name) fail(`species ${row.id}: tanpa nama`);
  if (!row.formula) fail(`species ${row.id}: tanpa rumus`);
  speciesMap.set(row.id, { ...row, composition });
}

const tally = (side) => {
  const atoms = {};
  for (const { species, coeff } of side) {
    const sp = speciesMap.get(species);
    if (!sp) {
      fail(`reaction: species "${species}" tidak ada`);
      continue;
    }
    if (!Number.isFinite(coeff) || coeff <= 0) fail(`reaction: koefisien ${species} tidak valid`);
    for (const [el, n] of Object.entries(sp.composition)) {
      atoms[el] = (atoms[el] ?? 0) + n * coeff;
    }
  }
  return atoms;
};

const signatureOf = (atoms) => {
  const entries = Object.entries(atoms).filter(([, n]) => Number.isFinite(n) && n > 0);
  if (!entries.length) return '';
  const gcd = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x;
  };
  const divisor = entries.map(([, n]) => n).reduce(gcd);
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([el, n]) => `${el}${n / divisor}`)
    .join('|');
};

const signatures = new Map();
for (const row of reactionRows) {
  if (!splitPipe(row.sources).length) fail(`reaction ${row.id}: tanpa sitasi`);
  if (!row.explanation) fail(`reaction ${row.id}: tanpa penjelasan`);
  if (!row.observation) fail(`reaction ${row.id}: tanpa pengamatan`);
  for (const cond of splitPipe(row.conditions)) {
    if (!CONDITIONS.has(cond)) fail(`reaction ${row.id}: kondisi "${cond}" tidak dikenal`);
  }
  for (const bond of splitPipe(row.bondTypes)) {
    if (!BONDS.has(bond)) fail(`reaction ${row.id}: ikatan "${bond}" tidak dikenal`);
  }
  for (const cur of splitPipe(row.curriculum)) {
    if (!CURRICULA.has(cur)) fail(`reaction ${row.id}: kurikulum "${cur}" tidak dikenal`);
  }
  if (row.deltaH !== '' && !Number.isFinite(Number(row.deltaH))) {
    fail(`reaction ${row.id}: deltaH tidak valid`);
  }

  const reactants = parseSide(row.reactants);
  const products = parseSide(row.products);
  if (reactants.length < 1 || products.length < 1) fail(`reaction ${row.id}: sisi kosong`);
  if (reactants.length > 4) fail(`reaction ${row.id}: lebih dari 4 spesies pereaksi`);

  const left = tally(reactants);
  const right = tally(products);
  const symbols = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const symbol of symbols) {
    if ((left[symbol] ?? 0) !== (right[symbol] ?? 0)) {
      fail(
        `reaction ${row.id}: tidak setara pada ${symbol} (${left[symbol] ?? 0} vs ${right[symbol] ?? 0})`,
      );
    }
  }

  let total = 0;
  for (const [el, n] of Object.entries(left)) {
    if (!Number.isInteger(n)) fail(`reaction ${row.id}: atom ${el} tidak bulat`);
    if (n > MAX_ATOMS_PER_ELEMENT) {
      fail(`reaction ${row.id}: ${el} melebihi batas ${MAX_ATOMS_PER_ELEMENT}`);
    }
    total += n;
  }
  if (total > MAX_ATOMS_TOTAL) {
    fail(`reaction ${row.id}: ${total} atom pereaksi melebihi batas ${MAX_ATOMS_TOTAL}`);
  }

  const sig = signatureOf(left);
  if (!sig) fail(`reaction ${row.id}: signature kosong`);
  const other = signatures.get(sig);
  if (other) fail(`reaction ${row.id}: signature ${sig} bentrok dengan ${other}`);
  else signatures.set(sig, row.id);
}

if (errors.length) {
  console.error('VALIDASI GAGAL:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

// ---------- tulis CSV ----------
const serialize = (headers, rows) =>
  Papa.unparse(rows, { columns: headers, newline: '\n' }) + '\n';

writeFileSync(speciesPath, serialize(SPECIES_HEADERS, speciesRows), 'utf8');
writeFileSync(reactionsPath, serialize(REACTION_HEADERS, reactionRows), 'utf8');

console.log(
  `OK: +${addedSpecies.length} species (total ${speciesRows.length}), ` +
    `+${addedReactions.length} reaksi (total ${reactionRows.length}), ` +
    `${signatures.size} signature unik`,
);
