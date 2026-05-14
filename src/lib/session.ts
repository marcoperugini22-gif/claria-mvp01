/**
 * Session helpers — MVP-grade
 * ----------------------------
 * Identità utente: priorità a Supabase Auth (se configurato), fallback al
 * cookie legacy `claria_uid` per compatibilità con utenti demo esistenti.
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const COOKIE_NAME = "claria_uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 giorni

export function setUserCookie(userId: string): void {
  cookies().set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function getUserIdFromCookie(): string | null {
  const c = cookies().get(COOKIE_NAME);
  return c?.value ?? null;
}

export function clearUserCookie(): void {
  cookies().delete(COOKIE_NAME);
}

/**
 * Async auth resolver: Supabase session → auto-provision Prisma user → cookie fallback.
 * Usare questo invece di getUserIdFromCookie() in tutti i server components e route handlers.
 */
export async function getServerUserId(): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user: sUser } } = await supabase.auth.getUser();

      if (sUser) {
        // 1. Cerca utente Prisma per supabaseId
        let prismaUser = await prisma.user.findUnique({
          where: { supabaseId: sUser.id },
          select: { id: true },
        });

        if (!prismaUser && sUser.email) {
          try {
            // 2. Prova a creare nuovo utente
            prismaUser = await prisma.user.create({
              data: {
                email: sUser.email,
                supabaseId: sUser.id,
                name: (sUser.user_metadata?.full_name as string | undefined) ?? null,
              },
              select: { id: true },
            });
          } catch (createErr: unknown) {
            // 3. Email già esistente (P2002) → collega senza sovrascrivere profilo
            if ((createErr as { code?: string }).code === "P2002") {
              try {
                prismaUser = await prisma.user.update({
                  where: { email: sUser.email },
                  data: { supabaseId: sUser.id },
                  select: { id: true },
                });
              } catch {
                // ignore
              }
            }
          }
        }

        if (prismaUser) return prismaUser.id;
      }
    } catch (err) {
      console.error("[getServerUserId] Supabase error:", err);
    }
  }

  // Fallback: cookie legacy (utenti demo)
  return getUserIdFromCookie();
}
