"use client";

import { useState } from "react";

export function ResetButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    try {
      await fetch("/api/user/reset", { method: "POST" });
      window.location.href = "/";
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[11px] font-medium text-claria-ink/40 hover:text-claria-ink/70 transition-colors underline underline-offset-2"
      >
        Ricomincia da capo
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 bg-claria-ink/40 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={() => !loading && setConfirming(false)}
        >
          <div
            className="w-full max-w-sm bg-claria-cream rounded-3xl p-5 shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-claria-ink">Vuoi ricominciare?</h3>
            <p className="mt-2 text-sm text-claria-ink/70 leading-relaxed">
              Cancellerò tutto: profilo, obiettivi, transazioni, contributi. Questa azione è definitiva.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="flex-1 rounded-2xl border border-claria-ink/15 py-3 text-sm font-medium text-claria-ink/70 active:scale-[0.98]"
              >
                No, annulla
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 rounded-2xl bg-claria-ink py-3 text-sm font-medium text-claria-cream active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Reset…" : "Sì, ricomincia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
