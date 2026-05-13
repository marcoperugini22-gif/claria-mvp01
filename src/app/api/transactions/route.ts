import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";

const VALID_CATEGORIES = [
  "FOOD", "TRANSPORT", "ENTERTAINMENT", "SHOPPING", "BILLS", "HEALTH",
  "EDUCATION", "SUBSCRIPTIONS", "SAVINGS", "TRANSFER", "OTHER",
] as const;

const createSchema = z.object({
  amount: z.number().positive().max(1000000),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum(VALID_CATEGORIES).optional().default("OTHER"),
  description: z.string().max(200).optional(),
  merchant: z.string().max(100).optional(),
  date: z.string().optional(), // ISO string
  isImpulsive: z.boolean().optional().default(false),
  recurring: z.object({
    frequency: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
    dayOfMonth: z.number().int().min(1).max(28).default(1),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { amount, type, category, description, merchant, date, isImpulsive, recurring } = parsed.data;

    const txDate = date ? new Date(date) : new Date();

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        category,
        description: description ?? null,
        merchant: merchant ?? null,
        date: txDate,
        isImpulsive,
        source: "manual",
      },
    });

    // Se è ricorrente, crea anche la regola
    if (recurring) {
      await prisma.recurringEntry.create({
        data: {
          userId,
          amount,
          type,
          category,
          description: description ?? null,
          frequency: recurring.frequency,
          dayOfMonth: recurring.dayOfMonth,
          startDate: txDate,
          lastMaterializedAt: txDate,
          isActive: true,
        },
      });
    }

    // Log evento comportamentale
    await prisma.behavioralEvent.create({
      data: {
        userId,
        eventType: "TRANSACTION_LOGGED",
        metadata: { transactionId: transaction.id, type, amount, isImpulsive },
      },
    });

    return NextResponse.json({ ok: true, transactionId: transaction.id });
  } catch (err) {
    console.error("[/api/transactions] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("[/api/transactions] GET error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
