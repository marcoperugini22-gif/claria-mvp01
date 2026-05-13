import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUserId, clearUserCookie } from "@/lib/session";

/**
 * POST /api/user/reset
 * Cancella completamente l'utente corrente (con tutto a cascata grazie
 * agli onDelete: Cascade sullo schema Prisma) e rimuove il cookie di sessione.
 *
 * Idempotente: se non c'è cookie o utente, ritorna comunque ok.
 */
export async function POST() {
  try {
    const userId = await getServerUserId();

    if (userId) {
      // Verifica che l'utente esista ancora, poi cancella.
      // Il cascade su schema.prisma si occupa di transactions, savingGoals,
      // behavioralEvents, onboardingAnswers, ecc.
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (user) {
        await prisma.user.delete({ where: { id: userId } });
      }
    }

    // Cancella il cookie comunque, anche se l'utente era già sparito
    clearUserCookie();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/user/reset] error", err);
    // Cancelliamo comunque il cookie così l'utente non resta "ancorato"
    // a un userId fantasma
    try {
      clearUserCookie();
    } catch {
      /* ignore */
    }
    return NextResponse.json({ ok: true });
  }
}
