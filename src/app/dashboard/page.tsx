import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";
import { getToneConfig } from "@/lib/profiling/toneEngine";
import { analyzeSpending, type TransactionLike } from "@/lib/profiling/spendingAnalytics";
import { computeOnboardingTasks } from "@/lib/onboardingTasks";
import { computeAvailableBalance } from "@/lib/balance";
import { DashboardClient } from "./_components/DashboardClient";
import { EmptyDashboard } from "./_components/EmptyDashboard";

export default async function DashboardPage() {
  const userId = await getServerUserId();
  if (!userId) redirect("/auth/login");

  const [user, tasksState] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        profile: true,
        primaryGoal: true,
        onboardingCompletedAt: true,
      },
    }),
    computeOnboardingTasks(userId),
  ]);

  if (!user) redirect("/onboarding");
  if (!user.onboardingCompletedAt) redirect("/onboarding");

  const tone = getToneConfig(user.profile);

  if (!tasksState.allDone) {
    return (
      <>
        <EmptyDashboard
          userName={user.name}
          profileLabel={tone.label}
          accentColor={tone.accentColor}
          tasks={tasksState.tasks}
          completedCount={tasksState.completedCount}
        />
      </>
    );
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    transactions,
    pinnedGoal,
    otherGoals,
    allGoalsForBalance,
    activeAlert,
    recurringIncome,
    recurringExpense,
    recentTxCount,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.savingGoal.findFirst({
      where: { userId, status: "ACTIVE", isPinned: true },
    }),
    prisma.savingGoal.findMany({
      where: { userId, status: "ACTIVE", isPinned: false },
      orderBy: { createdAt: "asc" },
    }),
    prisma.savingGoal.findMany({
      where: { userId, status: "ACTIVE" },
      select: { currentAmount: true },
    }),
    prisma.biasAlert.findFirst({
      where: { userId, dismissedAt: null, actedUponAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.recurringEntry.count({
      where: { userId, isActive: true, type: "INCOME" },
    }),
    prisma.recurringEntry.count({
      where: { userId, isActive: true, type: "EXPENSE" },
    }),
    prisma.transaction.count({
      where: { userId, date: { gte: sevenDaysAgo } },
    }),
  ]);

  const primaryGoal = pinnedGoal ?? otherGoals[0] ?? null;
  const secondaryGoals = pinnedGoal ? otherGoals : otherGoals.slice(1);

  type TxRow = {
    amount: number;
    type: string;
    category: string;
    date: Date;
    isImpulsive: boolean;
    regretFlagged: boolean;
    description: string | null;
    merchant: string | null;
  };

  const txLike: TransactionLike[] = (transactions as TxRow[]).map((t: TxRow) => ({
    amount: t.amount,
    type: t.type as "INCOME" | "EXPENSE",
    category: t.category,
    date: t.date,
    isImpulsive: t.isImpulsive,
    regretFlagged: t.regretFlagged,
    description: t.description,
    merchant: t.merchant,
  }));

  const summary = analyzeSpending(txLike);
  const monthlySavingRate = Math.max(0, summary.netFlow30d);

  // Saldo disponibile reale
  const balance = computeAvailableBalance(
    txLike.map((t) => ({ amount: t.amount, type: t.type })),
    allGoalsForBalance
  );

  type Milestone = { label: string; threshold: number; reached: boolean };
  let milestones: Milestone[] = [];
  if (primaryGoal?.milestones && Array.isArray(primaryGoal.milestones)) {
    milestones = (primaryGoal.milestones as unknown as Milestone[]).map((m: Milestone) => ({
      ...m,
      reached: primaryGoal.currentAmount >= m.threshold,
    }));
  }

  // Ultime transazioni per la home (max 5)
  const recentTransactions = (transactions as TxRow[]).slice(0, 5).map((t: TxRow) => ({
    amount: t.amount,
    type: t.type as "INCOME" | "EXPENSE",
    category: t.category,
    date: t.date.toISOString(),
    description: t.description ?? t.merchant ?? "Transazione",
    merchant: t.merchant,
    isImpulsive: t.isImpulsive,
  }));

  return (
    <>
      <DashboardClient
        userName={user.name}
        userProfile={user.profile}
        profileLabel={tone.label}
        tagline={tone.tagline}
        accentColor={tone.accentColor}
        availableBalance={balance.available}
        totalSavedInGoals={balance.totalSavedInGoals}
        totalIncome30d={summary.totalIncome30d}
        totalExpense30d={summary.totalExpense30d}
        netFlow30d={summary.netFlow30d}
        impulsiveCount30d={summary.impulsiveCount30d}
        impulsiveTotal30d={summary.impulsiveTotal30d}
        primaryGoalId={primaryGoal?.id ?? null}
        goalTitle={primaryGoal?.title ?? "Il tuo primo obiettivo"}
        goalIcon={primaryGoal?.icon ?? null}
        goalCurrentAmount={primaryGoal?.currentAmount ?? 0}
        goalTargetAmount={primaryGoal?.targetAmount ?? 500}
        goalDeadline={primaryGoal?.deadline ? primaryGoal.deadline.toISOString() : null}
        milestones={milestones}
        monthlySavingRate={monthlySavingRate}
        recentTxCount={recentTxCount}
        recurringIncomeCount={recurringIncome}
        recurringExpenseCount={recurringExpense}
        secondaryGoals={secondaryGoals.map((g: { id: string; title: string; icon: string | null; currentAmount: number; targetAmount: number }) => ({
          id: g.id,
          title: g.title,
          icon: g.icon,
          currentAmount: g.currentAmount,
          targetAmount: g.targetAmount,
        }))}
        recentTransactions={recentTransactions}
        alert={
          activeAlert
            ? { id: activeAlert.id, message: activeAlert.message }
            : null
        }
      />
    </>
  );
}
