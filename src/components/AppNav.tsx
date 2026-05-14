"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/transactions", label: "Movimenti", icon: "💳" },
  { href: "/education", label: "Impara", icon: "📚" },
  { href: "/about", label: "Chi siamo", icon: "👋" },
];

const HIDDEN_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/", "/onboarding"];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const shouldHide = HIDDEN_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p))
  );
  if (shouldHide) return null;

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop: sidebar verticale fissa ─────────────────────────── */}
      <nav
        aria-label="Navigazione principale"
        className="hidden md:flex fixed left-0 top-0 h-full w-[72px] z-40 flex-col items-center py-5"
        style={{
          background: "rgba(30,21,194,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "2px 0 24px rgba(30,21,194,0.18)",
        }}
      >
        {/* Brand mark */}
        <div
          className="mb-5 h-9 w-9 rounded-[12px] flex items-center justify-center text-claria-cream text-[13px] font-semibold shrink-0"
          style={{ background: "rgba(255,247,206,0.15)" }}
        >
          C
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 w-full px-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center gap-1 py-2.5 rounded-[14px] transition-all active:scale-95"
                style={{
                  background: active ? "rgba(255,247,206,0.15)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,247,206,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span
                  className="text-[20px] leading-none transition-transform"
                  style={{ opacity: active ? 1 : 0.55, transform: active ? "scale(1.1)" : "scale(1)" }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[8px] font-medium tracking-[0.02em] leading-tight text-center"
                  style={{ color: active ? "#FFF7CE" : "rgba(255,247,206,0.5)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Esci"
          className="mb-2 flex flex-col items-center gap-1 py-2.5 px-2 w-full rounded-[14px] transition-all active:scale-95"
          style={{ opacity: 0.4 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
        >
          <span className="text-[18px] leading-none">↩</span>
          <span className="text-[8px] font-medium tracking-[0.02em] text-claria-cream">Esci</span>
        </button>

        {/* Beta badge */}
        <span className="text-[7px] font-semibold tracking-[0.12em] uppercase" style={{ color: "rgba(255,247,206,0.2)" }}>
          Beta
        </span>
      </nav>

      {/* ── Mobile: hamburger FAB ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Apri menu"
        className="md:hidden fixed bottom-6 left-5 z-40 h-12 w-12 rounded-full flex items-center justify-center text-claria-cream text-lg shadow-lg active:scale-95 transition-transform"
        style={{
          background: "rgba(30,21,194,0.97)",
          boxShadow: "0 8px 24px rgba(30,21,194,0.35)",
        }}
      >
        ☰
      </button>

      {/* ── Mobile: drawer backdrop ───────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile: left slide-in drawer ──────────────────────────────── */}
      <nav
        aria-label="Navigazione principale"
        className={`md:hidden fixed left-0 top-0 h-full w-[240px] z-50 flex flex-col py-8 px-3 transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(30,21,194,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "4px 0 32px rgba(30,21,194,0.25)",
        }}
      >
        {/* Close + brand row */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div
            className="h-8 w-8 rounded-[10px] flex items-center justify-center text-claria-cream text-[12px] font-semibold"
            style={{ background: "rgba(255,247,206,0.15)" }}
          >
            C
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Chiudi menu"
            className="h-8 w-8 rounded-full flex items-center justify-center text-claria-cream/70 text-sm active:scale-95 transition-transform"
            style={{ background: "rgba(255,247,206,0.1)" }}
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-[14px] transition-all active:scale-[0.98]"
                style={{
                  background: active ? "rgba(255,247,206,0.15)" : "transparent",
                }}
              >
                <span className="text-[20px]" style={{ opacity: active ? 1 : 0.55 }}>
                  {item.icon}
                </span>
                <span
                  className="text-[14px] font-medium"
                  style={{ color: active ? "#FFF7CE" : "rgba(255,247,206,0.6)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => { setDrawerOpen(false); handleLogout(); }}
          className="flex items-center gap-3 px-3 py-3 rounded-[14px] w-full transition-all active:scale-[0.98]"
          style={{ opacity: 0.5 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
        >
          <span className="text-[18px]">↩</span>
          <span className="text-[14px] font-medium text-claria-cream">Esci</span>
        </button>

        <span className="mt-3 text-center text-[7px] font-semibold tracking-[0.12em] uppercase" style={{ color: "rgba(255,247,206,0.2)" }}>
          Beta
        </span>
      </nav>
    </>
  );
}
