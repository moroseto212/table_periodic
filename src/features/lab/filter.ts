import type { Element } from '../../core/chemistry/types';

/**
 * Cocokkan unsur dengan kata kunci pencarian baki: awalan nama, awalan simbol,
 * atau nomor atom persis. Pencocokan di tengah kata sengaja tidak dipakai agar
 * ketikan pendek seperti "be" tidak ikut memunculkan Nobelium.
 */
export function matchesElementQuery(element: Element, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    element.name.toLowerCase().startsWith(needle) ||
    element.symbol.toLowerCase().startsWith(needle) ||
    String(element.z) === needle
  );
}

/** Saring daftar unsur sesuai ketikan; query kosong mengembalikan daftar asli. */
export function filterElements(list: Element[], query: string): Element[] {
  if (!query.trim()) return list;
  return list.filter((element) => matchesElementQuery(element, query));
}
