"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/education", label: "Education", icon: "📚" },
  { href: "/about", label: "Chi siamo", icon: "👋" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-md z-40 pointer-events-none px-3">
      <div
        className="pointer-events-auto rounded-[22px] flex items-center justify-around p-2"
        style={{
          background: "rgba(30,21,194,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 10px 30px rgba(30,21,194,0.3), inset 0 1px 0 rgba(255,247,206,0.1)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-[14px] transition-all active:scale-95 ${
                isActive ? "bg-claria-cream/15" : ""
              }`}
            >
              <span
                className={`text-[17px] transition-transform ${
                  isActive ? "scale-110" : "opacity-60"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[9.5px] font-medium tracking-[0.01em] ${
                  isActive ? "text-claria-cream" : "text-claria-cream/55"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
