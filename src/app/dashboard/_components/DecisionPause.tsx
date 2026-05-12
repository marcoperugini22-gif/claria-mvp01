"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DecisionPauseProps {
  goalTitle: string;
  goalCurrentAmount: number;
  goalTargetAmount: number;
  monthlySavingRate: number;
  accentColor: string;
  /** Callback chiamato quando l'utente decide di "rimettere via" l'importo */
  onPutAway: (amount: number) => Promise<void> | void;
  /** Callback chiamato quando l'utente sceglie comunque di procedere */
  onProceed: (amount: number) => Promise<void> | void;
}

type Phase = "idle" | "input" | "pause" | "decision" | "done_saved" | "done_spent";

const PAUSE_SECONDS = 60;

/**
 * DecisionPause — il widget signature dell'esperienza Impulsivo Consapevole.
 *
 * Flow:
 *  1. idle      → CTA "Sto pensando a una spesa"
 *  2. input     → form: importo + cos'è
 *  3. pause     → timer 60s + framing del costo opportunità
 *                 (l'utente può forzare lo skip ma il bottone "skip" è meno
 *                  enfatico del primary)
 *  4. decision  → "Vai con la spesa" vs "Rimetto via questi soldi"
 *  5. done_*    → conferma + reset dopo qualche secondo
 *
 * NB: il timer non è gating duro. L'utente può sempre saltare. Lo scopo è
 * creare frizione gentile (Thaler "nudge"), non bloccare l'autonomia.
 */
export function DecisionPause({
  goalTitle,
  goalCurrentAmount,
  goalTargetAmount,
  monthlySavingRate,
  accentColor,
  onPutAway,
  onProceed,
}: DecisionPauseProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [amountStr, setAmountStr] = useState("");
  const [what, setWhat] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(PAUSE_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amount = parseFloat(amountStr.replace(",", "."));
  const amountValid = !isNaN(amount) && amount > 0;

  const remainingToGoal = Math.max(0, goalTargetAmount - goalCurrentAmount);
  const pctOfGoal = remainingToGoal > 0 && amountValid ? (amount / remainingToGoal) * 100 : 0;
  const daysOfProgress = monthlySavingRate > 0 && amountValid
    ? Math.round((amount / monthlySavingRate) * 30)
    : null;

  // Framing: la frase chiave del widget (mostrata in pause + decision)
  const framing = (() => {
    if (!amountValid) return "";
    if (pctOfGoal >= 30) return `Sono già un terzo di quello che ti manca per ${goalTitle}.`;
    if (pctOfGoal >= 15) return `Ti porterebbero il ${Math.round(pctOfGoal)}% più vicino a ${goalTitle}.`;
    if (daysOfProgress && daysOfProgress >= 7) return `Sono circa ${daysOfProgress} giorni di avvicinamento al tuo obiettivo.`;
    if (daysOfProgress && daysOfProgress >= 2) return `Sono qualche giorno di avvicinamento al tuo obiettivo.`;
    return "Anche piccolo conta. È un passo.";
  })();

  // Gestione timer
  useEffect(() => {
    if (phase === "pause") {
      setSecondsLeft(PAUSE_SECONDS);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPhase("decision");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [phase]);

  function reset() {
    setPhase("idle");
    setAmountStr("");
    setWhat("");
    setSecondsLeft(PAUSE_SECONDS);
    setSubmitting(false);
  }

  async function handlePutAway() {
    setSubmitting(true);
    try {
      await onPutAway(amount);
      setPhase("done_saved");
      setTimeout(reset, 3500);
    } catch {
      setSubmitting(false);
    }
  }

  async function handleProceed() {
    setSubmitting(true);
    try {
      await onProceed(amount);
      setPhase("done_spent");
      setTimeout(reset, 3500);
    } catch {
      setSubmitting(false);
    }
  }

  // ----------------- Render per fase -----------------

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={() => setPhase("input")}
        className="block w-full rounded-3xl border-2 border-dashed border-claria-ink/20 px-5 py-6 text-left transition-all active:scale-[0.99] hover:border-claria-ink/40"
        style={{ borderColor: `${accentColor}40` }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-claria-ink/60">
          Pausa decisionale
        </p>
        <p className="mt-2 text-lg font-bold text-claria-ink leading-tight">
          Sto pensando a una spesa
        </p>
        <p className="mt-1 text-sm text-claria-ink/60">
          Prendiamoci un attimo insieme prima di decidere.
        </p>
      </button>
    );
  }

  if (phase === "input") {
    return (
      <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-claria-ink/60">
            Pausa decisionale
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-claria-ink/40 hover:text-claria-ink/70"
          >
            chiudi
          </button>
        </div>

        <p className="mt-3 text-base font-medium text-claria-ink leading-snug">
          Quanto stai pensando di spendere?
        </p>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.,]/g, ""))}
            placeholder="0"
            className="flex-1 rounded-2xl border-2 border-claria-ink/15 bg-claria-cream px-4 py-3 text-2xl font-bold text-claria-ink focus:border-claria-ink focus:outline-none"
            autoFocus
          />
          <span className="text-2xl font-bold text-claria-ink/40">€</span>
        </div>

        <input
          type="text"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="Per cosa? (opzionale)"
          className="mt-3 w-full rounded-2xl border-2 border-claria-ink/15 bg-claria-cream px-4 py-3 text-sm text-claria-ink focus:border-claria-ink focus:outline-none"
        />

        <button
          type="button"
          onClick={() => setPhase("pause")}
          disabled={!amountValid}
          className="mt-4 w-full rounded-2xl py-3 text-center font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ backgroundColor: accentColor, color: "#FFF7CE" }}
        >
          Iniziamo la pausa
        </button>
      </div>
    );
  }

  if (phase === "pause") {
    const progress = ((PAUSE_SECONDS - secondsLeft) / PAUSE_SECONDS) * 100;
    return (
      <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-wider text-claria-ink/60">
          Pausa in corso
        </p>

        {/* Timer circle */}
        <div className="my-6 flex items-center justify-center">
          <div className="relative h-32 w-32">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(30, 21, 194, 0.1)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={accentColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-claria-ink">{secondsLeft}</span>
            </div>
          </div>
        </div>

        {/* Framing del costo opportunità */}
        <div className="rounded-2xl bg-claria-cream px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-claria-ink/50">
            {amount.toFixed(0)}€{what ? ` · ${what}` : ""}
          </p>
          <p className="mt-2 text-base font-medium text-claria-ink leading-snug">
            {framing}
          </p>
        </div>

        {/* Skip — meno enfatico del primary */}
        <button
          type="button"
          onClick={() => setPhase("decision")}
          className="mt-4 w-full text-center text-sm text-claria-ink/50 hover:text-claria-ink/80 py-2"
        >
          Salta la pausa
        </button>
      </div>
    );
  }

  if (phase === "decision") {
    return (
      <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5 animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-wider text-claria-ink/60">
          Cosa fai?
        </p>

        <p className="mt-3 text-lg font-bold text-claria-ink leading-snug">
          Decidi tu, senza giudizio.
        </p>

        <p className="mt-2 text-sm text-claria-ink/70 leading-relaxed">
          {framing}
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handlePutAway}
            disabled={submitting}
            className="block w-full rounded-2xl py-3.5 text-center font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: accentColor, color: "#FFF7CE" }}
          >
            Rimetto via questi {amount.toFixed(0)}€
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={submitting}
            className="block w-full rounded-2xl border-2 border-claria-ink/20 py-3.5 text-center font-medium text-claria-ink/80 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Vado avanti con la spesa
          </button>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-3 w-full text-center text-xs text-claria-ink/40 hover:text-claria-ink/60 py-1"
        >
          ci penso ancora
        </button>
      </div>
    );
  }

  if (phase === "done_saved") {
    return (
      <div
        className="rounded-3xl p-5 shadow-sm animate-fade-in text-center"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <p className="text-3xl">✨</p>
        <p className="mt-2 text-lg font-bold text-claria-ink">
          Aggiunti al tuo obiettivo
        </p>
        <p className="mt-1 text-sm text-claria-ink/70">
          {amount.toFixed(0)}€ in più verso {goalTitle}.
        </p>
      </div>
    );
  }

  if (phase === "done_spent") {
    return (
      <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5 animate-fade-in text-center">
        <p className="text-lg font-bold text-claria-ink">
          Ok, registrato.
        </p>
        <p className="mt-2 text-sm text-claria-ink/70 leading-relaxed">
          La consapevolezza c'era. Non era il momento di rimandare, e va bene così.
        </p>
      </div>
    );
  }

  return null;
}
