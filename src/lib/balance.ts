/**
 * Available Balance — calcolo del saldo disponibile reale
 * --------------------------------------------------------
 * Saldo disponibile = (entrate totali) - (uscite totali) - (somma currentAmount obiettivi)
 *
 * Logica:
 * - Le entrate aumentano il saldo
 * - Le uscite lo riducono
 * - I soldi "messi via" sugli obiettivi sono fisicamente lì, NON nel disponibile
 *   (lo stesso modello mentale di Lydia, Revolut Vaults, N26 Spaces)
 */

export interface BalanceComputation {
  totalIncome: number;
  totalExpense: number;
  totalSavedInGoals: number;
  /** Saldo netto disponibile per spese (può andare in negativo) */
  available: number;
}

export interface TxLike {
  amount: number;
  type: "INCOME" | "EXPENSE";
}

export interface GoalLike {
  currentAmount: number;
}

export function computeAvailableBalance(
  transactions: TxLike[],
  goals: GoalLike[]
): BalanceComputation {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") totalIncome += t.amount;
    else totalExpense += t.amount;
  }

  const totalSavedInGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const available = totalIncome - totalExpense - totalSavedInGoals;

  return {
    totalIncome,
    totalExpense,
    totalSavedInGoals,
    available,
  };
}
