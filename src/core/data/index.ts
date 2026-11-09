import elementsJson from './elements.json';
import speciesJson from './species.json';
import reactionsJson from './reactions.json';
import { buildIndex } from '../chemistry/engine';
import type { Element, Reaction, Species } from '../chemistry/types';

export const elements = elementsJson as unknown as Element[];
export const species = speciesJson as unknown as Species[];
export const reactions = reactionsJson as unknown as Reaction[];

export const reactionIndex = buildIndex(reactions, species);

export const elementBySymbol = new Map(elements.map((e) => [e.symbol, e]));
export const elementByZ = new Map(elements.map((e) => [e.z, e]));
export const speciesById = new Map(species.map((s) => [s.id, s]));

/** Unsur yang tersedia di baki (dibatasi oleh dataset saat ini). */
export const trayElements = [...elements].sort((a, b) => a.z - b.z);
