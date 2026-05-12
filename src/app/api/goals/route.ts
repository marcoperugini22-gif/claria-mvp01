import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";

const VALID_CATEGORIES = [
  "EMERGENCY_FUND", "TRAVEL", "EDUCATION", "HOME", "TECH", "EXPERIENCE", "GIFT", "CUSTOM",
] as const;

const createGoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(VALID_CATEGORIES).optional().default("CUSTOM"),
  icon: z.string().max(8).optional(),
  targetAmount: z.number().positive().max(10000000),
  deadline: z.string().optional(), // ISO
  isPinned: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, category, icon, targetAmount, deadline, isPinned } = parsed.data;

    // Recupera profilo per snapshot
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile: true },
    });

    // Genera milestone in base al target (5 step proporzionali)
    const milestones = [
      { label: "Primo passo", threshold: Math.round(targetAmount * 0.1), reached: false },
      { label: "Un quinto", threshold: Math.round(targetAmount * 0.2), reached: false },
      { label: "Metà strada", threshold: Math.round(targetAmount * 0.5), reached: false },
      { label: "Quasi", threshold: Math.round(targetAmount * 0.8), reached: false },
      { label: "Fatto!", threshold: targetAmount, reached: false },
    ];

    // Se viene chiesto il pin, prima depinniamo eventuali altri
    if (isPinned) {
      await prisma.savingGoal.updateMany({
        where: { userId, isPinned: true },
        data: { isPinned: false },
      });
    } else {
      // Se è il primo goal dell'utente, pinnalo automaticamente
      const goalCount = await prisma.savingGoal.count({ where: { userId } });
      if (goalCount === 0) {
        // Forza il pin sul primo goal
        const goal = await prisma.savingGoal.create({
          data: {
            userId,
            title,
            description: description ?? null,
            category,
            icon: icon ?? null,
            targetAmount,
            deadline: deadline ? new Date(deadline) : null,
            profileAtCreation: user?.profile ?? null,
            milestones,
            isPinned: true,
          },
        });
        return NextResponse.json({ ok: true, goalId: goal.id });
      }
    }

    const goal = await prisma.savingGoal.create({
      data: {
        userId,
        title,
        description: description ?? null,
        category,
        icon: icon ?? null,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
        profileAtCreation: user?.profile ?? null,
        milestones,
        isPinned,
      },
    });

    await prisma.behavioralEvent.create({
      data: {
        userId,
        eventType: "GOAL_CREATED",
        metadata: { goalId: goal.id, targetAmount, category },
      },
    });

    return NextResponse.json({ ok: true, goalId: goal.id });
  } catch (err) {
    console.error("[/api/goals] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const goals = await prisma.savingGoal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: [{ isPinned: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ goals });
  } catch (err) {
    console.error("[/api/goals] GET error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
