export type ElementCategory =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide';

export type PhysicalState = 'solid' | 'liquid' | 'gas' | 'aqueous';
export type Block = 's' | 'p' | 'd' | 'f';

export interface Isotope {
  massNumber: number;
  abundancePct?: number;
  stable: boolean;
}

export interface Element {
  z: number;
  symbol: string;
  name: string;
  category: ElementCategory;
  group: number | null;
  period: number;
  block: Block;
  mass: number;
  electronConfig: string;
  shells: number[];
  stateSTP: Exclude<PhysicalState, 'aqueous'>;
  meltingK: number | null;
  boilingK: number | null;
  densityGcm3: number | null;
  electronegativity: number | null;
  atomicRadiusPm: number | null;
  ionizationKJmol: number | null;
  oxidationStates: number[];
  isotopes: Isotope[];
  discoveredYear: number | null;
  summary: string;
  hazards: string[];
  sources: string[];
}

export interface Species {
  id: string;
  formula: string;
  name: string;
  composition: Record<string, number>;
  charge: number;
  stateSTP: PhysicalState;
  hazards: string[];
  sources: string[];
  molarMass: number;
}

export type Condition = 'heat' | 'catalyst' | 'pressure' | 'aqueous';
export type BondType = 'kovalen' | 'kovalen-polar' | 'ion' | 'logam';
export type Curriculum = 'merdeka-e' | 'merdeka-f' | 'gcse';

export interface ReactionSide {
  species: string;
  coeff: number;
}

export interface Reaction {
  id: string;
  reactants: ReactionSide[];
  products: ReactionSide[];
  conditions: Condition[];
  bondTypes: BondType[];
  deltaHkJmol: number | null;
  observation: string;
  explanation: string;
  hazards: string[];
  curriculum: Curriculum[];
  sources: string[];
  priority: number;
}

/** Multiset atom per lambang unsur, mis. { H: 4, O: 2 } */
export type AtomCount = Record<string, number>;

export interface IndexedReaction {
  reaction: Reaction;
  /** Rasio atom ternormalisasi, mis. { H: 2, O: 1 } */
  ratio: AtomCount;
  signature: string;
  priority: number;
  /** GCD total atom per satu satuan persamaan (mis. 4H + 2O -> 2) */
  gcd: number;
}

export interface ReactionIndex {
  bySignature: Map<string, IndexedReaction[]>;
  all: IndexedReaction[];
}

export interface ProductAmount {
  species: string;
  coeff: number;
}

export type ReactionOutcome =
  | {
      kind: 'reacted';
      reaction: Reaction;
      /** Pengali koefisien, mis. 2 untuk 4H + 2O */
      scale: number;
      products: ProductAmount[];
      /** Atom yang tersisa karena berlebih (pereaksi pembatas) */
      leftover: AtomCount;
      /** Reaksi lain yang juga cocok dengan rasio yang sama */
      ambiguousWith: string[];
    }
  | {
      kind: 'inert';
      reason: 'no-rule' | 'conditions';
      /** Kondisi yang belum terpenuhi (untuk pesan edukatif) */
      missingConditions?: Condition[];
    };

export const MAX_ATOMS_TOTAL = 24;
export const MAX_ATOMS_PER_ELEMENT = 12;
export const MAX_SPECIES = 4;
