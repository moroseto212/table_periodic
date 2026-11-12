import { describe, expect, it } from 'vitest';
import { elements } from '../../core/data/elements';
import { filterElements, matchesElementQuery } from './filter';

const symbols = (query: string) => filterElements(elements, query).map((element) => element.symbol);

describe('pencarian unsur di laboratorium', () => {
  it('mencocokkan awalan nama unsur', () => {
    expect(symbols('besi')).toEqual(['Fe']);
    expect(symbols('hidro')).toEqual(['H']);
    expect(symbols('tembaga')).toEqual(['Cu']);
  });

  it('mencocokkan awalan simbol', () => {
    expect(symbols('fe')).toEqual(['Fe', 'Fm']);
    expect(symbols('na')).toEqual(['Na']);
  });

  it('tidak mencocokkan huruf di tengah nama', () => {
    const be = symbols('be');
    expect(be).toEqual(['Be', 'S', 'Fe', 'Bk']);
    expect(be).not.toContain('No'); // Nobelium
  });

  it('mencocokkan nomor atom persis', () => {
    expect(symbols('26')).toEqual(['Fe']);
    expect(symbols('2')).toEqual(['He']);
    expect(symbols('79')).toEqual(['Au']);
  });

  it('mengabaikan huruf besar-kecil dan spasi tepi', () => {
    expect(symbols('  BESI  ')).toEqual(['Fe']);
    expect(symbols('Fe')).toEqual(symbols('fe'));
  });

  it('mengembalikan semua unsur saat query kosong', () => {
    expect(filterElements(elements, '')).toBe(elements);
    expect(filterElements(elements, '   ')).toBe(elements);
    expect(symbols('')).toHaveLength(118);
  });

  it('mengembalikan daftar kosong bila tidak ada yang cocok', () => {
    expect(symbols('zzz')).toEqual([]);
  });

  it('matchesElementQuery menangani query kosong dan pencocokan langsung', () => {
    const besi = elements.find((element) => element.symbol === 'Fe');
    expect(besi).toBeDefined();
    if (!besi) return;
    expect(matchesElementQuery(besi, '')).toBe(true);
    expect(matchesElementQuery(besi, 'bes')).toBe(true);
    expect(matchesElementQuery(besi, 'esi')).toBe(false);
    expect(matchesElementQuery(besi, '26')).toBe(true);
  });
});
