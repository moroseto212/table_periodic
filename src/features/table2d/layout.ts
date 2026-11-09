import type { Element } from '../../core/chemistry/types';

export const CARD_W = 1;
export const CARD_H = 1.25;
export const GAP = 0.14;
const PITCH_X = CARD_W + GAP;
const PITCH_Y = CARD_H + GAP;

export interface CardPlacement {
  element: Element;
  x: number;
  y: number;
}

/**
 * Tata letak tabel periodik standar (18 golongan x 7 periode).
 * Blok-f ditempatkan pada dua baris terpisah di bawah tabel.
 */
export function layoutElements(elements: Element[]): CardPlacement[] {
  const f: Element[] = [];
  const placements: CardPlacement[] = [];

  for (const element of elements) {
    if (element.group == null) {
      f.push(element);
      continue;
    }
    const x = (element.group - 1 - 8.5) * PITCH_X;
    const y = (4 - element.period) * PITCH_Y;
    placements.push({ element, x, y });
  }

  const fGroups = f
    .sort((a, b) => a.z - b.z)
    .reduce<Record<string, Element[]>>((acc, el) => {
      const key = el.category;
      (acc[key] ??= []).push(el);
      return acc;
    }, {});

  let row = 0;
  for (const key of ['lanthanide', 'actinide']) {
    const list = fGroups[key];
    if (!list) continue;
    const y = (4 - (8 + row)) * PITCH_Y;
    list.forEach((element, i) => {
      placements.push({ element, x: (i - 7) * PITCH_X, y });
    });
    row += 1;
  }

  return placements;
}

export const TABLE_WIDTH = 18 * PITCH_X;
export const TABLE_HEIGHT = 7 * PITCH_Y;
