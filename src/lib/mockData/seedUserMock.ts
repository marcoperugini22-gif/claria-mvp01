/**
 * Seed mock data per dashboard demo.
 * Popola un utente con: 1 saving goal di esempio + transazioni storiche realistiche.
 * Idempotente: chiamato dal /api/user/seed-mock se l'utente non ha ancora dati.
 */

import { PrismaClient } from "@prisma/client";

interface SeedMockOptions {
  prisma: PrismaClient;
  userId: string;
  primaryGoalText?: string | null;
}

// Pattern di spese realistiche per un giovane adulto under 30
const MOCK_TRANSACTIONS = [
  { daysAgo: 28, amount: 1200, type: "INCOME" as const, category: "OTHER" as const, description: "Stipendio", merchant: "Datore di lavoro" },
  { daysAgo: 27, amount: 450, type: "EXPENSE" as const, category: "BILLS" as const, description: "Affitto", merchant: "Affitto stanza", isImpulsive: false },
  { daysAgo: 26, amount: 12.5, type: "EXPENSE" as const, category: "FOOD" as const, description: "Pranzo bar", merchant: "Bar Centrale", isImpulsive: false },
  { daysAgo: 24, amount: 49.9, type: "EXPENSE" as const, category: "SHOPPING" as const, description: "Acquisto online", merchant: "Amazon", isImpulsive: true, regretFlagged: true },
  { daysAgo: 23, amount: 8.99, type: "EXPENSE" as const, category: "SUBSCRIPTIONS" as const, description: "Streaming", merchant: "Netflix", isImpulsive: false },
  { daysAgo: 22, amount: 35, type: "EXPENSE" as const, category: "ENTERTAINMENT" as const, description: "Cena fuori", merchant: "Trattoria", isImpulsive: false },
  { daysAgo: 20, amount: 22.5, type: "EXPENSE" as const, category: "FOOD" as const, description: "Spesa supermercato", merchant: "Coop", isImpulsive: false },
  { daysAgo: 18, amount: 89.99, type: "EXPENSE" as const, category: "SHOPPING" as const, description: "Sneakers", merchant: "Foot Locker", isImpulsive: true, regretFlagged: true },
  { daysAgo: 17, amount: 15, type: "EXPENSE" as const, category: "TRANSPORT" as const, description: "Treno", merchant: "Trenitalia", isImpulsive: false },
  { daysAgo: 15, amount: 6.5, type: "EXPENSE" as const, category: "FOOD" as const, description: "Aperitivo", merchant: "Bar centro", isImpulsive: false },
  { daysAgo: 14, amount: 32, type: "EXPENSE" as const, category: "ENTERTAINMENT" as const, description: "Cinema + popcorn", merchant: "UCI", isImpulsive: false },
  { daysAgo: 12, amount: 28.5, type: "EXPENSE" as const, category: "FOOD" as const, description: "Cena con amici", merchant: "Pizzeria", isImpulsive: false },
  { daysAgo: 10, amount: 64.9, type: "EXPENSE" as const, category: "SHOPPING" as const, description: "App store + accessorio", merchant: "Apple Store", isImpulsive: true, regretFlagged: true },
  { daysAgo: 8, amount: 11.9, type: "EXPENSE" as const, category: "FOOD" as const, description: "Pranzo veloce", merchant: "Poke house", isImpulsive: false },
  { daysAgo: 7, amount: 4.5, type: "EXPENSE" as const, category: "TRANSPORT" as const, description: "Metro", merchant: "ATM", isImpulsive: false },
  { daysAgo: 5, amount: 19, type: "EXPENSE" as const, category: "FOOD" as const, description: "Aperitivo + cocktail", merchant: "Bar", isImpulsive: false },
  { daysAgo: 4, amount: 42.5, type: "EXPENSE" as const, category: "SHOPPING" as const, description: "Felpa", merchant: "Zalando", isImpulsive: true, regretFlagged: false },
  { daysAgo: 3, amount: 9.99, type: "EXPENSE" as const, category: "SUBSCRIPTIONS" as const, description: "Spotify", merchant: "Spotify", isImpulsive: false },
  { daysAgo: 2, amount: 14.5, type: "EXPENSE" as const, category: "FOOD" as const, description: "Cena take-away", merchant: "Sushi delivery", isImpulsive: false },
  { daysAgo: 1, amount: 7, type: "EXPENSE" as const, category: "FOOD" as const, description: "Caffè e cornetto", merchant: "Bar", isImpulsive: false },
];

function inferGoalCategory(text: string | null | undefined): "TRAVEL" | "TECH" | "EMERGENCY_FUND" | "HOME" | "EDUCATION" | "EXPERIENCE" | "CUSTOM" {
  if (!text) return "CUSTOM";
  const t = text.toLowerCase();
  if (t.includes("viagg") || t.includes("vacanz")) return "TRAVEL";
  if (t.includes("emergenz") || t.includes("imprevist")) return "EMERGENCY_FUND";
  if (t.includes("casa") || t.includes("affitto") || t.includes("indipenden")) return "HOME";
  if (t.includes("comput") || t.includes("telef") || t.includes("tech")) return "TECH";
  if (t.includes("corso") || t.includes("master") || t.includes("studi")) return "EDUCATION";
  return "CUSTOM";
}

export async function seedMockDataForUser({ prisma, userId, primaryGoalText }: SeedMockOptions): Promise<void> {
  // Verifica idempotenza: se ha già transazioni o goal, non rifare nulla
  const existingTx = await prisma.transaction.count({ where: { userId } });
  const existingGoals = await prisma.savingGoal.count({ where: { userId } });

  if (existingTx > 0 || existingGoals > 0) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profile: true },
  });

  // ---------------- Saving Goal ----------------
  // Crea un goal di default coerente con l'obiettivo primario dichiarato
  const goalTitle = primaryGoalText
    ? `${primaryGoalText.charAt(0).toUpperCase()}${primaryGoalText.slice(1)}`
    : "Il mio primo obiettivo";

  const category = inferGoalCategory(primaryGoalText);

  // Per IMPULSIVO_CONSAPEVOLE: target piccolo e raggiungibile, milestone ravvicinate
  const targetAmount = 500;
  const currentAmount = 75; // un piccolo head-start, dà la sensazione di progresso

  const milestones = [
    { label: "Primo passo", threshold: 50, reached: true },
    { label: "Un quinto", threshold: 100, reached: false },
    { label: "Metà strada", threshold: 250, reached: false },
    { label: "Quasi", threshold: 400, reached: false },
    { label: "Fatto!", threshold: 500, reached: false },
  ];

  await prisma.savingGoal.create({
    data: {
      userId,
      title: goalTitle,
      description: "Goal di default creato per iniziare. Puoi modificarlo quando vuoi.",
      category,
      targetAmount,
      currentAmount,
      profileAtCreation: user?.profile ?? null,
      milestones,
    },
  });

  // ---------------- Transazioni mock ----------------
  const now = Date.now();
  await prisma.transaction.createMany({
    data: MOCK_TRANSACTIONS.map((t) => ({
      userId,
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description,
      merchant: t.merchant,
      date: new Date(now - t.daysAgo * 24 * 60 * 60 * 1000),
      isImpulsive: t.isImpulsive ?? false,
      regretFlagged: t.regretFlagged ?? false,
      source: "mock_seed",
    })),
  });

  // ---------------- Alert iniziale per Impulsivo Consapevole ----------------
  if (user?.profile === "IMPULSIVO_CONSAPEVOLE") {
    await prisma.biasAlert.create({
      data: {
        userId,
        bias: "IMPULSIVITY",
        message:
          "Negli ultimi 30 giorni hai segnato 4 spese impulsive per 247€. Se li avessi messi via, saresti già a metà del tuo obiettivo.",
        suggestedAction: {
          action: "open_saving_goal",
          opportunityCost: 247,
        },
        context: {
          window_days: 30,
          impulsive_count: 4,
          impulsive_total: 247,
        },
      },
    });
  }
}
