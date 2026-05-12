/**
 * Spending Analytics — calcoli derivati dalle transazioni
 * --------------------------------------------------------
 * Pure functions: prende dati grezzi, restituisce metriche.
 * Non tocca il DB direttamente — i caller passano i dati già recuperati.
 * Questo permette di testare le metriche senza mock di Prisma.
 */

export interface TransactionLike {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: Date;
  isImpulsive: boolean;
  regretFlagged: boolean;
  description: string | null;
  merchant: string | null;
}

export interface SpendingSummary {
  /** Totale entrate ultimi 30 gg */
  totalIncome30d: number;
  /** Totale uscite ultimi 30 gg */
  totalExpense30d: number;
  /** Saldo netto del periodo */
  netFlow30d: number;
  /** Numero spese impulsive ultimi 30 gg */
  impulsiveCount30d: number;
  /** Totale € spesi in modo impulsivo ultimi 30 gg */
  impulsiveTotal30d: number;
  /** % delle uscite che è stata impulsiva */
  impulsivePct30d: number;
  /** Top categorie di spesa (max 3) */
  topCategories: Array<{ category: string; total: number; count: number }>;
  /** Ultime 3 transazioni impulsive segnalate (per il widget "lessons") */
  recentImpulsive: TransactionLike[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function analyzeSpending(transactions: TransactionLike[]): SpendingSummary {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * MS_PER_DAY;

  const recent = transactions.filter(
    (t) => t.date.getTime() >= thirtyDaysAgo
  );

  let totalIncome30d = 0;
  let totalExpense30d = 0;
  let impulsiveCount30d = 0;
  let impulsiveTotal30d = 0;
  const byCategory = new Map<string, { total: number; count: number }>();

  for (const t of recent) {
    if (t.type === "INCOME") {
      totalIncome30d += t.amount;
    } else {
      totalExpense30d += t.amount;
      if (t.isImpulsive) {
        impulsiveCount30d += 1;
        impulsiveTotal30d += t.amount;
      }
      const prev = byCategory.get(t.category) ?? { total: 0, count: 0 };
      byCategory.set(t.category, {
        total: prev.total + t.amount,
        count: prev.count + 1,
      });
    }
  }

  const topCategories = Array.from(byCategory.entries())
    .map(([category, v]) => ({ category, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const recentImpulsive = recent
    .filter((t) => t.isImpulsive)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  return {
    totalIncome30d,
    totalExpense30d,
    netFlow30d: totalIncome30d - totalExpense30d,
    impulsiveCount30d,
    impulsiveTotal30d,
    impulsivePct30d: totalExpense30d > 0 ? (impulsiveTotal30d / totalExpense30d) * 100 : 0,
    topCategories,
    recentImpulsive,
  };
}

/**
 * Calcola il "costo opportunità" di una spesa rispetto a un saving goal:
 * "quei X€ sarebbero stati Y% del tuo obiettivo" o
 * "ti avrebbero portato Z settimane più vicino".
 */
export interface OpportunityCost {
  amount: number;
  pctOfGoal: number;
  /** Giorni in più di avvicinamento al goal, a parità di ritmo medio */
  daysOfProgress: number | null;
  /** Frase pronta per la UI */
  framing: string;
}

export function computeOpportunityCost(opts: {
  amountToSpend: number;
  goalTargetAmount: number;
  goalCurrentAmount: number;
  /** € risparmiati al mese in media — passato dal caller */
  monthlySavingRate?: number;
}): OpportunityCost {
  const { amountToSpend, goalTargetAmount, goalCurrentAmount, monthlySavingRate } = opts;

  const remaining = Math.max(0, goalTargetAmount - goalCurrentAmount);
  const pctOfGoal = remaining > 0 ? (amountToSpend / remaining) * 100 : 0;

  // Giorni di progresso "comprati" da questi soldi se invece di spenderli li mettessimo via
  let daysOfProgress: number | null = null;
  if (monthlySavingRate && monthlySavingRate > 0) {
    const dailyRate = monthlySavingRate / 30;
    daysOfProgress = Math.round(amountToSpend / dailyRate);
  }

  let framing: string;
  if (pctOfGoal >= 30) {
    framing = `Questi ${Math.round(amountToSpend)}€ sono già un terzo di quello che ti manca per il tuo obiettivo.`;
  } else if (pctOfGoal >= 15) {
    framing = `Questi ${Math.round(amountToSpend)}€ ti porterebbero più vicino al tuo obiettivo del ${Math.round(pctOfGoal)}%.`;
  } else if (daysOfProgress && daysOfProgress >= 7) {
    framing = `Questi ${Math.round(amountToSpend)}€ = circa ${daysOfProgress} giorni di avvicinamento al tuo obiettivo.`;
  } else {
    framing = `Questi ${Math.round(amountToSpend)}€ sono comunque un passo. Anche piccolo conta.`;
  }

  return { amount: amountToSpend, pctOfGoal, daysOfProgress, framing };
}
