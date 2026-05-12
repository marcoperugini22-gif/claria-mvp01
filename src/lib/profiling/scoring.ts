/**
 * Claria — Profile Scoring Engine
 * --------------------------------
 * Implementa l'algoritmo approvato nel documento di proposta (§6):
 *   1. Somma pesata dei punteggi grezzi
 *   2. Normalizzazione sui massimi teorici calcolati dinamicamente dal DB
 *   3. Calcolo confidence (gap top1-top2)
 *   4. Soglie minime per evitare profilazione su segnale debole
 *
 * Le soglie possono essere ricalibrate senza modificare il codice consumer.
 */

import { PsychoFinancialProfile } from "./types";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------
// Tipi
// ---------------------------------------------------------------

export type ProfileKey = "R" | "E" | "C" | "I";

export interface ProfileScores {
  R: number;
  E: number;
  C: number;
  I: number;
}

export interface ScoringResult {
  /** Profilo assegnato, oppure null se segnale debole o profili ambigui */
  profile: PsychoFinancialProfile | null;
  /** Punteggi normalizzati (0-1) per tutti e 4 i profili */
  normalizedScores: ProfileScores;
  /** Punteggi grezzi (senza normalizzazione) per debug/analytics */
  rawScores: ProfileScores;
  /** Confidence dell'assegnazione (0-1) — sotto soglia → profile=null */
  confidence: number;
  /** Motivo dell'esito (utile per debug e per UX di "rivelazione") */
  reason:
    | "assigned"
    | "signal_too_weak"
    | "ambiguous_top_profiles"
    | "no_scoring_answers";
}

export interface UserAnswerInput {
  questionCode: string;
  optionValue?: string;
  rawAnswer?: string;
  numericAnswer?: number;
}

// ---------------------------------------------------------------
// Soglie (centralizzate, ricalibrabili)
// ---------------------------------------------------------------

export const SCORING_THRESHOLDS = {
  /** Sotto questo livello di intensità sul top1, il segnale è troppo debole */
  MIN_TOP_SCORE: 0.3,
  /** Sotto questo gap relativo tra top1 e top2, i profili sono ambigui */
  MIN_CONFIDENCE: 0.15,
} as const;

const PROFILE_KEY_TO_ENUM: Record<ProfileKey, PsychoFinancialProfile> = {
  R: PsychoFinancialProfile.RIMANDATORE_STRATEGICO,
  E: PsychoFinancialProfile.EVITANTE,
  C: PsychoFinancialProfile.CONTROLLORE_FRAGILE,
  I: PsychoFinancialProfile.IMPULSIVO_CONSAPEVOLE,
};

// ---------------------------------------------------------------
// Calcolo dei massimi teorici (dinamico dal DB)
// ---------------------------------------------------------------

/**
 * Per ogni domanda, prende il peso MAX assegnato a ciascun profilo
 * tra tutte le sue opzioni. Somma questi max sull'intero questionario.
 * Risultato: il punteggio massimo teoricamente ottenibile per ogni profilo.
 *
 * Calcolato runtime dal DB → cambia automaticamente se modifichi seed/pesi.
 */
export async function computeTheoreticalMax(
  version: number = 1
): Promise<ProfileScores> {
  const questions = await prisma.onboardingQuestion.findMany({
    where: { version, isActive: true },
    include: { options: true },
  });

  const max: ProfileScores = { R: 0, E: 0, C: 0, I: 0 };

  for (const q of questions) {
    if (q.options.length === 0) continue;

    for (const key of ["R", "E", "C", "I"] as const) {
      let maxForThisQ = 0;
      for (const opt of q.options) {
        const w = opt.profileWeights as Record<string, number>;
        const weight = w[key] ?? 0;
        if (weight > maxForThisQ) maxForThisQ = weight;
      }
      max[key] += maxForThisQ;
    }
  }

  return max;
}

// ---------------------------------------------------------------
// Algoritmo principale
// ---------------------------------------------------------------

/**
 * Calcola il profilo dato l'insieme delle risposte dell'utente.
 * Non scrive in DB: separazione netta tra logica e persistenza.
 */
export async function computeProfile(
  answers: UserAnswerInput[]
): Promise<ScoringResult> {
  // 1. Recupera tutte le opzioni rilevanti (con i loro pesi)
  const optionValues = answers
    .filter((a) => a.optionValue)
    .map((a) => a.optionValue!);

  if (optionValues.length === 0) {
    return {
      profile: null,
      normalizedScores: { R: 0, E: 0, C: 0, I: 0 },
      rawScores: { R: 0, E: 0, C: 0, I: 0 },
      confidence: 0,
      reason: "no_scoring_answers",
    };
  }

  const options = await prisma.onboardingOption.findMany({
    where: { value: { in: optionValues } },
    include: { question: true },
  });

  // Map: questionCode → option scelta (per consistenza)
  type OptionWithQuestion = (typeof options)[number];
  const optionsByCode = new Map<string, OptionWithQuestion>();
  for (const a of answers) {
    if (!a.optionValue) continue;
    const opt = options.find(
      (o: OptionWithQuestion) => o.question.code === a.questionCode && o.value === a.optionValue
    );
    if (opt) optionsByCode.set(a.questionCode, opt);
  }

  // 2. Somma i pesi grezzi
  const raw: ProfileScores = { R: 0, E: 0, C: 0, I: 0 };
  for (const opt of optionsByCode.values()) {
    const w = opt.profileWeights as Record<string, number>;
    raw.R += w.R ?? 0;
    raw.E += w.E ?? 0;
    raw.C += w.C ?? 0;
    raw.I += w.I ?? 0;
  }

  // 3. Normalizza sui massimi teorici
  const maxTheoretical = await computeTheoreticalMax();
  const normalized: ProfileScores = {
    R: maxTheoretical.R > 0 ? raw.R / maxTheoretical.R : 0,
    E: maxTheoretical.E > 0 ? raw.E / maxTheoretical.E : 0,
    C: maxTheoretical.C > 0 ? raw.C / maxTheoretical.C : 0,
    I: maxTheoretical.I > 0 ? raw.I / maxTheoretical.I : 0,
  };

  // 4. Ordina e calcola confidence
  const ranked = (Object.keys(normalized) as ProfileKey[])
    .map((k) => ({ key: k, score: normalized[k] }))
    .sort((a, b) => b.score - a.score);

  const [top1, top2] = ranked;

  const margin = top1.score - top2.score;
  const confidence = top1.score > 0 ? Math.min(margin / top1.score, 1) : 0;

  // 5. Decisione finale
  let profile: PsychoFinancialProfile | null = null;
  let reason: ScoringResult["reason"];

  if (top1.score < SCORING_THRESHOLDS.MIN_TOP_SCORE) {
    profile = null;
    reason = "signal_too_weak";
  } else if (confidence < SCORING_THRESHOLDS.MIN_CONFIDENCE) {
    profile = null;
    reason = "ambiguous_top_profiles";
  } else {
    profile = PROFILE_KEY_TO_ENUM[top1.key];
    reason = "assigned";
  }

  return {
    profile,
    normalizedScores: normalized,
    rawScores: raw,
    confidence,
    reason,
  };
}

// ---------------------------------------------------------------
// Helper: leggi risposte utente e calcola profilo
// ---------------------------------------------------------------

/**
 * Wrapper che legge dal DB tutte le risposte di un utente e calcola il profilo.
 * Usato dall'endpoint /api/onboarding/complete.
 */
export async function computeProfileForUser(
  userId: string
): Promise<ScoringResult> {
  const answers = await prisma.onboardingAnswer.findMany({
    where: { userId },
    include: { option: true, question: true },
  });

  const inputs: UserAnswerInput[] = answers.map((a: { question: { code: string }; option: { value: string } | null; rawAnswer: string | null; numericAnswer: number | null }) => ({
    questionCode: a.question.code,
    optionValue: a.option?.value,
    rawAnswer: a.rawAnswer ?? undefined,
    numericAnswer: a.numericAnswer ?? undefined,
  }));

  return computeProfile(inputs);
}
