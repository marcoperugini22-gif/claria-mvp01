"use client";

import { useState } from "react";

interface StartScreenProps {
  onStarted: () => void;
}

export function StartScreen({ onStarted }: StartScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Errore");
      }

      onStarted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold leading-tight text-claria-ink">
        Iniziamo a conoscerci.
      </h1>
      <p className="mt-3 text-claria-ink/70 leading-relaxed">
        12 domande veloci, circa 3 minuti. Nessuna è giusta o sbagliata: ci
        servono per capire come ti rapporti ai soldi <em>adesso</em>.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-claria-ink/70 mb-2">
            Come ti chiami?{" "}
            <span className="text-claria-ink/40">(opzionale)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Il tuo nome"
            className="w-full rounded-2xl border-2 border-claria-ink/15 bg-claria-cream-soft px-5 py-4 text-base text-claria-ink focus:border-claria-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-claria-ink/70 mb-2">
            La tua email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@esempio.it"
            className="w-full rounded-2xl border-2 border-claria-ink/15 bg-claria-cream-soft px-5 py-4 text-base text-claria-ink focus:border-claria-ink focus:outline-none"
          />
          <p className="mt-2 text-xs text-claria-ink/50">
            Ci serve per salvare il tuo profilo e riprenderlo dopo. Niente spam.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-2xl bg-claria-ink py-4 text-center text-claria-cream font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Un attimo…" : "Inizia"}
        </button>
      </form>

      <p className="mt-6 text-xs text-claria-ink/40 text-center leading-relaxed">
        Continuando accetti il nostro tono leggero, mai giudicante. <br />I
        tuoi dati restano tuoi.
      </p>
    </div>
  );
}
