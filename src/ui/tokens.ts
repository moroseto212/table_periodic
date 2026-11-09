import type { ElementCategory } from '../core/chemistry/types';

/** Warna pastel kategori untuk fill/tint di kedua tema. */
export const categoryColors: Record<ElementCategory, string> = {
  alkali: '#FFB7C5',
  alkaline: '#FFD9A8',
  transition: '#A9DCE8',
  'post-transition': '#C7CEEA',
  metalloid: '#CDEBA5',
  nonmetal: '#FFF3B8',
  halogen: '#9FE2D8',
  noble: '#D9C9FF',
  lanthanide: '#F3D9C0',
  actinide: '#E8C4C4',
};

/** Varian lebih gelap untuk teks/aksen di tema terang (kontras di atas putih). */
export const categoryInkColors: Record<ElementCategory, string> = {
  alkali: '#9B2C4A',
  alkaline: '#8A5310',
  transition: '#0F5A6B',
  'post-transition': '#3D4C7A',
  metalloid: '#3F6A10',
  nonmetal: '#7A5B00',
  halogen: '#0C6257',
  noble: '#5B3E9E',
  lanthanide: '#7A4A17',
  actinide: '#7A2E3A',
};

export const categoryLabels: Record<ElementCategory, string> = {
  alkali: 'Logam alkali',
  alkaline: 'Logam alkali tanah',
  transition: 'Logam transisi',
  'post-transition': 'Logam pascatransisi',
  metalloid: 'Metaloid',
  nonmetal: 'Nonlogam',
  halogen: 'Halogen',
  noble: 'Gas mulia',
  lanthanide: 'Lantanida',
  actinide: 'Aktinida',
};
