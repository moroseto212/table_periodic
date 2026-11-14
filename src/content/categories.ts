import type { ElementCategory } from '../core/chemistry/types.ts';

/**
 * Konstanta kategori unsur yang ringan (tanpa konten panjang), dipakai bersama
 * oleh aplikasi, halaman panduan, dan generator prerender.
 */
export const CATEGORY_ORDER: ElementCategory[] = [
  'alkali',
  'alkaline',
  'transition',
  'post-transition',
  'metalloid',
  'nonmetal',
  'halogen',
  'noble',
  'lanthanide',
  'actinide',
];

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
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

export const CATEGORY_SLUGS: Record<ElementCategory, string> = {
  alkali: 'logam-alkali',
  alkaline: 'logam-alkali-tanah',
  transition: 'logam-transisi',
  'post-transition': 'logam-pascatransisi',
  metalloid: 'metaloid',
  nonmetal: 'nonlogam',
  halogen: 'halogen',
  noble: 'gas-mulia',
  lanthanide: 'lantanida',
  actinide: 'aktinida',
};

export const CATEGORY_GROUP_RANGE: Record<ElementCategory, string> = {
  alkali: 'golongan 1',
  alkaline: 'golongan 2',
  transition: 'golongan 3–12',
  'post-transition': 'golongan 13–16',
  metalloid: 'golongan 13–16',
  nonmetal: 'golongan 14–16 dan hidrogen',
  halogen: 'golongan 17',
  noble: 'golongan 18',
  lanthanide: 'golongan 3, deret lantanida',
  actinide: 'golongan 3, deret aktinida',
};

export const groupPath = (category: ElementCategory): string =>
  `/golongan/${CATEGORY_SLUGS[category]}`;

export const periodPath = (period: number): string => `/periode/${period}`;
