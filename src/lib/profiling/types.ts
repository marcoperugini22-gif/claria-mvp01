/**
 * Profile types — re-export dei tipi Prisma + costanti runtime
 * --------------------------------------------------------------
 * Centralizziamo qui l'enum PsychoFinancialProfile perché:
 * 1. Evita il pattern "import { Enum } from '@prisma/client'" sparso ovunque
 *    (alcuni ambienti CI generano stub che rompono questo import).
 * 2. Garantisce che i 4 valori siano definiti come costanti runtime utilizzabili
 *    sia come tipo sia come valore (per default switch, validation, ecc.).
 *
 * Le stringhe DEVONO combaciare ESATTAMENTE con l'enum definito in schema.prisma.
 */

export const PsychoFinancialProfile = {
  RIMANDATORE_STRATEGICO: "RIMANDATORE_STRATEGICO",
  EVITANTE: "EVITANTE",
  CONTROLLORE_FRAGILE: "CONTROLLORE_FRAGILE",
  IMPULSIVO_CONSAPEVOLE: "IMPULSIVO_CONSAPEVOLE",
} as const;

export type PsychoFinancialProfile =
  (typeof PsychoFinancialProfile)[keyof typeof PsychoFinancialProfile];

export const ALL_PROFILES: PsychoFinancialProfile[] = [
  PsychoFinancialProfile.RIMANDATORE_STRATEGICO,
  PsychoFinancialProfile.EVITANTE,
  PsychoFinancialProfile.CONTROLLORE_FRAGILE,
  PsychoFinancialProfile.IMPULSIVO_CONSAPEVOLE,
];
