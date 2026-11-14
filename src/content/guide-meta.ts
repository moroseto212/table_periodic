/**
 * Metadata rute panduan tanpa konten berat.
 *
 * Dipakai App.tsx agar judul dan deskripsi langsung benar sebelum chunk
 * GuideScreen (yang memuat seluruh konten) selesai diunduh.
 */
export interface GuideRouteMeta {
  title: string;
  description: string;
}

const GUIDES: Record<string, GuideRouteMeta> = {
  'daftar-unsur': {
    title: 'Daftar 118 Unsur Kimia Lengkap dan Terurut | PeriodikLab',
    description:
      'Indeks 118 unsur kimia: daftar menurut nomor atom, pengelompokan golongan, dan tautan ke halaman tiap unsur beserta sifatnya.',
  },
  'konfigurasi-elektron': {
    title: 'Konfigurasi Elektron 118 Unsur & Aturan Aufbau | PeriodikLab',
    description:
      'Cara menulis konfigurasi elektron, urutan pengisian orbital, pengecualian krom dan tembaga, plus daftar konfigurasi 118 unsur.',
  },
  'tanya-jawab': {
    title: 'Tanya Jawab Kimia: Tabel Periodik & Elektron | PeriodikLab',
    description:
      'Sepuluh pertanyaan umum tentang tabel periodik, golongan, periode, konfigurasi elektron, isotop, dan gas mulia — dijawab singkat.',
  },
};

interface GroupMeta {
  label: string;
  title: string;
  description: string;
}

const GROUPS: Record<string, GroupMeta> = {
  'logam-alkali': {
    label: 'Logam alkali',
    title: 'Logam Alkali: Golongan 1 dan Sifatnya | PeriodikLab',
    description:
      'Ciri logam alkali (Li, Na, K, Rb, Cs, Fr): konfigurasi ns¹, reaktivitas tinggi, titik leleh rendah, dan kegunaan sehari-hari.',
  },
  'logam-alkali-tanah': {
    label: 'Logam alkali tanah',
    title: 'Logam Alkali Tanah: Golongan 2 dan Sifatnya | PeriodikLab',
    description:
      'Sifat logam alkali tanah (Be, Mg, Ca, Sr, Ba, Ra): konfigurasi ns², bilangan oksidasi +2, kegunaan magnesium dan kalsium.',
  },
  'logam-transisi': {
    label: 'Logam transisi',
    title: 'Logam Transisi: Golongan 3–12 dan Sifatnya | PeriodikLab',
    description:
      'Ciri logam transisi: blok d, bilangan oksidasi beragam, katalis, warna senyawa, dan kemagnetan. Contoh besi, tembaga, dan seng.',
  },
  'logam-pascatransisi': {
    label: 'Logam pascatransisi',
    title: 'Logam Pascatransisi: Golongan 13–16 | PeriodikLab',
    description:
      'Ciri logam pascatransisi: titik leleh rendah, lunak, cenderung membentuk ion +3. Contoh aluminium, timah, dan timbal.',
  },
  metaloid: {
    label: 'Metaloid',
    title: 'Metaloid: Unsur antara Logam dan Nonlogam | PeriodikLab',
    description:
      'Sifat metaloid (B, Si, Ge, As, Sb, Te): semikonduktor, konduktivitas yang naik saat dipanaskan, dan kegunaan di elektronika.',
  },
  nonlogam: {
    label: 'Nonlogam',
    title: 'Nonlogam: Ciri, Contoh, dan Perannya | PeriodikLab',
    description:
      'Ciri nonlogam (H, C, N, O, P, S, Se): isolator, membentuk anion dan ikatan kovalen, serta menyusun sebagian besar tubuh makhluk hidup.',
  },
  halogen: {
    label: 'Halogen',
    title: 'Halogen: Golongan 17 dan Reaktivitasnya | PeriodikLab',
    description:
      'Sifat halogen (F, Cl, Br, I, At): sangat reaktif, membentuk garam, titik didih naik ke bawah. Kegunaan klorin dan iodin.',
  },
  'gas-mulia': {
    label: 'Gas mulia',
    title: 'Gas Mulia: Golongan 18 dan Sifatnya | PeriodikLab',
    description:
      'Sifat gas mulia (He, Ne, Ar, Kr, Xe, Rn): oktat lengkap, sangat stabil, titik didih rendah, dan kegunaan pada lampu serta las.',
  },
  lantanida: {
    label: 'Lantanida',
    title: 'Lantanida: Deret Unsur Tanah Jarang | PeriodikLab',
    description:
      'Ciri lantanida (La sampai Lu): pengisian orbital 4f, sifat kimia mirip, magnet kuat, dan peran pada magnet serta layar.',
  },
  aktinida: {
    label: 'Aktinida',
    title: 'Aktinida: Deret Unsur Radioaktif | PeriodikLab',
    description:
      'Ciri aktinida (Ac sampai Lr): pengisian orbital 5f, radioaktif, bilangan oksidasi beragam, dan peran uranium serta plutonium.',
  },
};

const PERIODS: Record<number, string> = {
  1: 'Periode 1 hanya berisi hidrogen dan helium: pengisian kulit K, dari satu elektron hingga oktat penuh.',
  2: 'Periode 2 berisi delapan unsur dari litium sampai neon: pengisian orbital 2s dan 2p, tren logam ke nonlogam.',
  3: 'Periode 3 berisi delapan unsur dari natrium sampai argon: pengisian 3s dan 3p, dengan sifat mirip periode 2.',
  4: 'Periode 4 berisi 18 unsur: blok s, 3d, dan p. Tempat logam transisi pertama dan deret kimia industri seperti besi.',
  5: 'Periode 5 berisi 18 unsur dari rubidium sampai xenon, termasuk logam mulia dan unsur beracun seperti kadmium.',
  6: 'Periode 6 berisi 32 unsur: blok 4f (lantanida), 5d, dan 6p, termasuk emas, merkuri, dan timbal.',
  7: 'Periode 7 berisi 32 unsur dari fransium sampai oganeson: deret aktinida dan unsur sintetis terberat.',
};

/** Metadata halaman panduan berdasarkan path, atau null bila bukan panduan. */
export function guideMeta(path: string): GuideRouteMeta | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 1) return GUIDES[parts[0]] ?? null;

  if (parts.length === 2 && parts[0] === 'golongan') {
    const group = GROUPS[parts[1]];
    return group ? { title: group.title, description: group.description } : null;
  }

  if (parts.length === 2 && parts[0] === 'periode') {
    const period = Number(parts[1]);
    const description = PERIODS[period];
    return description
      ? {
          title: `Periode ${period} Tabel Periodik: Unsur dan Trennya | PeriodikLab`,
          description,
        }
      : null;
  }

  return null;
}

export const groupSlugLabel = (slug: string): string | null => GROUPS[slug]?.label ?? null;
