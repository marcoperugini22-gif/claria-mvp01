"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Mode = "single" | "bulk" | "recurring";
type TxType = "INCOME" | "EXPENSE";

const INCOME_CATEGORIES = [
  { value: "OTHER", label: "Stipendio", icon: "💼" },
  { value: "OTHER", label: "Freelance", icon: "💸" },
  { value: "OTHER", label: "Regalo", icon: "🎁" },
  { value: "OTHER", label: "Rimborso", icon: "↩️" },
];

const EXPENSE_CATEGORIES = [
  { value: "FOOD", label: "Cibo", icon: "🍕" },
  { value: "TRANSPORT", label: "Trasporti", icon: "🚊" },
  { value: "ENTERTAINMENT", label: "Svago", icon: "🎬" },
  { value: "SHOPPING", label: "Shopping", icon: "🛍️" },
  { value: "BILLS", label: "Bollette", icon: "💡" },
  { value: "SUBSCRIPTIONS", label: "Abbonamenti", icon: "📺" },
  { value: "HEALTH", label: "Salute", icon: "💊" },
  { value: "EDUCATION", label: "Studio", icon: "📚" },
];

function NewTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") === "income" ? "INCOME" : "EXPENSE") as TxType;

  const [mode, setMode] = useState<Mode>("single");
  const [type, setType] = useState<TxType>(defaultType);
  const [amount, setAmount] = useState("");
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isImpulsive, setIsImpulsive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stati per bulk
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState<Array<{
    amount: number;
    type: string;
    description: string;
    category: string;
    date: string;
    confidence: number;
  }> | null>(null);

  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const currentCategory = categories[categoryIdx] ?? categories[0];

  const amountNum = parseFloat(amount.replace(",", "."));
  const amountValid = !isNaN(amountNum) && amountNum > 0;

  async function handleSubmitSingle() {
    if (!amountValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          type,
          category: currentCategory.value,
          description: note || currentCategory.label,
          isImpulsive: type === "EXPENSE" ? isImpulsive : false,
          recurring: isRecurring ? { frequency: "monthly", dayOfMonth: new Date().getDate() } : undefined,
        }),
      });
      if (!res.ok) throw new Error("Errore");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError("Qualcosa è andato storto, riprova");
      setSubmitting(false);
    }
  }

  async function handleBulkPreview() {
    if (!bulkText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulkText, commit: false }),
      });
      const data = await res.json();
      setBulkPreview(data.transactions ?? []);
    } catch {
      setError("Errore nel parsing");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkCommit() {
    if (!bulkPreview || bulkPreview.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulkText, commit: true }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Errore nel salvataggio");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh pb-nav">
      {/* Header */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="h-9 w-9 rounded-xl bg-claria-ink/[0.08] flex items-center justify-center text-claria-ink text-lg active:scale-95"
        >
          ←
        </Link>
        <h1 className="text-[15px] font-medium text-claria-ink">
          {type === "INCOME" ? "Aggiungi entrata" : "Aggiungi uscita"}
        </h1>
        <div className="w-9" />
      </header>

      {/* Tab switcher */}
      <div className="px-5 pb-2 flex gap-1.5">
        {(["single", "bulk", "recurring"] as const).map((m) => {
          const labels = { single: "Singola", bulk: "Bulk ✨", recurring: "Ricorrente" };
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-2xl text-[12px] font-medium transition-colors ${
                isActive
                  ? "bg-claria-ink text-claria-cream"
                  : "bg-claria-ink/[0.06] text-claria-ink/70"
              }`}
            >
              {labels[m]}
            </button>
          );
        })}
      </div>

      {mode === "single" && (
        <SingleMode
          type={type}
          setType={setType}
          amount={amount}
          setAmount={setAmount}
          categories={categories}
          categoryIdx={categoryIdx}
          setCategoryIdx={setCategoryIdx}
          note={note}
          setNote={setNote}
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          isImpulsive={isImpulsive}
          setIsImpulsive={setIsImpulsive}
          amountValid={amountValid}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmitSingle}
          amountNum={amountNum}
        />
      )}

      {mode === "bulk" && (
        <BulkMode
          bulkText={bulkText}
          setBulkText={setBulkText}
          bulkPreview={bulkPreview}
          setBulkPreview={setBulkPreview}
          submitting={submitting}
          error={error}
          onPreview={handleBulkPreview}
          onCommit={handleBulkCommit}
        />
      )}

      {mode === "recurring" && (
        <RecurringMode
          type={type}
          setType={setType}
          amount={amount}
          setAmount={setAmount}
          categories={categories}
          categoryIdx={categoryIdx}
          setCategoryIdx={setCategoryIdx}
          note={note}
          setNote={setNote}
          amountValid={amountValid}
          submitting={submitting}
          error={error}
          onSubmit={() => {
            setIsRecurring(true);
            handleSubmitSingle();
          }}
          amountNum={amountNum}
        />
      )}
    </main>
  );
}

interface SingleModeProps {
  type: TxType;
  setType: (t: TxType) => void;
  amount: string;
  setAmount: (a: string) => void;
  categories: Array<{ value: string; label: string; icon: string }>;
  categoryIdx: number;
  setCategoryIdx: (i: number) => void;
  note: string;
  setNote: (n: string) => void;
  isRecurring: boolean;
  setIsRecurring: (r: boolean) => void;
  isImpulsive: boolean;
  setIsImpulsive: (i: boolean) => void;
  amountValid: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  amountNum: number;
}

function SingleMode(p: SingleModeProps) {
  return (
    <>
      <div className="px-5 pt-6 pb-4 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-claria-ink/50 mb-2">
          Importo
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={p.amount}
            onChange={(e) => p.setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            placeholder="0"
            className="bg-transparent text-[56px] font-medium text-claria-ink tracking-[-0.04em] leading-none w-[200px] text-right focus:outline-none placeholder-claria-ink/20"
            autoFocus
          />
          <span className="text-2xl text-claria-ink/40">€</span>
        </div>

        <div className="mt-3 inline-flex gap-1.5 bg-claria-ink/[0.05] p-1 rounded-full">
          <button
            type="button"
            onClick={() => p.setType("INCOME")}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              p.type === "INCOME"
                ? "bg-green-500/15 text-green-700"
                : "text-claria-ink/50"
            }`}
          >
            + Entrata
          </button>
          <button
            type="button"
            onClick={() => p.setType("EXPENSE")}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              p.type === "EXPENSE"
                ? "bg-claria-ink text-claria-cream"
                : "text-claria-ink/50"
            }`}
          >
            – Uscita
          </button>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-claria-ink/50 mb-2">
          Cosa è?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {p.categories.map((cat, i) => (
            <button
              key={`${cat.label}-${i}`}
              type="button"
              onClick={() => p.setCategoryIdx(i)}
              className={`px-3.5 py-2 rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                p.categoryIdx === i
                  ? "bg-claria-ink text-claria-cream"
                  : "bg-white border border-claria-ink/10 text-claria-ink/70"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-claria-ink/[0.06] flex items-center justify-center text-base">
            📝
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.08em] font-medium text-claria-ink/50">
              Nota
            </p>
            <input
              type="text"
              value={p.note}
              onChange={(e) => p.setNote(e.target.value)}
              placeholder="Opzionale"
              className="bg-transparent w-full text-[13px] text-claria-ink font-medium focus:outline-none placeholder-claria-ink/40"
            />
          </div>
        </div>
      </div>

      {p.type === "EXPENSE" && (
        <div className="px-5 pb-3">
          <button
            type="button"
            onClick={() => p.setIsImpulsive(!p.isImpulsive)}
            className={`w-full rounded-2xl px-4 py-3 flex items-center gap-3 border transition-colors ${
              p.isImpulsive
                ? "bg-orange-50 border-orange-200"
                : "bg-white border-claria-ink/10"
            }`}
          >
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-sm ${
              p.isImpulsive ? "bg-orange-200 text-orange-700" : "bg-claria-ink/[0.06]"
            }`}>
              ⚡
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-medium text-claria-ink">
                È stata una decisione veloce?
              </p>
              <p className="text-[10px] text-claria-ink/60 mt-0.5">
                Niente giudizio. Solo consapevolezza.
              </p>
            </div>
            <div className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
              p.isImpulsive ? "bg-orange-500" : "bg-claria-ink/15"
            }`}>
              <div className={`h-4 w-4 bg-white rounded-full transition-transform ${
                p.isImpulsive ? "translate-x-4" : "translate-x-0"
              }`} />
            </div>
          </button>
        </div>
      )}

      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={() => p.setIsRecurring(!p.isRecurring)}
          className={`w-full rounded-2xl px-4 py-3 flex items-center gap-3 border transition-colors ${
            p.isRecurring
              ? "bg-green-50 border-green-200"
              : "bg-white border-claria-ink/10"
          }`}
        >
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-sm ${
            p.isRecurring ? "bg-green-600" : "bg-claria-ink/40"
          }`}>
            ↻
          </div>
          <div className="flex-1 text-left">
            <p className="text-[12px] font-medium text-claria-ink">
              Si ripete ogni mese?
            </p>
            <p className="text-[10px] text-claria-ink/60 mt-0.5">
              Settalo una volta, lo registra sempre da solo
            </p>
          </div>
          <div className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
            p.isRecurring ? "bg-green-600" : "bg-claria-ink/15"
          }`}>
            <div className={`h-4 w-4 bg-white rounded-full transition-transform ${
              p.isRecurring ? "translate-x-4" : "translate-x-0"
            }`} />
          </div>
        </button>
      </div>

      {p.error && (
        <p className="px-5 pb-3 text-xs text-red-600">{p.error}</p>
      )}

      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={p.onSubmit}
          disabled={!p.amountValid || p.submitting}
          className="w-full bg-claria-ink text-claria-cream py-4 rounded-2xl text-[14px] font-medium shadow-lg disabled:opacity-40 active:scale-[0.98] flex items-center justify-between px-5"
        >
          <span>
            {p.submitting ? "Salvo…" : p.amountValid ? `Aggiungi ${p.amountNum.toFixed(2)}€` : "Inserisci l'importo"}
          </span>
          {p.amountValid && !p.submitting && (
            <span className="h-7 w-7 bg-claria-cream text-claria-ink rounded-full flex items-center justify-center text-sm">
              ✓
            </span>
          )}
        </button>
      </div>
    </>
  );
}

// ==================== BULK MODE ====================

interface BulkModeProps {
  bulkText: string;
  setBulkText: (t: string) => void;
  bulkPreview: Array<{
    amount: number;
    type: string;
    description: string;
    category: string;
    date: string;
    confidence: number;
  }> | null;
  setBulkPreview: (p: BulkModeProps["bulkPreview"]) => void;
  submitting: boolean;
  error: string | null;
  onPreview: () => void;
  onCommit: () => void;
}

function BulkMode(p: BulkModeProps) {
  return (
    <>
      <div className="px-5 pt-4">
        <div className="bg-claria-ink/[0.06] rounded-2xl p-4">
          <p className="text-[12px] text-claria-ink/80 leading-relaxed">
            <span className="font-medium">✨ Scrivi più transazioni insieme.</span>{" "}
            Una per riga, in italiano normale. Claria capisce importi, categorie e date.
          </p>
          <p className="mt-2 text-[11px] text-claria-ink/55 leading-relaxed">
            Esempi: <span className="font-mono">ieri 5€ caffè</span> · <span className="font-mono">30 cena con amici</span> · <span className="font-mono">stipendio 1200</span>
          </p>
        </div>
      </div>

      <div className="px-5 pt-3 pb-3">
        <textarea
          value={p.bulkText}
          onChange={(e) => {
            p.setBulkText(e.target.value);
            p.setBulkPreview(null);
          }}
          rows={6}
          placeholder="Scrivi qui le tue transazioni…&#10;Esempio:&#10;ieri 5€ caffè&#10;30€ cena con amici&#10;stipendio 1200"
          className="w-full bg-white border-2 border-claria-ink/10 rounded-2xl p-4 text-[14px] text-claria-ink font-mono focus:outline-none focus:border-claria-ink/30 placeholder-claria-ink/30"
        />
      </div>

      {!p.bulkPreview && (
        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={p.onPreview}
            disabled={!p.bulkText.trim() || p.submitting}
            className="w-full bg-claria-ink text-claria-cream py-4 rounded-2xl text-[14px] font-medium disabled:opacity-40 active:scale-[0.98]"
          >
            {p.submitting ? "Analizzo…" : "✨ Analizza con Claria"}
          </button>
        </div>
      )}

      {p.bulkPreview && (
        <>
          <div className="px-5 pb-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-claria-ink/50">
              Ho riconosciuto {p.bulkPreview.length} transazioni
            </p>
          </div>
          <div className="px-5 pb-3 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {p.bulkPreview.map((tx, i) => (
              <div key={i} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm ${
                  tx.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-claria-ink/[0.06]"
                }`}>
                  {tx.type === "INCOME" ? "+" : "–"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-claria-ink truncate">{tx.description}</p>
                  <p className="text-[10px] text-claria-ink/50 mt-0.5">
                    {tx.category} · confidence {Math.round(tx.confidence * 100)}%
                  </p>
                </div>
                <p className={`text-[14px] font-medium tabular-nums ${
                  tx.type === "INCOME" ? "text-green-700" : "text-claria-ink"
                }`}>
                  {tx.type === "INCOME" ? "+" : "−"}{tx.amount.toFixed(2)}€
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 pb-6 flex gap-2">
            <button
              type="button"
              onClick={() => p.setBulkPreview(null)}
              disabled={p.submitting}
              className="flex-1 bg-white border border-claria-ink/15 text-claria-ink py-3 rounded-2xl text-[13px] font-medium active:scale-[0.98]"
            >
              Modifica
            </button>
            <button
              type="button"
              onClick={p.onCommit}
              disabled={p.submitting || p.bulkPreview.length === 0}
              className="flex-[2] bg-claria-ink text-claria-cream py-3 rounded-2xl text-[13px] font-medium disabled:opacity-40 active:scale-[0.98]"
            >
              {p.submitting ? "Salvo…" : `Salva ${p.bulkPreview.length} transazioni`}
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ==================== RECURRING MODE ====================

interface RecurringModeProps extends Omit<SingleModeProps, 'isRecurring' | 'setIsRecurring' | 'isImpulsive' | 'setIsImpulsive'> {}

function RecurringMode(p: RecurringModeProps) {
  return (
    <>
      <div className="px-5 pt-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-[12px] text-green-800 leading-relaxed">
            <span className="font-medium">↻ Ricorrenza mensile.</span>{" "}
            Imposta una volta sola — Claria la registra ogni mese in automatico.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <SingleMode
          {...p}
          isRecurring={true}
          setIsRecurring={() => {}}
          isImpulsive={false}
          setIsImpulsive={() => {}}
        />
      </div>
    </>
  );
}


export default function NewTransactionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6">Caricamento...</div>}>
      <NewTransactionContent />
    </Suspense>
  );
}
