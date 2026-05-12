import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setUserCookie, getUserIdFromCookie } from "@/lib/session";

const startSchema = z.object({
  email: z.string().email("Email non valida"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = startSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;

    // Se l'utente esiste già con questa email, riprendi la sessione
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      setUserCookie(existing.id);
      return NextResponse.json({
        userId: existing.id,
        onboardingCompleted: !!existing.onboardingCompletedAt,
        profile: existing.profile,
      });
    }

    // Altrimenti crea un nuovo utente
    const user = await prisma.user.create({
      data: { email, name: name ?? null },
    });

    setUserCookie(user.id);

    return NextResponse.json({
      userId: user.id,
      onboardingCompleted: false,
      profile: null,
    });
  } catch (err) {
    console.error("[/api/onboarding/start] error", err);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

/**
 * GET → ritorna lo stato dell'utente corrente (se loggato via cookie)
 */
export async function GET() {
  const userId = getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      profile: true,
      profileConfidence: true,
      onboardingCompletedAt: true,
    },
  });

  return NextResponse.json({ user });
}
