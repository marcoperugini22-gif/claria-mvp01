import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";
import { seedMockDataForUser } from "@/lib/mockData/seedUserMock";

export async function POST() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { primaryGoal: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    await seedMockDataForUser({
      prisma,
      userId,
      primaryGoalText: user.primaryGoal,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/user/seed-mock] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
