import type {
  AtomCount,
  Condition,
  ReactionIndex,
  Species,
} from '../../core/chemistry/types';
import { MAX_ATOMS_PER_ELEMENT, MAX_ATOMS_TOTAL } from '../../core/chemistry/types';

export interface LabPreset {
  /** Id reaksi sumber, mis. "h2-o2-water". */
  id: string;
  /** Nama pendek untuk tombol, mis. "Air". */
  label: string;
  /** Rumus produk, mis. "H2O". */
  formula: string;
  /** Nama produk lengkap, mis. "Air". */
  productName: string;
  /** Id species produk, dipakai untuk verifikasi. */
  productId: string;
  /** Rasio atom reaktan, langsung bisa dipakai sebagai isi chamber. */
  chamber: AtomCount;
  /** Kondisi yang dibutuhkan reaksi ini. */
  conditions: Condition[];
}

/**
 * Resep terkurasi: reaksi sederhana yang mudah dikenali siswa.
 * Urutan ini juga menentukan urutan tombol di UI.
 */
const CURATED: { reactionId: string; label: string }[] = [
  { reactionId: 'h2-o2-water', label: 'Air' },
  { reactionId: 'c-o2-dioxide', label: 'Karbon dioksida' },
  { reactionId: 'na-cl2-salt', label: 'Garam dapur' },
  { reactionId: 'n2-h2-ammonia', label: 'Amonia' },
  { reactionId: 'fe-o2-oxide', label: 'Karat besi' },
  { reactionId: 's-o2-so2', label: 'Belerang dioksida' },
];

/**
 * Bangun daftar resep dari indeks reaksi yang sudah ada.
 * Resep yang datanya hilang atau melewati batas atom dilewati otomatis,
 * sehingga UI tidak pernah menampilkan tombol yang mustahil dijalankan.
 */
export function buildPresets(
  index: ReactionIndex,
  speciesById: Map<string, Species>,
): LabPreset[] {
  const byId = new Map(index.all.map((entry) => [entry.reaction.id, entry]));
  const presets: LabPreset[] = [];

  for (const { reactionId, label } of CURATED) {
    const entry = byId.get(reactionId);
    if (!entry) continue;

    const chamber = { ...entry.ratio };
    const counts = Object.values(chamber);
    const total = counts.reduce((sum, n) => sum + n, 0);
    if (total === 0 || total > MAX_ATOMS_TOTAL) continue;
    if (counts.some((n) => n > MAX_ATOMS_PER_ELEMENT)) continue;

    const primary = entry.reaction.products[0];
    if (!primary) continue;
    const product = speciesById.get(primary.species);
    if (!product) continue;

    presets.push({
      id: entry.reaction.id,
      label,
      formula: product.formula,
      productName: product.name,
      productId: product.id,
      chamber,
      conditions: [...entry.reaction.conditions],
    });
  }

  return presets;
}
