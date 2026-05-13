"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/transactions", label: "Movimenti", icon: "💳" },
  { href: "/education", label: "Impara", icon: "📚" },
  { href: "/about", label: "Chi siamo", icon: "👋" },
];

const HIDDEN_PATHS = ["/auth", "/", "/onboarding"];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

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

      {/* ── Mobile: bottom nav pill ───────────────────────────────────── */}
      <nav
        aria-label="Navigazione principale"
        className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-md z-40 pointer-events-none px-3"
      >
        <div
          className="pointer-events-auto rounded-[22px] flex items-center justify-around p-2"
          style={{
            background: "rgba(30,21,194,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 10px 30px rgba(30,21,194,0.3), inset 0 1px 0 rgba(255,247,206,0.1)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-[14px] transition-all active:scale-95 ${
                  active ? "bg-claria-cream/15" : ""
                }`}
              >
                <span className={`text-[17px] transition-transform ${active ? "scale-110" : "opacity-60"}`}>
                  {item.icon}
                </span>
                <span
                  className={`text-[9px] font-medium tracking-[0.01em] ${
                    active ? "text-claria-cream" : "text-claria-cream/55"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
