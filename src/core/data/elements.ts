import elementsJson from './elements.json';
import type { Element } from '../chemistry/types';

/**
 * Data unsur dipisah dari data reaksi/spesies agar tabel periodik tidak
 * mengunduh ±130 KB JSON laboratorium saat halaman pertama dibuka.
 */
export const elements = elementsJson as unknown as Element[];

export const elementBySymbol = new Map(elements.map((e) => [e.symbol, e]));
export const elementByZ = new Map(elements.map((e) => [e.z, e]));

/** Unsur yang tersedia di baki (dibatasi oleh dataset saat ini). */
export const trayElements = [...elements].sort((a, b) => a.z - b.z);
