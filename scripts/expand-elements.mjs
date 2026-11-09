/**
 * Skrip sekali jalan: gabungkan kurasi manual (elements.csv yang ada) dengan
 * data periodik lengkap 118 unsur, lalu tulis ulang content/elements.csv.
 *
 * Sumber data pelengkap: Periodic-Table-JSON (Bowserinator), data Wikipedia/PubChem.
 * Jalankan: node scripts/expand-elements.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const csvPath = resolve(root, 'content/elements.csv');
const rawPath = resolve(root, 'content/periodic-table.json');

const HEADERS = [
  'z',
  'symbol',
  'name',
  'category',
  'group',
  'period',
  'block',
  'mass',
  'electronConfig',
  'shells',
  'stateSTP',
  'meltingK',
  'boilingK',
  'density',
  'electronegativity',
  'radiusPm',
  'ionization',
  'oxidationStates',
  'isotopes',
  'discoveredYear',
  'summary',
  'hazards',
  'sources',
];

const NAMES = {
  1: 'Hidrogen', 2: 'Helium', 3: 'Litium', 4: 'Berilium', 5: 'Boron', 6: 'Karbon',
  7: 'Nitrogen', 8: 'Oksigen', 9: 'Fluor', 10: 'Neon', 11: 'Natrium', 12: 'Magnesium',
  13: 'Aluminium', 14: 'Silikon', 15: 'Fosfor', 16: 'Belerang', 17: 'Klor', 18: 'Argon',
  19: 'Kalium', 20: 'Kalsium', 21: 'Skandium', 22: 'Titanium', 23: 'Vanadium',
  24: 'Kromium', 25: 'Mangan', 26: 'Besi', 27: 'Kobalt', 28: 'Nikel', 29: 'Tembaga',
  30: 'Zink', 31: 'Galium', 32: 'Germanium', 33: 'Arsen', 34: 'Selenium', 35: 'Bromin',
  36: 'Kripton', 37: 'Rubidium', 38: 'Stronsium', 39: 'Yttrium', 40: 'Zirkonium',
  41: 'Niobium', 42: 'Molibdenum', 43: 'Teknesium', 44: 'Rutenium', 45: 'Rodium',
  46: 'Paladium', 47: 'Perak', 48: 'Kadmium', 49: 'Indium', 50: 'Timah', 51: 'Antimon',
  52: 'Telurium', 53: 'Iodin', 54: 'Xenon', 55: 'Sesium', 56: 'Barium', 57: 'Lantanum',
  58: 'Serium', 59: 'Praseodimium', 60: 'Neodimium', 61: 'Prometium', 62: 'Samarium',
  63: 'Europium', 64: 'Gadolinium', 65: 'Terbium', 66: 'Disprosium', 67: 'Holmium',
  68: 'Erbium', 69: 'Tulium', 70: 'Iterbium', 71: 'Lutesium', 72: 'Hafnium',
  73: 'Tantalum', 74: 'Wolfram', 75: 'Renium', 76: 'Osmium', 77: 'Iridium',
  78: 'Platinum', 79: 'Emas', 80: 'Raksa', 81: 'Talium', 82: 'Timbal', 83: 'Bismut',
  84: 'Polonium', 85: 'Astatin', 86: 'Radon', 87: 'Fransium', 88: 'Radium',
  89: 'Aktinium', 90: 'Torium', 91: 'Protaktinium', 92: 'Uranium', 93: 'Neptunium',
  94: 'Plutonium', 95: 'Amerisium', 96: 'Kurium', 97: 'Berkelium', 98: 'Kalifornium',
  99: 'Einsteinium', 100: 'Fermium', 101: 'Mendelevium', 102: 'Nobelium',
  103: 'Lawrensium', 104: 'Rutherfordium', 105: 'Dubnium', 106: 'Seaborgium',
  107: 'Bohrium', 108: 'Hasium', 109: 'Meitnerium', 110: 'Darmstadtium',
  111: 'Rontgenium', 112: 'Kopernisium', 113: 'Nihonium', 114: 'Flerovium',
  115: 'Moskovium', 116: 'Livermorium', 117: 'Tenesin', 118: 'Oganeson',
};

const CATEGORY = {
  'alkali metal': 'alkali',
  'alkaline earth metal': 'alkaline',
  'transition metal': 'transition',
  'post-transition metal': 'post-transition',
  metalloid: 'metalloid',
  'diatomic nonmetal': 'nonmetal',
  'polyatomic nonmetal': 'nonmetal',
  'noble gas': 'noble',
  lanthanide: 'lanthanide',
  actinide: 'actinide',
  'unknown, probably transition metal': 'transition',
  'unknown, probably post-transition metal': 'post-transition',
  'unknown, probably metalloid': 'metalloid',
  'unknown, predicted to be noble gas': 'noble',
};

const LABEL = {
  alkali: 'logam alkali',
  alkaline: 'logam alkali tanah',
  transition: 'logam transisi',
  'post-transition': 'logam pascatransisi',
  metalloid: 'metaloid',
  nonmetal: 'nonlogam',
  halogen: 'halogen',
  noble: 'gas mulia',
  lanthanide: 'lantanida',
  actinide: 'aktinida',
};

const curatedParsed = Papa.parse(readFileSync(csvPath, 'utf8'), {
  header: true,
  skipEmptyLines: true,
  transformHeader: (h) => h.trim(),
}).data;
const curated = new Map(curatedParsed.map((row) => [row.symbol, row]));

const raw = JSON.parse(readFileSync(rawPath, 'utf8')).elements.filter((el) => el.number <= 118);
if (raw.length !== 118) throw new Error(`Dataset berisi ${raw.length} unsur, seharusnya 118`);

const rows = raw.map((el) => {
  const known = curated.get(el.symbol);
  if (known) {
    return Object.fromEntries(HEADERS.map((key) => [key, known[key] ?? '']));
  }

  const category = CATEGORY[el.category];
  if (!category) throw new Error(`Kategori tidak dikenal: ${el.category} (${el.symbol})`);

  const group = category === 'lanthanide' || category === 'actinide' ? '' : el.group ?? '';
  const mass = el.atomic_mass;
  const radii = el.atomic_radii ?? {};
  const radiusPm =
    radii.empirical?.[0] ?? radii.calculated?.[0] ?? radii.van_der_waals ?? '';
  const yearMatch = /^(\d{4})$/.exec(String(el.discovered_by ?? ''));
  const discovered = yearMatch ? yearMatch[1] : '';
  const synthetic = el.number >= 95 || ['Tc', 'Pm'].includes(el.symbol);

  const summary =
    `Unsur ${LABEL[category]} dengan simbol ${el.symbol} dan nomor atom ${el.number}. ` +
    `Berada pada periode ${el.period}` +
    (group === '' ? ' (blok-f).' : `, golongan ${group}.`) +
    ` Massa atom ${mass} u.` +
    (synthetic ? ' Unsur ini hanya dapat dibuat di laboratorium.' : '');

  return {
    z: el.number,
    symbol: el.symbol,
    name: NAMES[el.number],
    category,
    group,
    period: el.period,
    block: el.block,
    mass,
    electronConfig: el.electron_configuration_semantic,
    shells: el.shells.join('|'),
    stateSTP: String(el.phase).toLowerCase(),
    meltingK: el.melt ?? '',
    boilingK: el.boil ?? '',
    density: el.density_g_cm3 ?? '',
    electronegativity: el.electronegativity_pauling ?? '',
    radiusPm,
    ionization: el.ionization_energies?.[0] ?? '',
    oxidationStates: '',
    isotopes: '',
    discoveredYear: discovered,
    summary,
    hazards: '',
    sources: 'IUPAC|PubChem',
  };
});

const missingNames = rows.filter((row) => !row.name);
if (missingNames.length) {
  throw new Error(`Nama Indonesia hilang untuk: ${missingNames.map((r) => r.symbol).join(', ')}`);
}

writeFileSync(csvPath, Papa.unparse(rows, { columns: HEADERS }) + '\n', 'utf8');
console.log(`OK: ${rows.length} unsur ditulis ke content/elements.csv`);
