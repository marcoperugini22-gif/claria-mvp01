/**
 * Onboarding Tasks — calcolo dello stato dei 3 task pratici
 * ----------------------------------------------------------
 * Dopo aver completato le 12 domande dell'onboarding psicometrico,
 * l'utente ha ancora 3 "task" pratici da completare:
 *  1. Aggiungere la prima entrata
 *  2. Creare il primo obiettivo
 *  3. Registrare la prima uscita
 *
 * Quando tutti e 3 sono completi, la dashboard "piena" si sblocca.
 */

import { prisma } from "@/lib/db";

export type TaskKey = "FIRST_INCOME" | "FIRST_GOAL" | "FIRST_EXPENSE";

export interface OnboardingTask {
  key: TaskKey;
  title: string;
  subtitle: string;
  completed: boolean;
}

export interface OnboardingTasksState {
  tasks: OnboardingTask[];
  /** Quanti task sono completati (0-3) */
  completedCount: number;
  /** True se tutti e 3 sono completati */
  allDone: boolean;
  /** Il prossimo task da completare (primo non completato), null se tutto fatto */
  nextTask: OnboardingTask | null;
}

export async function computeOnboardingTasks(userId: string): Promise<OnboardingTasksState> {
  const [incomeCount, goalCount, expenseCount] = await Promise.all([
    prisma.transaction.count({
      where: { userId, type: "INCOME" },
    }),
    prisma.savingGoal.count({
      where: { userId },
    }),
    prisma.transaction.count({
      where: { userId, type: "EXPENSE" },
    }),
  ]);

  const tasks: OnboardingTask[] = [
    {
      key: "FIRST_INCOME",
      title: "Aggiungi la tua prima entrata",
      subtitle: "Stipendio, paghetta, freelance — qualsiasi cosa ti entri.",
      completed: incomeCount > 0,
    },
    {
      key: "FIRST_GOAL",
      title: "Crea il tuo primo obiettivo",
      subtitle: "Viaggio, casa, fondo emergenza…",
      completed: goalCount > 0,
    },
    {
      key: "FIRST_EXPENSE",
      title: "Registra una spesa di oggi",
      subtitle: "Anche solo il caffè.",
      completed: expenseCount > 0,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const nextTask = tasks.find((t) => !t.completed) ?? null;

  return {
    tasks,
    completedCount,
    allDone: completedCount === tasks.length,
    nextTask,
  };
}
