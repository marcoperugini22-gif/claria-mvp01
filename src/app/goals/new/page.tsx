"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

const GOAL_TEMPLATES = [
  { category: "TRAVEL", icon: "✈️", title: "Viaggio", suggestedAmount: 1000 },
  { category: "EMERGENCY_FUND", icon: "🛟", title: "Fondo emergenza", suggestedAmount: 2000 },
  { category: "HOME", icon: "🏠", title: "Casa nuova", suggestedAmount: 5000 },
  { category: "TECH", icon: "💻", title: "Nuovo telefono/PC", suggestedAmount: 1200 },
  { category: "EDUCATION", icon: "🎓", title: "Corso/Master", suggestedAmount: 1500 },
  { category: "EXPERIENCE", icon: "🎉", title: "Esperienza", suggestedAmount: 500 },
  { category: "GIFT", icon: "🎁", title: "Regalo", suggestedAmount: 200 },
  { category: "CUSTOM", icon: "⭐", title: "Altro", suggestedAmount: 500 },
] as const;

function monthsUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return Math.ceil(diff / (30 * 24 * 60 * 60 * 1000));
}

export default function NewGoalPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [category, setCategory] = useState<typeof GOAL_TEMPLATES[number]["category"]>("CUSTOM");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(targetAmount.replace(",", "."));
  const amountValid = !isNaN(amountNum) && amountNum > 0;
  const canSubmit = title.trim().length > 0 && amountValid;

  const months = deadline ? monthsUntil(deadline) : null;
  const suggestedMonthly =
    months && amountValid ? Math.ceil(amountNum / months) : null;

  function selectTemplate(idx: number) {
    const t = GOAL_TEMPLATES[idx];
    setSelectedTemplate(idx);
    setTitle(t.title);
    setIcon(t.icon);
    setCategory(t.category);
    if (!targetAmount) setTargetAmount(t.suggestedAmount.toString());
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          icon,
          category,
          targetAmount: amountNum,
          deadline: deadline || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Qualcosa è andato storto, riprova");
      setSubmitting(false);
    }
  }

  // Min date: tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  return (
    <main className="min-h-dvh pb-nav">
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="h-9 w-9 rounded-xl bg-claria-ink/[0.08] flex items-center justify-center text-claria-ink text-lg active:scale-95"
        >
          ←
        </Link>
        <h1 className="text-[15px] font-medium text-claria-ink">Nuovo obiettivo</h1>
        <div className="w-9" />
      </header>

      <section className="px-5 pt-4 pb-4">
        <h2 className="text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-claria-ink">
          Cosa stai{" "}
          <span className="font-serif italic font-normal">sognando?</span>
        </h2>
        <p className="mt-2 text-[13px] text-claria-ink/65 leading-[1.5]">
          Scegli un punto di partenza o crea il tuo da zero.
        </p>
      </section>

      {/* Template grid */}
      <section className="px-5 pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-claria-ink/50 mb-2.5">
          Idee veloci
        </p>
        <div className="grid grid-cols-4 gap-2">
          {GOAL_TEMPLATES.map((t, i) => {
            const isSelected = selectedTemplate === i;
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => selectTemplate(i)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  isSelected
                    ? "bg-claria-ink text-claria-cream shadow-lg"
                    : "bg-white border border-claria-ink/10 text-claria-ink"
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-[10px] font-medium text-center leading-tight px-1">
                  {t.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Title input */}
      <section className="px-5 pb-3">
        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}>
          <button
            type="button"
            onClick={() => {
              const emojis = ["✈️", "🏠", "💻", "🎓", "🎉", "🎁", "⭐", "🚗", "📱", "💍"];
              setIcon(emojis[(emojis.indexOf(icon) + 1) % emojis.length]);
            }}
            className="h-10 w-10 rounded-xl bg-claria-ink/[0.06] flex items-center justify-center text-xl active:scale-95"
          >
            {icon}
          </button>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.08em] font-medium text-claria-ink/50">
              Nome obiettivo
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSelectedTemplate(null); }}
              placeholder="Es. Viaggio a Tokyo"
              className="bg-transparent w-full text-[14px] text-claria-ink font-medium focus:outline-none placeholder-claria-ink/30"
            />
          </div>
        </div>
      </section>

      {/* Amount input */}
      <section className="px-5 pt-3 pb-4 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-claria-ink/50 mb-2">
          Quanto vuoi mettere via?
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            placeholder="0"
            className="bg-transparent text-[48px] font-medium text-claria-ink tracking-[-0.04em] leading-none w-[180px] text-right focus:outline-none placeholder-claria-ink/20"
          />
          <span className="text-xl text-claria-ink/40">€</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {[100, 500, 1000, 2000, 5000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setTargetAmount(amt.toString())}
              className="px-3 py-1.5 rounded-full bg-claria-ink/[0.06] text-[11px] font-medium text-claria-ink/70 active:scale-95"
            >
              {amt}€
            </button>
          ))}
        </div>
      </section>

      {/* Deadline */}
      <section className="px-5 pb-4">
        <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}>
          <p className="text-[10px] uppercase tracking-[0.08em] font-medium text-claria-ink/50 mb-1.5">
            📅 Entro quando? (opzionale)
          </p>
          <input
            type="date"
            value={deadline}
            min={minDateStr}
            onChange={(e) => setDeadline(e.target.value)}
            className="bg-transparent w-full text-[14px] text-claria-ink font-medium focus:outline-none"
          />
          {suggestedMonthly && (
            <p className="mt-2 text-[12px] text-claria-ink/65 leading-relaxed">
              Per arrivarci in tempo:{" "}
              <span className="font-semibold text-claria-ink">~{suggestedMonthly}€/mese</span>
            </p>
          )}
          {deadline && !months && (
            <p className="mt-2 text-[11px] text-amber-600">La data è già passata.</p>
          )}
        </div>
      </section>

      {error && <p className="px-5 pb-3 text-xs text-red-600">{error}</p>}

      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full bg-claria-ink text-claria-cream py-4 rounded-2xl text-[14px] font-medium shadow-lg disabled:opacity-40 active:scale-[0.98] flex items-center justify-between px-5"
        >
          <span>
            {submitting ? "Creo l'obiettivo…" : canSubmit ? `Crea "${title}"` : "Completa per continuare"}
          </span>
          {canSubmit && !submitting && (
            <span className="h-7 w-7 bg-claria-cream text-claria-ink rounded-full flex items-center justify-center text-sm">
              →
            </span>
          )}
        </button>
      </div>
      <BottomNav />
    </main>
  );
}
