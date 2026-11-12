import { describe, expect, it } from 'vitest';
import { buildPresets } from './presets';
import { elements, reactionIndex, speciesById } from '../../core/data';
import { react } from '../../core/chemistry/engine';
import { MAX_ATOMS_PER_ELEMENT, MAX_ATOMS_TOTAL } from '../../core/chemistry/types';

const presets = buildPresets(reactionIndex, speciesById);
const knownSymbols = new Set(elements.map((element) => element.symbol));

describe('resep cepat laboratorium', () => {
  it('menyediakan setidaknya enam resep umum', () => {
    expect(presets.length).toBeGreaterThanOrEqual(6);
    expect(presets.map((preset) => preset.productName)).toEqual(
      expect.arrayContaining(['Air', 'Karbon dioksida', 'Natrium klorida', 'Amonia']),
    );
  });

  it('memakai id reaksi yang unik', () => {
    const ids = presets.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const preset of presets) {
    it(`resep ${preset.label} memakai unsur yang dikenal dan batas atom`, () => {
      const entries = Object.entries(preset.chamber);
      expect(entries.length).toBeGreaterThan(0);

      for (const [symbol, count] of entries) {
        expect(knownSymbols.has(symbol)).toBe(true);
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(MAX_ATOMS_PER_ELEMENT);
      }

      const total = entries.reduce((sum, [, count]) => sum + count, 0);
      expect(total).toBeLessThanOrEqual(MAX_ATOMS_TOTAL);
    });

    it(`resep ${preset.label} benar-benar menghasilkan ${preset.productName}`, () => {
      const outcome = react(preset.chamber, reactionIndex, {
        conditions: preset.conditions,
      });

      expect(outcome.kind).toBe('reacted');
      if (outcome.kind !== 'reacted') return;

      expect(outcome.products.some((product) => product.species === preset.productId)).toBe(
        true,
      );
    });
  }
});
