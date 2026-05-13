import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";

const putAwaySchema = z.object({
  amount: z.number().positive().max(100000),
  note: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = putAwaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { amount, note } = parsed.data;

    // Trova il primo saving goal attivo
    const goal = await prisma.savingGoal.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Nessun obiettivo attivo" },
        { status: 404 }
      );
    }

    // Crea contributo + aggiorna il currentAmount + log evento comportamentale
    const [contribution] = await prisma.$transaction([
      prisma.savingContribution.create({
        data: {
          goalId: goal.id,
          amount,
          note: note ?? "Pausa decisionale: rimesso via",
          triggeredByNudge: true,
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
          metadata: {
            source: "decision_pause",
            amount,
            goalId: goal.id,
          },
        },
      }),
    ]);

    return NextResponse.json({ ok: true, contributionId: contribution.id });
  } catch (err) {
    console.error("[/api/dashboard/put-away] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
