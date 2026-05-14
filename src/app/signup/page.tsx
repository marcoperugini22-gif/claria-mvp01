"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";

function ClariaLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-[22px] h-[22px]">
        <div className="absolute inset-0 bg-claria-ink rounded-full" />
        <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-claria-cream rounded-full" />
        <div className="absolute top-[7px] left-[7px] w-2 h-2 bg-claria-ink rounded-full" />
      </div>
      <span className="text-[15px] font-medium text-claria-ink tracking-[-0.02em]">claria</span>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (password !== confirm) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createSupabaseClient();
    const { error: authError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    });

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("already registered")
          ? "Questa email è già registrata. Prova ad accedere."
          : "Errore durante la registrazione. Riprova."
      );
      setLoading(false);
      return;
    }

    // Sessione immediata (email confirmation disabilitata) → onboarding
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    // Altrimenti mostra schermata "controlla email"
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <main className="min-h-dvh px-6 pt-12 pb-8 flex flex-col max-w-md mx-auto">
        <div className="mb-10">
          <ClariaLogo />
        </div>
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="text-5xl mb-5">✉️</div>
          <h2 className="text-[24px] font-medium tracking-[-0.02em] text-claria-ink">
            Controlla la tua email
          </h2>
          <p className="mt-3 text-[14px] text-claria-ink/65 leading-relaxed max-w-xs mx-auto">
            Ti abbiamo mandato un link di conferma a{" "}
            <span className="font-medium text-claria-ink">{email}</span>.
            Aprilo per attivare il tuo account.
          </p>
          <p className="mt-5 text-[12px] text-claria-ink/45">
            Non trovi l&apos;email? Controlla lo spam.
          </p>
        </div>
        <p className="mt-8 text-center text-[13px] text-claria-ink/60">
          <Link href="/login" className="underline underline-offset-2">
            Torna al login
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 pt-12 pb-8 flex flex-col max-w-md mx-auto">
      <div className="mb-10">
        <ClariaLogo />
      </div>

      <div className="mb-8">
        <h1 className="text-[32px] font-medium tracking-[-0.03em] text-claria-ink leading-[1.1]">
          Crea il tuo
          <br />
          <span className="font-serif italic font-normal">account.</span>
        </h1>
        <p className="mt-2 text-[14px] text-claria-ink/60 leading-relaxed">
          Gratis. Nessuna carta richiesta.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-3">
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
            placeholder="Min. 8 caratteri"
            required
            autoComplete="new-password"
            className="w-full bg-transparent text-[15px] text-claria-ink font-medium focus:outline-none placeholder-claria-ink/30"
          />
        </div>

        <div
          className="bg-white rounded-2xl px-4 py-3.5 border border-claria-ink/10"
          style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.08em] font-medium text-claria-ink/50 mb-1">
            Conferma password
          </p>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ripeti la password"
            required
            autoComplete="new-password"
            className="w-full bg-transparent text-[15px] text-claria-ink font-medium focus:outline-none placeholder-claria-ink/30"
          />
        </div>

        {error && <p className="text-[12px] text-red-600 px-1">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !email || !password || !confirm}
            className="w-full flex items-center justify-between rounded-[18px] bg-claria-ink py-4 pl-5 pr-2 text-claria-cream disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 6px 20px rgba(30,21,194,0.25)" }}
          >
            <span className="text-[15px] font-medium">
              {loading ? "Creo il tuo account…" : "Crea account"}
            </span>
            {!loading && (
              <span className="h-8 w-8 bg-claria-cream text-claria-ink rounded-full flex items-center justify-center text-sm font-medium">
                →
              </span>
            )}
          </button>
        </div>

        <p className="text-center text-[10.5px] text-claria-ink/40 leading-relaxed pt-1">
          Registrandoti accetti i termini di utilizzo di Claria.
        </p>
      </form>

      <div className="flex-1" />

      <div className="mt-8 text-center">
        <p className="text-[13px] text-claria-ink/60">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-claria-ink underline underline-offset-2">
            Accedi
          </Link>
        </p>
      </div>
    </main>
  );
}
