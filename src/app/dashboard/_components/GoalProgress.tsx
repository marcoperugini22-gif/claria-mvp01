"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Milestone {
  label: string;
  threshold: number;
  reached: boolean;
}

interface GoalProgressProps {
  goalId: string;
  title: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number;
  milestones: Milestone[];
  impulsiveTotal30d: number;
  availableBalance: number;
  monthlySavingRate: number;
  deadline: Date | null;
  accentColor: string;
}

export function GoalProgress({
  goalId,
  title,
  icon,
  currentAmount,
  targetAmount,
  milestones,
  impulsiveTotal30d,
  availableBalance,
  monthlySavingRate,
  deadline,
  accentColor,
}: GoalProgressProps) {
  const router = useRouter();
  const [moving, setMoving] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pct = Math.min(100, (currentAmount / targetAmount) * 100);
  const remaining = Math.max(0, targetAmount - currentAmount);

  // Piano risparmio: mesi per arrivare al goal al ritmo attuale
  const monthsToGoal =
    monthlySavingRate > 0 ? Math.ceil(remaining / monthlySavingRate) : null;

  // Data previsione raggiungimento
  const predictedDate: Date | null =
    monthsToGoal != null
      ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000)
      : null;

  // Suggerimento mensile in base a deadline
  let suggestedMonthly: number | null = null;
  let monthsLeft: number | null = null;
  if (deadline) {
    const now = new Date();
    monthsLeft = Math.max(
      1,
      Math.ceil(
        (deadline.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000)
      )
    );
    suggestedMonthly = remaining / monthsLeft;
  }

  // Status predittivo
  type GoalStatus = "on-track" | "at-risk" | "off-target" | null;
  let goalStatus: GoalStatus = null;
  if (deadline && remaining > 0) {
    if (monthlySavingRate <= 0) {
      goalStatus = "off-target";
    } else if (monthsLeft != null && monthsToGoal != null) {
      const ratio = monthsToGoal / monthsLeft;
      if (ratio <= 1.05) goalStatus = "on-track";
      else if (ratio <= 1.4) goalStatus = "at-risk";
      else goalStatus = "off-target";
    }
  } else if (!deadline && remaining > 0 && monthlySavingRate > 0) {
    goalStatus = "on-track";
  }

  const STATUS_CONFIG = {
    "on-track": { label: "In linea ✓", bg: "#DCFCE7", color: "#15803D" },
    "at-risk":  { label: "A rischio ⚠", bg: "#FEF9C3", color: "#B45309" },
    "off-target": { label: "Fuori target !", bg: "#FEE2E2", color: "#DC2626" },
  };

  const whatIfFraming =
    impulsiveTotal30d > 0
      ? impulsiveTotal30d >= remaining
        ? `Se le decisioni veloci di questo mese fossero finite qui, saresti già al traguardo.`
        : `Se le decisioni veloci di questo mese fossero finite qui, saresti al ${Math.min(
            100,
            ((currentAmount + impulsiveTotal30d) / targetAmount) * 100
          ).toFixed(0)}%.`
      : null;

  const amountNum = parseFloat(amount.replace(",", "."));
  const amountValid = !isNaN(amountNum) && amountNum > 0;

  async function handleMove() {
    if (!amountValid || !moving) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/goals/${goalId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, direction: moving }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore");
        setSubmitting(false);
        return;
      }
      setAmount("");
      setMoving(null);
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Errore di rete");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-claria-ink/55">
              Il tuo obiettivo · {pct.toFixed(0)}%
            </p>
            {goalStatus && (
              <span
                className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: STATUS_CONFIG[goalStatus].bg,
                  color: STATUS_CONFIG[goalStatus].color,
                }}
              >
                {STATUS_CONFIG[goalStatus].label}
              </span>
            )}
          </div>
          <h3 className="mt-0.5 text-[17px] font-medium text-claria-ink leading-tight truncate">
            {title}
          </h3>
        </div>
      </div>

      {/* Importo */}
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[28px] font-medium text-claria-ink tabular-nums tracking-[-0.02em]">
          {currentAmount.toFixed(0)}€
        </p>
        <p className="text-[13px] text-claria-ink/55">
          / {targetAmount.toFixed(0)}€
        </p>
      </div>

      {/* Progress bar segmentata */}
      <div className="mt-3">
        <div className="relative h-2.5 w-full rounded-full bg-claria-ink/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, backgroundColor: accentColor }}
          />
          {milestones.map((m, i) => {
            const pos = (m.threshold / targetAmount) * 100;
            if (pos >= 100) return null;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-claria-cream-soft"
                style={{ left: `${pos}%` }}
              />
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {milestones.map((m, i) => (
            <span
              key={i}
              className={cn(
                "text-[10.5px] px-2.5 py-1 rounded-full font-medium"
              )}
              style={
                m.reached
                  ? { backgroundColor: accentColor, color: "#FFF7CE" }
                  : { backgroundColor: "rgba(30,21,194,0.05)", color: "rgba(30,21,194,0.5)" }
              }
            >
              {m.reached ? "✓ " : ""}
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Piano risparmio mensile */}
      {remaining > 0 && (suggestedMonthly !== null || monthsToGoal !== null) && (
        <div
          className="mt-4 rounded-2xl px-4 py-3"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-claria-ink/60 mb-1">
            📅 Piano risparmio
          </p>
          {suggestedMonthly !== null ? (
            <>
              <p className="text-[13px] text-claria-ink/85 leading-relaxed">
                Per arrivarci alla scadenza, metti via{" "}
                <span className="font-semibold tabular-nums">
                  {suggestedMonthly.toFixed(0)}€/mese
                </span>
                .
              </p>
              {monthlySavingRate > 0 && (
                <p className="mt-1 text-[11.5px] text-claria-ink/55">
                  Ritmo attuale:{" "}
                  <span className="font-medium">{monthlySavingRate.toFixed(0)}€/mese</span>
                </p>
              )}
            </>
          ) : monthsToGoal !== null ? (
            <p className="text-[13px] text-claria-ink/85 leading-relaxed">
              Al tuo ritmo (
              <span className="font-semibold tabular-nums">
                {monthlySavingRate.toFixed(0)}€/mese
              </span>
              ) ci arrivi a{" "}
              <span className="font-semibold tabular-nums">
                {predictedDate?.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
              </span>
              .
            </p>
          ) : null}
        </div>
      )}

      {/* Slider bidirezionale */}
      <div className="mt-4">
        {!moving ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMoving("deposit");
                setError(null);
              }}
              disabled={availableBalance <= 0}
              className="rounded-2xl py-2.5 text-[12px] font-medium text-white active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-base leading-none">+</span> Aggiungi
            </button>
            <button
              type="button"
              onClick={() => {
                setMoving("withdraw");
                setError(null);
              }}
              disabled={currentAmount <= 0}
              className="rounded-2xl py-2.5 text-[12px] font-medium text-claria-ink border border-claria-ink/15 bg-white active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <span className="text-base leading-none">−</span> Preleva
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-3 border border-claria-ink/10">
            <p className="text-[11px] font-medium text-claria-ink/70 mb-2">
              {moving === "deposit"
                ? `Quanto vuoi aggiungere? (max ${availableBalance.toFixed(0)}€ disponibili)`
                : `Quanto vuoi prelevare? (max ${currentAmount.toFixed(0)}€ nel goal)`}
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                placeholder="0"
                autoFocus
                className="flex-1 rounded-xl border border-claria-ink/15 px-3 py-2 text-[15px] font-medium text-claria-ink tabular-nums focus:outline-none focus:border-claria-ink/50"
              />
              <span className="text-claria-ink/40 text-sm">€</span>
            </div>

            {/* Quick amounts */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[5, 10, 25, 50, 100].map((amt) => {
                const max =
                  moving === "deposit" ? availableBalance : currentAmount;
                if (amt > max) return null;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="px-2.5 py-1 rounded-full bg-claria-ink/[0.06] text-[11px] font-medium text-claria-ink/70 active:scale-95"
                  >
                    {amt}€
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="mt-2 text-[11px] text-red-600">{error}</p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMoving(null);
                  setAmount("");
                  setError(null);
                }}
                disabled={submitting}
                className="flex-1 rounded-xl border border-claria-ink/15 py-2 text-[12px] font-medium text-claria-ink/70 active:scale-[0.98]"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleMove}
                disabled={!amountValid || submitting}
                className="flex-[2] rounded-xl py-2 text-[12px] font-medium text-white active:scale-[0.98] disabled:opacity-40"
                style={{
                  backgroundColor: moving === "deposit" ? accentColor : "#1E15C2",
                }}
              >
                {submitting
                  ? "..."
                  : moving === "deposit"
                  ? `Aggiungi ${amountValid ? amountNum.toFixed(0) : ""}€`
                  : `Preleva ${amountValid ? amountNum.toFixed(0) : ""}€`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* What-if framing */}
      {whatIfFraming && (
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-[12px] leading-relaxed"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <p className="font-semibold mb-0.5 text-claria-ink">Una prospettiva</p>
          <p className="text-claria-ink/75">{whatIfFraming}</p>
        </div>
      )}
    </div>
  );
}
