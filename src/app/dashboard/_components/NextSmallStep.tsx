"use client";

import { useState } from "react";
import Link from "next/link";

interface NextSmallStepProps {
  goalTitle: string;
  goalCurrentAmount: number;
  goalTargetAmount: number;
  accentColor: string;
  /** Quante transazioni ha inserito l'utente negli ultimi 7 giorni */
  recentTxCount: number;
}

/**
 * Next Small Step — widget signature per RIMANDATORE STRATEGICO
 *
 * Filosofia: il Rimandatore sa cosa fare ma rimanda. Quindi:
 *  - UN solo task settimanale (mai più di 1!)
 *  - Task piccolissimo, max 60 secondi
 *  - Tasto enorme "Fatto" per dare la dopamina immediata
 *  - "Rimanda" è permesso senza colpa ma fa apparire un nudge gentile
 *  - Niente liste, niente ramificazioni
 */

interface MicroTask {
  title: string;
  description: string;
  cta: string;
  href: string;
  isQuickWin: boolean;
}

function getMicroTask(
  goalCurrent: number,
  goalTarget: number,
  recentTxCount: number
): MicroTask {
  const remaining = Math.max(0, goalTarget - goalCurrent);
  const pct = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;

  // Stato 1: ancora 0% sul goal → far partire con €5
  if (goalCurrent === 0) {
    return {
      title: "Sposta 5€ verso il tuo obiettivo",
      description: "Solo 5€. Davvero. È il primo passo che cambia tutto.",
      cta: "Fatto, 5€ via",
      href: "/dashboard",
      isQuickWin: true,
    };
  }

  // Stato 2: poche transazioni recenti → registrane 1
  if (recentTxCount < 3) {
    return {
      title: "Registra UNA spesa di oggi",
      description: "Anche solo il caffè. 30 secondi.",
      cta: "Apri inserimento",
      href: "/transactions/new?type=expense",
      isQuickWin: true,
    };
  }

  // Stato 3: progresso medio → propone milestone realistica
  if (pct < 80) {
    const microAmount = Math.min(20, Math.round(remaining / 20));
    return {
      title: `Aggiungi ${microAmount}€ al tuo obiettivo`,
      description: `Sei al ${pct.toFixed(0)}%. Questo è il prossimo step più piccolo possibile.`,
      cta: `Sposta ${microAmount}€`,
      href: "/dashboard",
      isQuickWin: false,
    };
  }

  // Stato 4: quasi al goal
  return {
    title: "Sei vicino al tuo obiettivo!",
    description: `Mancano solo ${remaining.toFixed(0)}€. Vuoi chiuderlo questa settimana?`,
    cta: "Vai al traguardo",
    href: "/dashboard",
    isQuickWin: false,
  };
}

export function NextSmallStep({
  goalTitle,
  goalCurrentAmount,
  goalTargetAmount,
  accentColor,
  recentTxCount,
}: NextSmallStepProps) {
  const [postponed, setPostponed] = useState(false);
  const task = getMicroTask(goalCurrentAmount, goalTargetAmount, recentTxCount);

  return (
    <div className="rounded-3xl p-5 shadow-md text-white relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}
    >
      <div
        className="absolute -top-8 -right-8 h-32 w-32 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
      />

      <div className="relative">
        <div className="inline-block bg-white/20 px-2.5 py-1 rounded-full mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
            Il passo di questa settimana
          </span>
        </div>

        <h3 className="text-[19px] font-medium leading-[1.2] tracking-[-0.01em]">
          {task.title}
        </h3>
        <p className="mt-2 text-[12.5px] text-white/85 leading-relaxed">
          {task.description}
        </p>

        {task.isQuickWin && (
          <p className="mt-2 inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full text-[10px] font-semibold">
            ⚡ Quick win
          </p>
        )}

        {!postponed ? (
          <div className="mt-4 space-y-2">
            <Link
              href={task.href}
              className="block bg-white rounded-2xl py-3 px-4 text-center font-medium text-[14px] active:scale-[0.98]"
              style={{ color: accentColor }}
            >
              {task.cta}
            </Link>
            <button
              type="button"
              onClick={() => setPostponed(true)}
              className="block w-full py-2 text-center text-[11px] font-medium text-white/70"
            >
              Per ora rimando
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3">
            <p className="text-[13px] font-medium">Ok, ci pensiamo dopo.</p>
            <p className="mt-1 text-[11px] text-white/75 leading-relaxed">
              Niente sensi di colpa. Il fatto che tu sia qui è già un passo.
            </p>
            <button
              type="button"
              onClick={() => setPostponed(false)}
              className="mt-2 text-[11px] font-medium text-white/90 underline underline-offset-2"
            >
              In realtà, riprovo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
