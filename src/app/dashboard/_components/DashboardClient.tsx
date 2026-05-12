"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BalanceCard } from "./BalanceCard";
import { BiasAlertBanner } from "./BiasAlertBanner";
import { DecisionPause } from "./DecisionPause";
import { GoalProgress } from "./GoalProgress";
import { ResetButton } from "./ResetButton";
import { DailyCheckin } from "./DailyCheckin";
import { NextSmallStep } from "./NextSmallStep";
import { AutoPilotStatus } from "./AutoPilotStatus";
import type { PsychoFinancialProfile } from "@/lib/profiling/types";

interface Milestone {
  label: string;
  threshold: number;
  reached: boolean;
}

interface SecondaryGoal {
  id: string;
  title: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number;
}

interface RecentTx {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  description: string;
  merchant: string | null;
  isImpulsive: boolean;
}

interface DashboardClientProps {
  userName: string | null;
  userProfile: PsychoFinancialProfile | null;
  profileLabel: string;
  tagline: string;
  accentColor: string;
  availableBalance: number;
  totalSavedInGoals: number;
  totalIncome30d: number;
  totalExpense30d: number;
  netFlow30d: number;
  impulsiveCount30d: number;
  impulsiveTotal30d: number;
  primaryGoalId: string | null;
  goalTitle: string;
  goalIcon: string | null;
  goalCurrentAmount: number;
  goalTargetAmount: number;
  goalDeadline: string | null;
  milestones: Milestone[];
  monthlySavingRate: number;
  recentTxCount: number;
  recurringIncomeCount: number;
  recurringExpenseCount: number;
  secondaryGoals: SecondaryGoal[];
  recentTransactions: RecentTx[];
  alert: { id: string; message: string } | null;
}

// Map categoria → emoji + gradient (chiari, pastello)
const CATEGORY_STYLE: Record<string, { icon: string; from: string; to: string }> = {
  FOOD:           { icon: "🍕", from: "#FEF3C7", to: "#FDE68A" },
  TRANSPORT:      { icon: "🚊", from: "#DBEAFE", to: "#BFDBFE" },
  ENTERTAINMENT:  { icon: "🎬", from: "#FAE8FF", to: "#F5D0FE" },
  SHOPPING:       { icon: "🛍️", from: "#FCE7F3", to: "#FBCFE8" },
  BILLS:          { icon: "💡", from: "#FEF9C3", to: "#FEF08A" },
  SUBSCRIPTIONS:  { icon: "📺", from: "#E0E7FF", to: "#C7D2FE" },
  HEALTH:         { icon: "💊", from: "#DCFCE7", to: "#BBF7D0" },
  EDUCATION:      { icon: "📚", from: "#E0F2FE", to: "#BAE6FD" },
  SAVINGS:        { icon: "🐷", from: "#FCE7F3", to: "#FBCFE8" },
  TRANSFER:       { icon: "↔️", from: "#F1F5F9", to: "#E2E8F0" },
  OTHER:          { icon: "💸", from: "#F5F5F4", to: "#E7E5E4" },
};
const INCOME_STYLE = { icon: "💼", from: "#DCFCE7", to: "#BBF7D0" };

export function DashboardClient(props: DashboardClientProps) {
  const router = useRouter();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const initial = (props.userName?.charAt(0) ?? "?").toUpperCase();
  const profile = props.userProfile;

  async function handlePutAway(amount: number) {
    const res = await fetch("/api/dashboard/put-away", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("put-away failed");
    setTimeout(() => router.refresh(), 2000);
  }

  async function handleProceed(amount: number) {
    await fetch("/api/dashboard/proceed-spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
  }

  async function handleDismissAlert(alertId: string) {
    await fetch("/api/dashboard/dismiss-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId }),
    });
  }

  const showSignatureWidget = () => {
    switch (profile) {
      case "IMPULSIVO_CONSAPEVOLE":
        return (
          <DecisionPause
            goalTitle={props.goalTitle}
            goalCurrentAmount={props.goalCurrentAmount}
            goalTargetAmount={props.goalTargetAmount}
            monthlySavingRate={props.monthlySavingRate}
            accentColor={props.accentColor}
            onPutAway={handlePutAway}
            onProceed={handleProceed}
          />
        );
      case "EVITANTE":
        return (
          <DailyCheckin
            netFlow30d={props.netFlow30d}
            accentColor={props.accentColor}
          />
        );
      case "RIMANDATORE_STRATEGICO":
        return (
          <NextSmallStep
            goalTitle={props.goalTitle}
            goalCurrentAmount={props.goalCurrentAmount}
            goalTargetAmount={props.goalTargetAmount}
            accentColor={props.accentColor}
            recentTxCount={props.recentTxCount}
          />
        );
      case "CONTROLLORE_FRAGILE":
        return (
          <AutoPilotStatus
            totalIncome30d={props.totalIncome30d}
            totalExpense30d={props.totalExpense30d}
            netFlow30d={props.netFlow30d}
            recurringIncomeCount={props.recurringIncomeCount}
            recurringExpenseCount={props.recurringExpenseCount}
            goalCurrentAmount={props.goalCurrentAmount}
            goalTargetAmount={props.goalTargetAmount}
            monthlySavingRate={props.monthlySavingRate}
            accentColor={props.accentColor}
          />
        );
      default:
        return (
          <DecisionPause
            goalTitle={props.goalTitle}
            goalCurrentAmount={props.goalCurrentAmount}
            goalTargetAmount={props.goalTargetAmount}
            monthlySavingRate={props.monthlySavingRate}
            accentColor={props.accentColor}
            onPutAway={handlePutAway}
            onProceed={handleProceed}
          />
        );
    }
  };

  const showAlerts = profile !== "EVITANTE";

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dWithoutTime = new Date(d);
    dWithoutTime.setHours(0, 0, 0, 0);
    const diff = (today.getTime() - dWithoutTime.getTime()) / 86400000;
    if (diff === 0) return "Oggi";
    if (diff === 1) return "Ieri";
    if (diff < 7) return `${diff}g fa`;
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  };

  // Format saldo con decimali piccoli
  const formatBalance = (n: number) => {
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    const integer = Math.floor(abs).toLocaleString("it-IT");
    const decimals = (abs % 1).toFixed(2).slice(1); // ".50"
    return { sign, integer, decimals };
  };

  const bal = formatBalance(props.availableBalance);

  return (
    <main className="px-5 py-5 min-h-dvh space-y-4">
      {/* === Header === */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-[38px] w-[38px] rounded-full flex items-center justify-center text-claria-cream text-sm font-medium"
            style={{
              background: "linear-gradient(135deg, #1E15C2 0%, #2A20D9 100%)",
              boxShadow: "0 4px 12px rgba(30,21,194,0.2)",
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-claria-ink/50">
              {props.profileLabel}
            </p>
            <p className="text-[15px] font-medium text-claria-ink tracking-[-0.01em]">
              Ciao {props.userName ?? ""} <span className="ml-0.5">👋</span>
            </p>
          </div>
        </div>
      </header>

      {/* === Card Saldo Premium === */}
      <section
        className="relative rounded-3xl p-5 text-claria-cream overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1E15C2 0%, #2A20D9 60%, #3B30E8 100%)",
          boxShadow: "0 10px 30px rgba(30,21,194,0.25)",
        }}
      >
        {/* Glow decorativi */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-claria-cream/65">
              Saldo disponibile
            </p>
            <button
              type="button"
              onClick={() => setBalanceHidden(!balanceHidden)}
              className="text-[11px] text-claria-cream/65 active:scale-95"
            >
              {balanceHidden ? "👁 mostra" : "👁 nascondi"}
            </button>
          </div>

          {/* Importo enorme con decimali ridotti */}
          <p className="mt-2 text-[42px] font-medium tracking-[-0.035em] leading-none tabular-nums">
            {balanceHidden ? (
              "•••"
            ) : (
              <>
                {bal.sign}
                {bal.integer}
                <span className="text-[22px] text-claria-cream/50 tracking-[-0.02em]">
                  {bal.decimals}€
                </span>
              </>
            )}
          </p>

          {/* Sub info con dot colorati */}
          <div className="mt-3 flex gap-3.5 text-[11px] text-claria-cream/75">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#6BFFB0" }}
              />
              <span>
                Su goal{" "}
                <span className="font-medium text-claria-cream tabular-nums">
                  {balanceHidden ? "•••" : `${props.totalSavedInGoals.toFixed(0)}€`}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#FFD37A" }}
              />
              <span>
                30g{" "}
                <span className="font-medium text-claria-cream tabular-nums">
                  {balanceHidden
                    ? "•••"
                    : `${props.netFlow30d >= 0 ? "+" : ""}${props.netFlow30d.toFixed(0)}€`}
                </span>
              </span>
            </div>
          </div>

          {/* Quick actions glassmorphism */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/transactions/new?type=income"
              className="rounded-2xl py-2.5 flex items-center justify-center gap-2 text-[12px] font-medium text-claria-cream active:scale-[0.98] transition-transform"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-[12px]"
                style={{ backgroundColor: "rgba(107,255,176,0.3)", color: "#6BFFB0" }}
              >
                +
              </span>
              Entrata
            </Link>
            <Link
              href="/transactions/new?type=expense"
              className="rounded-2xl py-2.5 flex items-center justify-center gap-2 text-[12px] font-medium text-claria-cream active:scale-[0.98] transition-transform"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-[13px]"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                −
              </span>
              Uscita
            </Link>
          </div>
        </div>
      </section>

      {showAlerts && props.alert && (
        <BiasAlertBanner
          alertId={props.alert.id}
          message={props.alert.message}
          accentColor={props.accentColor}
          onDismiss={handleDismissAlert}
        />
      )}

      {/* Widget signature per profilo */}
      {showSignatureWidget()}

      {/* Ultime transazioni con gradient pastel per categoria */}
      {props.recentTransactions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-claria-ink/55">
              Ultime transazioni
            </p>
            <Link
              href="/dashboard"
              className="text-[11px] font-medium text-claria-ink/55 underline underline-offset-2"
            >
              Vedi tutte
            </Link>
          </div>
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(30,21,194,0.04)" }}
          >
            {props.recentTransactions.map((tx, i) => {
              const isIncome = tx.type === "INCOME";
              const style = isIncome ? INCOME_STYLE : (CATEGORY_STYLE[tx.category] ?? CATEGORY_STYLE.OTHER);

              return (
                <div
                  key={i}
                  className={`px-4 py-3 flex items-center gap-3 ${
                    i > 0 ? "border-t border-claria-ink/[0.06]" : ""
                  }`}
                >
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-[17px] shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                    }}
                  >
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-claria-ink truncate tracking-[-0.01em]">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10.5px] text-claria-ink/55">
                        {fmtDate(tx.date)}
                      </span>
                      {tx.isImpulsive && (
                        <span
                          className="text-[9.5px] font-medium px-1.5 py-0.5 rounded"
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
        </section>
      )}

      {/* Goal principale */}
      {props.primaryGoalId && (
        <GoalProgress
          goalId={props.primaryGoalId}
          title={props.goalTitle}
          icon={props.goalIcon}
          currentAmount={props.goalCurrentAmount}
          targetAmount={props.goalTargetAmount}
          milestones={props.milestones}
          impulsiveTotal30d={props.impulsiveTotal30d}
          availableBalance={props.availableBalance}
          monthlySavingRate={props.monthlySavingRate}
          deadline={props.goalDeadline ? new Date(props.goalDeadline) : null}
          accentColor={props.accentColor}
        />
      )}

      {/* Obiettivi secondari */}
      {props.secondaryGoals.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-claria-ink/55 mb-2 px-1">
            Altri obiettivi
          </p>
          <div className="flex flex-col gap-2">
            {props.secondaryGoals.map((g) => {
              const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3"
                  style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${props.accentColor}20` }}
                  >
                    {g.icon ?? "⭐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-claria-ink truncate tracking-[-0.01em]">
                      {g.title}
                    </p>
                    <div className="mt-1.5 h-1.5 bg-claria-ink/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${props.accentColor} 0%, ${props.accentColor}dd 100%)`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium text-claria-ink tabular-nums">
                      {g.currentAmount.toFixed(0)}€
                    </p>
                    <p className="text-[10px] text-claria-ink/50 tabular-nums">
                      /{g.targetAmount.toFixed(0)}€
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Nuovo obiettivo */}
      <Link
        href="/goals/new"
        className="block bg-claria-ink/[0.03] border-[1.5px] border-dashed border-claria-ink/15 rounded-2xl p-4 text-center text-[12.5px] font-medium text-claria-ink/60 active:scale-[0.99] transition-transform"
      >
        + Nuovo obiettivo
      </Link>

      {/* Footer */}
      <div className="pt-3 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-claria-ink/40 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-soft-pulse" />
          Claria · Beta
        </span>
        <ResetButton />
      </div>
    </main>
  );
}
