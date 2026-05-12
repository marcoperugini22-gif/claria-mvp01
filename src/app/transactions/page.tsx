import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

const CATEGORY_STYLE: Record<string, { icon: string; from: string; to: string }> = {
  FOOD:          { icon: "🍕", from: "#FEF3C7", to: "#FDE68A" },
  TRANSPORT:     { icon: "🚊", from: "#DBEAFE", to: "#BFDBFE" },
  ENTERTAINMENT: { icon: "🎬", from: "#FAE8FF", to: "#F5D0FE" },
  SHOPPING:      { icon: "🛍️", from: "#FCE7F3", to: "#FBCFE8" },
  BILLS:         { icon: "💡", from: "#FEF9C3", to: "#FEF08A" },
  SUBSCRIPTIONS: { icon: "📺", from: "#E0E7FF", to: "#C7D2FE" },
  HEALTH:        { icon: "💊", from: "#DCFCE7", to: "#BBF7D0" },
  EDUCATION:     { icon: "📚", from: "#E0F2FE", to: "#BAE6FD" },
  SAVINGS:       { icon: "🐷", from: "#FCE7F3", to: "#FBCFE8" },
  TRANSFER:      { icon: "↔️", from: "#F1F5F9", to: "#E2E8F0" },
  OTHER:         { icon: "💸", from: "#F5F5F4", to: "#E7E5E4" },
};
const INCOME_STYLE = { icon: "💼", from: "#DCFCE7", to: "#BBF7D0" };

function fmtDate(d: Date) {
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function fmtGroupKey(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = (today.getTime() - target.getTime()) / 86400000;
  if (diff === 0) return "Oggi";
  if (diff === 1) return "Ieri";
  return fmtDate(d);
}

export default async function TransactionsPage() {
  const userId = getUserIdFromCookie();
  if (!userId) redirect("/onboarding");

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 200,
  });

  // Group by day
  const groups: { label: string; items: typeof transactions }[] = [];
  const seen = new Map<string, number>();

  for (const tx of transactions) {
    const key = tx.date.toISOString().slice(0, 10);
    if (!seen.has(key)) {
      seen.set(key, groups.length);
      groups.push({ label: fmtGroupKey(tx.date), items: [] });
    }
    groups[seen.get(key)!].items.push(tx);
  }

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <main className="min-h-dvh pb-nav">
      {/* Header */}
      <header className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard"
            className="h-9 w-9 rounded-xl bg-claria-ink/[0.08] flex items-center justify-center text-claria-ink text-lg active:scale-95"
          >
            ←
          </Link>
          <h1 className="text-[15px] font-medium text-claria-ink">Movimenti</h1>
          <Link
            href="/transactions/new"
            className="h-9 px-3 rounded-xl bg-claria-ink text-claria-cream text-[12px] font-medium flex items-center gap-1 active:scale-95"
          >
            + Nuovo
          </Link>
        </div>

        {/* Sommario income/expense */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            className="rounded-2xl p-3.5"
            style={{ background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700/70">
              Entrate
            </p>
            <p className="mt-1 text-[20px] font-medium text-emerald-800 tabular-nums tracking-[-0.02em]">
              +{totalIncome.toFixed(0)}€
            </p>
          </div>
          <div
            className="rounded-2xl p-3.5"
            style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700/70">
              Uscite
            </p>
            <p className="mt-1 text-[20px] font-medium text-amber-800 tabular-nums tracking-[-0.02em]">
              -{totalExpense.toFixed(0)}€
            </p>
          </div>
        </div>
      </header>

      {/* List */}
      <section className="px-5 space-y-5 mt-2">
        {groups.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] font-medium text-claria-ink/60">Nessun movimento ancora</p>
            <Link
              href="/transactions/new"
              className="mt-4 inline-block bg-claria-ink text-claria-cream px-5 py-3 rounded-2xl text-[13px] font-medium active:scale-[0.98]"
            >
              Aggiungi il primo
            </Link>
          </div>
        )}
        {groups.map((group) => {
          const dayIncome = group.items
            .filter((t) => t.type === "INCOME")
            .reduce((s, t) => s + t.amount, 0);
          const dayExpense = group.items
            .filter((t) => t.type === "EXPENSE")
            .reduce((s, t) => s + t.amount, 0);

          return (
            <div key={group.label}>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-semibold text-claria-ink/55 capitalize">
                  {group.label}
                </p>
                <p className="text-[11px] text-claria-ink/40 tabular-nums">
                  {dayIncome > 0 && (
                    <span className="text-emerald-600 font-medium">+{dayIncome.toFixed(0)}€</span>
                  )}
                  {dayIncome > 0 && dayExpense > 0 && <span className="mx-1">·</span>}
                  {dayExpense > 0 && (
                    <span>−{dayExpense.toFixed(0)}€</span>
                  )}
                </p>
              </div>

              <div
                className="bg-white rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 2px 12px rgba(30,21,194,0.04)" }}
              >
                {group.items.map((tx, i) => {
                  const isIncome = tx.type === "INCOME";
                  const style = isIncome
                    ? INCOME_STYLE
                    : (CATEGORY_STYLE[tx.category] ?? CATEGORY_STYLE.OTHER);
                  const label = tx.description ?? tx.merchant ?? "Transazione";

                  return (
                    <div
                      key={tx.id}
                      className={`px-4 py-3 flex items-center gap-3 ${
                        i > 0 ? "border-t border-claria-ink/[0.06]" : ""
                      }`}
                    >
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-[17px] shrink-0"
                        style={{
                          background: `linear-gradient(135deg,${style.from},${style.to})`,
                        }}
                      >
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-claria-ink truncate">
                          {label}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-claria-ink/45 capitalize">
                            {tx.category.toLowerCase()}
                          </span>
                          {tx.isImpulsive && (
                            <span
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,165,0,0.15)", color: "#D97706" }}
                            >
                              ⚡ veloce
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-[14px] font-medium tabular-nums shrink-0 tracking-[-0.01em] ${
                          isIncome ? "text-emerald-700" : "text-claria-ink"
                        }`}
                      >
                        {isIncome ? "+" : "−"}
                        {tx.amount.toFixed(2)}€
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
      <BottomNav />
    </main>
  );
}
