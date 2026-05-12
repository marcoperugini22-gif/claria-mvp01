/**
 * Session helpers — MVP-grade
 * ----------------------------
 * Per l'MVP gestiamo l'identità utente tramite un singolo cookie HTTP-only
 * `claria_uid` che contiene il `User.id`. Niente JWT, niente token rotation:
 * va sostituito con NextAuth/Clerk/Lucia in produzione.
 *
 * Tutte le funzioni server-side accedono ai cookies tramite next/headers.
 */

import { cookies } from "next/headers";

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
