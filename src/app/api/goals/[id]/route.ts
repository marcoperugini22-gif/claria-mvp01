import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const goal = await prisma.savingGoal.findUnique({
      where: { id: params.id },
    });

    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: "Goal non trovato" }, { status: 404 });
    }

    // Depinna gli altri, pinna questo
    await prisma.$transaction([
      prisma.savingGoal.updateMany({
        where: { userId, isPinned: true, id: { not: params.id } },
        data: { isPinned: false },
      }),
      prisma.savingGoal.update({
        where: { id: params.id },
        data: { isPinned: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/goals/[id]/pin] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const goal = await prisma.savingGoal.findUnique({
      where: { id: params.id },
    });

    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: "Goal non trovato" }, { status: 404 });
    }

    await prisma.savingGoal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/goals/[id]] DELETE error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
