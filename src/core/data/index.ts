import speciesJson from './species.json';
import reactionsJson from './reactions.json';
import { buildIndex } from '../chemistry/engine';
import type { Reaction, Species } from '../chemistry/types';

export { elements, elementBySymbol, elementByZ, trayElements } from './elements';

export const species = speciesJson as unknown as Species[];
export const reactions = reactionsJson as unknown as Reaction[];

export const reactionIndex = buildIndex(reactions, species);

export const speciesById = new Map(species.map((s) => [s.id, s]));
