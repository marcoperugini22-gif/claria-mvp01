"use client";

import { useState } from "react";

interface DailyCheckinProps {
  netFlow30d: number;
  accentColor: string;
}

/**
 * Daily Check-in — widget signature per EVITANTE
 *
 * Filosofia: l'Evitante prova ansia nel guardare i conti. Quindi il widget
 * deve essere:
 *  - Aperto in tono rassicurante ("Va tutto bene")
 *  - Mostrare UN solo numero, non un cruscotto
 *  - Includere un mini-consiglio facile da fare oggi
 *  - Niente alert, niente notifiche con numeri rossi
 *  - Possibilità di "rimandare" il check con tono leggero
 */

const DAILY_TIPS = [
  {
    title: "30 secondi di tregua",
    body: "Apri l'app, guarda solo il saldo, chiudi. Niente più. Sei riuscito/a.",
  },
  {
    title: "Una piccola domanda",
    body: "Quanto hai speso ieri in cibo? Niente conti, solo una stima a sentimento.",
  },
  {
    title: "La spesa che ti è piaciuta",
    body: "Pensa all'ultima cosa che hai comprato e ti ha reso felice. Era un buon investimento di felicità.",
  },
  {
    title: "Un'entrata che dimentichi",
    body: "Hai entrate piccole che dimentichi? Un rimborso, un regalo? Provale a registrare oggi.",
  },
  {
    title: "Solo 1 minuto",
    body: "Apri Claria solo per registrare 1 transazione di oggi. Se non te la senti, va bene così.",
  },
];

export function DailyCheckin({ netFlow30d, accentColor }: DailyCheckinProps) {
  // Tip "stabile" basato sul giorno dell'anno (così non cambia ad ogni refresh)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  const [done, setDone] = useState(false);

  const isPositive = netFlow30d >= 0;

  return (
    <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5">
      {/* Saluto rassicurante */}
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: `${accentColor}25` }}
        >
          ☀️
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-claria-ink/55">
            Check-in di oggi
          </p>
          <p className="mt-1 text-[15px] font-medium text-claria-ink leading-tight">
            {isPositive ? "Va tutto bene." : "Ci sei, e questo conta."}
          </p>
          <p className="mt-1 text-[12px] text-claria-ink/60 leading-relaxed">
            Nessun numero rosso, nessuna ansia. Solo un piccolo passo se ti va.
          </p>
        </div>
      </div>

      {/* Mini consiglio del giorno */}
      <div
        className="mt-4 rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-claria-ink/60">
          ✨ Suggerimento di oggi
        </p>
        <p className="mt-1.5 text-[14px] font-medium text-claria-ink">
          {tip.title}
        </p>
        <p className="mt-1 text-[12px] text-claria-ink/70 leading-relaxed">
          {tip.body}
        </p>

        <div className="mt-3 flex gap-2">
          {!done ? (
            <>
              <button
                type="button"
                onClick={() => setDone(true)}
                className="flex-1 rounded-xl py-2 text-[12px] font-medium text-white active:scale-[0.98]"
                style={{ backgroundColor: accentColor }}
              >
                Fatto ✓
              </button>
              <button
                type="button"
                className="px-3 rounded-xl bg-claria-ink/[0.06] text-[12px] font-medium text-claria-ink/60 active:scale-[0.98]"
              >
                Domani
              </button>
            </>
          ) : (
            <p className="text-[12px] font-medium text-claria-ink/80 py-2 text-center w-full">
              Bravo/a 🌱 ci vediamo domani
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
