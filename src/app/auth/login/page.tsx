"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const supabase = createSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("invalid")
          ? "Email o password non corrette."
          : "Errore durante l'accesso. Riprova."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-dvh px-6 pt-12 pb-8 flex flex-col max-w-md mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mb-10">
        <div className="relative w-[22px] h-[22px]">
          <div className="absolute inset-0 bg-claria-ink rounded-full" />
          <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-claria-cream rounded-full" />
          <div className="absolute top-[7px] left-[7px] w-2 h-2 bg-claria-ink rounded-full" />
        </div>
        <span className="text-[15px] font-medium text-claria-ink tracking-[-0.02em]">claria</span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[32px] font-medium tracking-[-0.03em] text-claria-ink leading-[1.1]">
          Bentornato.
        </h1>
        <p className="mt-2 text-[14px] text-claria-ink/60 leading-relaxed">
          Accedi al tuo profilo e alla dashboard.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-3">
        <div
          className="bg-white rounded-2xl px-4 py-3.5 border border-claria-ink/10"
          style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.08em] font-medium text-claria-ink/50 mb-1">
            Email
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="la-tua@email.com"
            required
            autoComplete="email"
            className="w-full bg-transparent text-[15px] text-claria-ink font-medium focus:outline-none placeholder-claria-ink/30"
          />
        </div>

        <div
          className="bg-white rounded-2xl px-4 py-3.5 border border-claria-ink/10"
          style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.08em] font-medium text-claria-ink/50 mb-1">
            Password
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full bg-transparent text-[15px] text-claria-ink font-medium focus:outline-none placeholder-claria-ink/30"
          />
        </div>

        {error && <p className="text-[12px] text-red-600 px-1">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-between rounded-[18px] bg-claria-ink py-4 pl-5 pr-2 text-claria-cream disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 6px 20px rgba(30,21,194,0.25)" }}
          >
            <span className="text-[15px] font-medium">
              {loading ? "Accesso in corso…" : "Accedi"}
            </span>
            {!loading && (
              <span className="h-8 w-8 bg-claria-cream text-claria-ink rounded-full flex items-center justify-center text-sm font-medium">
                →
              </span>
            )}
          </button>
        </div>

        <p className="text-center pt-1">
          <Link
            href="/auth/forgot-password"
            className="text-[12px] text-claria-ink/50 underline underline-offset-2"
          >
            Hai dimenticato la password?
          </Link>
        </p>
      </form>

      <div className="flex-1" />

      {/* Footer */}
      <div className="mt-10 text-center space-y-3">
        <p className="text-[13px] text-claria-ink/60">
          Non hai ancora un account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-claria-ink underline underline-offset-2"
          >
            Crealo gratis
          </Link>
        </p>
        <p className="text-[13px] text-claria-ink/60">
          Vuoi provare senza registrarti?{" "}
          <Link href="/onboarding" className="font-medium text-claria-ink underline underline-offset-2">
            Inizia l&apos;onboarding
          </Link>
        </p>
      </div>
    </main>
  );
}
