"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  totalIncome30d: number;
  totalExpense30d: number;
  netFlow30d: number;
  impulsiveCount30d: number;
  impulsiveTotal30d: number;
  accentColor: string;
}

/**
 * BalanceCard — adattata per IMPULSIVO_CONSAPEVOLE.
 *
 * Decisioni di design importanti (rispetto alle linee guida del toneEngine):
 * - Niente numeri rossi prominenti
 * - "Spese impulsive" formulate come "decisioni veloci" — più neutro
 * - Toggle per nascondere/mostrare numeri (ostrich-friendly anche per impulsivi
 *   che hanno una giornata difficile)
 * - Il netto NON è il focus, il focus è "cosa abbiamo imparato"
 */
export function BalanceCard({
  totalIncome30d,
  totalExpense30d,
  netFlow30d,
  impulsiveCount30d,
  impulsiveTotal30d,
  accentColor,
}: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  const fmt = (n: number) => `${n.toFixed(0)}€`;

  return (
    <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-claria-ink/60">
          Ultimi 30 giorni
        </h3>
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="text-xs text-claria-ink/50 hover:text-claria-ink/80 px-2 py-1 rounded-lg"
          aria-label={visible ? "Nascondi importi" : "Mostra importi"}
        >
          {visible ? "👁 nascondi" : "👁 mostra"}
        </button>
      </div>

      {/* Numeri principali */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-claria-ink/60 font-medium">Entrate</p>
          <p className="mt-1 text-2xl font-bold text-claria-ink">
            {visible ? fmt(totalIncome30d) : "•••"}
          </p>
        </div>
        <div>
          <p className="text-xs text-claria-ink/60 font-medium">Uscite</p>
          <p className="mt-1 text-2xl font-bold text-claria-ink">
            {visible ? fmt(totalExpense30d) : "•••"}
          </p>
        </div>
      </div>

      {/* Netto — formulato in tono neutro, niente colori allarmanti */}
      <div className="mt-4 pt-4 border-t border-claria-ink/10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-claria-ink/70 font-medium">
            {netFlow30d >= 0 ? "Hai messo via" : "Hai usato più di quanto è entrato"}
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: netFlow30d >= 0 ? accentColor : "var(--claria-ink)" }}
          >
            {visible ? fmt(Math.abs(netFlow30d)) : "•••"}
          </p>
        </div>
      </div>

      {/* Decisioni veloci — solo se ce ne sono */}
      {impulsiveCount30d > 0 && (
        <div
          className={cn(
            "mt-4 pt-4 border-t border-claria-ink/10",
            "flex items-start gap-3"
          )}
        >
          <div
            className="mt-1 h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <div className="flex-1">
            <p className="text-sm text-claria-ink/80 leading-relaxed">
              <span className="font-semibold">
                {impulsiveCount30d}{" "}
                {impulsiveCount30d === 1 ? "decisione veloce" : "decisioni veloci"}
              </span>{" "}
              che hai riconosciuto, per un totale di{" "}
              {visible ? fmt(impulsiveTotal30d) : "•••"}.
            </p>
            <p className="mt-1 text-xs text-claria-ink/60">
              Riconoscerle è già metà del lavoro.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
