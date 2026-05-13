import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";
import { computeAvailableBalance } from "@/lib/balance";

const moveSchema = z.object({
  amount: z.number().positive().max(1000000),
  direction: z.enum(["deposit", "withdraw"]),
});

/**
 * POST /api/goals/[id]/move
 * direction=deposit  → sposta `amount` dal saldo disponibile al goal
 * direction=withdraw → sposta `amount` dal goal al saldo disponibile
 *
 * Validazioni:
 *  - deposit: amount <= saldo disponibile
 *  - withdraw: amount <= currentAmount del goal (non si va in negativo)
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = moveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { amount, direction } = parsed.data;

    const goal = await prisma.savingGoal.findUnique({
      where: { id: params.id },
    });
    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: "Obiettivo non trovato" }, { status: 404 });
    }

    if (direction === "deposit") {
      // Verifica saldo disponibile
      const [transactions, allGoals] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          select: { amount: true, type: true },
        }),
        prisma.savingGoal.findMany({
          where: { userId, status: "ACTIVE" },
          select: { currentAmount: true },
        }),
      ]);

      const { available } = computeAvailableBalance(
        transactions.map((t: { amount: number; type: string }) => ({
          amount: t.amount,
          type: t.type as "INCOME" | "EXPENSE",
        })),
        allGoals
      );

      if (amount > available) {
        return NextResponse.json(
          {
            error: `Non hai abbastanza disponibile. Saldo: ${available.toFixed(2)}€`,
          },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.savingContribution.create({
          data: {
            goalId: goal.id,
            amount,
            note: "Versamento manuale",
            triggeredByNudge: false,
          },
        }),
        prisma.savingGoal.update({
          where: { id: goal.id },
          data: { currentAmount: { increment: amount } },
        }),
        prisma.behavioralEvent.create({
          data: {
            userId,
            eventType: "ALERT_ACTED_UPON",
            metadata: { source: "goal_slider", action: "deposit", amount, goalId: goal.id },
          },
        }),
      ]);

      return NextResponse.json({ ok: true });
    } else {
      // withdraw: amount <= currentAmount
      if (amount > goal.currentAmount) {
        return NextResponse.json(
          {
            error: `L'obiettivo contiene solo ${goal.currentAmount.toFixed(2)}€`,
          },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.savingContribution.create({
          data: {
            goalId: goal.id,
            amount: -amount,
            note: "Prelievo manuale",
            triggeredByNudge: false,
          },
        }),
        prisma.savingGoal.update({
          where: { id: goal.id },
          data: { currentAmount: { decrement: amount } },
        }),
        prisma.behavioralEvent.create({
          data: {
            userId,
            eventType: "ALERT_ACTED_UPON",
            metadata: { source: "goal_slider", action: "withdraw", amount, goalId: goal.id },
          },
        }),
      ]);

      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("[/api/goals/[id]/move] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
