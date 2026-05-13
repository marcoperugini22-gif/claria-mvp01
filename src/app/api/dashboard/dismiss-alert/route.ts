import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";

const schema = z.object({
  alertId: z.string().cuid(),
});

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const alert = await prisma.biasAlert.findUnique({
      where: { id: parsed.data.alertId },
    });
    if (!alert || alert.userId !== userId) {
      return NextResponse.json({ error: "Alert non trovato" }, { status: 404 });
    }

    await prisma.biasAlert.update({
      where: { id: alert.id },
      data: { dismissedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/dashboard/dismiss-alert] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
