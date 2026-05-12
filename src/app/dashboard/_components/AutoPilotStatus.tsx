"use client";

interface AutoPilotStatusProps {
  totalIncome30d: number;
  totalExpense30d: number;
  netFlow30d: number;
  recurringIncomeCount: number;
  recurringExpenseCount: number;
  goalCurrentAmount: number;
  goalTargetAmount: number;
  monthlySavingRate: number;
  accentColor: string;
}

/**
 * Auto-Pilot Status — widget signature per CONTROLLORE FRAGILE
 *
 * Filosofia: il Controllore Fragile pianifica troppo e si stressa. Il messaggio
 * di Claria è "respira, ci pensiamo noi". Quindi:
 *  - Tono serio, preciso, NESSUNA emoji se non strettamente utile
 *  - Dati esatti, mai approssimazioni
 *  - Lista delle cose AUTOMATIZZATE in primo piano ("non devi controllare X")
 *  - Calcoli proiettati: tempo al goal, % automatizzata, ecc.
 *  - Niente toggle, niente gamification, niente fronzoli
 */

export function AutoPilotStatus({
  totalIncome30d,
  totalExpense30d,
  netFlow30d,
  recurringIncomeCount,
  recurringExpenseCount,
  goalCurrentAmount,
  goalTargetAmount,
  monthlySavingRate,
  accentColor,
}: AutoPilotStatusProps) {
  const remaining = Math.max(0, goalTargetAmount - goalCurrentAmount);
  const monthsToGoal =
    monthlySavingRate > 0 ? Math.ceil(remaining / monthlySavingRate) : null;

  const autoCount = recurringIncomeCount + recurringExpenseCount;

  return (
    <div className="rounded-3xl bg-claria-cream-soft p-5 shadow-sm border border-claria-ink/10">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-claria-ink/55">
          Stato del sistema
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full inline-block"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: accentColor }}
          >
            Auto-pilot attivo
          </span>
        </div>
      </div>

      <h3 className="mt-2 text-[18px] font-medium text-claria-ink leading-tight">
        Claria sta gestendo {autoCount} {autoCount === 1 ? "voce" : "voci"} per te.
      </h3>
      <p className="mt-1 text-[12px] text-claria-ink/65 leading-relaxed">
        Non devi controllarle. Sono registrate automaticamente ogni mese.
      </p>

      {/* Griglia metriche esatte */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-claria-ink/55">
            Entrate ricorrenti
          </p>
          <p className="mt-1 text-[18px] font-medium text-claria-ink tabular-nums">
            {recurringIncomeCount}
          </p>
          <p className="text-[10px] text-claria-ink/55">attive</p>
        </div>
        <div className="rounded-2xl bg-white px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-claria-ink/55">
            Uscite ricorrenti
          </p>
          <p className="mt-1 text-[18px] font-medium text-claria-ink tabular-nums">
            {recurringExpenseCount}
          </p>
          <p className="text-[10px] text-claria-ink/55">attive</p>
        </div>
      </div>

      {/* Proiezioni precise */}
      <div className="mt-3 rounded-2xl bg-white px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-claria-ink/55 mb-2">
          Proiezione al tuo obiettivo
        </p>
        {monthsToGoal !== null ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[24px] font-medium text-claria-ink tabular-nums">
              {monthsToGoal}
            </span>
            <span className="text-[13px] text-claria-ink/65">
              {monthsToGoal === 1 ? "mese" : "mesi"}
            </span>
          </div>
        ) : (
          <p className="text-[13px] text-claria-ink/70">
            In attesa di un mese completo di dati per calcolare.
          </p>
        )}
        <p className="mt-1 text-[11px] text-claria-ink/55 leading-relaxed">
          Al ritmo di risparmio attuale di{" "}
          <span className="font-medium text-claria-ink tabular-nums">
            {monthlySavingRate.toFixed(0)}€/mese
          </span>
        </p>
      </div>

      {/* Numeri grezzi 30gg */}
      <div className="mt-3 pt-3 border-t border-claria-ink/8">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-claria-ink/55 font-semibold">
              Entrate
            </p>
            <p className="text-[14px] font-medium text-claria-ink tabular-nums mt-0.5">
              {totalIncome30d.toFixed(0)}€
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-claria-ink/55 font-semibold">
              Uscite
            </p>
            <p className="text-[14px] font-medium text-claria-ink tabular-nums mt-0.5">
              {totalExpense30d.toFixed(0)}€
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-claria-ink/55 font-semibold">
              Netto
            </p>
            <p
              className="text-[14px] font-medium tabular-nums mt-0.5"
              style={{ color: netFlow30d >= 0 ? accentColor : "var(--claria-ink)" }}
            >
              {netFlow30d >= 0 ? "+" : ""}
              {netFlow30d.toFixed(0)}€
            </p>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-claria-ink/45 text-center">
          Dati esatti ultimi 30 giorni
        </p>
      </div>
    </div>
  );
}
