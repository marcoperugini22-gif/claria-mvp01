import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";

const proceedSchema = z.object({
  amount: z.number().positive().max(100000),
  what: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = proceedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { amount, what } = parsed.data;

    // Logga l'evento — utile per analytics e per il modello che valuterà
    // l'efficacia della pausa decisionale nel tempo
    await prisma.behavioralEvent.create({
      data: {
        userId,
        eventType: "ALERT_DISMISSED",
        metadata: {
          source: "decision_pause",
          amount,
          what: what ?? null,
          decision: "proceeded",
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/dashboard/proceed-spend] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
