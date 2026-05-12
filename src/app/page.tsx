import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col px-6 pt-5 pb-6 overflow-hidden">
      {/* Glow radiale decorativo in alto a destra */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(30,21,194,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1.5 bg-claria-ink/10 px-2.5 py-1 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-soft-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-claria-ink">
            live beta
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mt-14 flex-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-claria-ink/[0.07] border border-claria-ink/10 px-3.5 py-1.5">
          <span className="text-xs">🎯</span>
          <span className="text-[11px] font-medium text-claria-ink">
            Pensato per chi è nato dopo il 1995
          </span>
        </div>

        <h1 className="mt-6 text-[52px] font-medium leading-[0.92] tracking-[-0.045em] text-claria-ink">
          I tuoi soldi.
          <br />
          Senza
          <br />
          <span
            className="font-serif italic font-normal"
            style={{
              background: "linear-gradient(120deg, #1E15C2 0%, #6B5FD9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            giudizio.
          </span>
        </h1>

        <p className="mt-6 max-w-[310px] text-[15.5px] leading-[1.55] text-claria-ink/70">
          Scopri come la tua mente si rapporta al denaro. Non come dicono gli
          altri, come funzioni davvero tu.
        </p>

        {/* Metric cards glass */}
        <div className="mt-9 grid grid-cols-3 gap-2">
          <MetricCard value="4" label="profili" />
          <MetricCard value="3'" label="test" />
          <MetricCard value="14" label="articoli" />
        </div>

        {/* Avatar stack 4 profili */}
        <div className="mt-7 flex items-center gap-2.5">
          <div className="flex">
            <ProfileDot color="#FF7A6B" gradient="#FF6555" z={4} />
            <ProfileDot color="#F4B860" gradient="#E89F4F" z={3} />
            <ProfileDot color="#3D5AFE" gradient="#2C48E0" z={2} />
            <ProfileDot color="#7C6FF0" gradient="#6258D6" z={1} isLast />
          </div>
          <span className="text-[11px] font-medium text-claria-ink/55 leading-tight">
            Rimandatore · Evitante
            <br />
            Controllore · Impulsivo
          </span>
        </div>
      </section>

      {/* CTA */}
      <div className="relative mt-10">
        <Link
          href="/onboarding"
          className="flex items-center justify-between rounded-[20px] bg-claria-ink py-[18px] pl-[22px] pr-2 text-claria-cream transition-transform active:scale-[0.98]"
          style={{
            boxShadow:
              "0 8px 24px rgba(30,21,194,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <span className="text-[15.5px] font-medium tracking-[-0.01em]">
            Scopri il tuo profilo
          </span>
          <span
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-claria-cream text-sm text-claria-ink"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            →
          </span>
        </Link>

        <p className="mt-4 text-center text-[11px] leading-[1.6] text-claria-ink/50 tracking-[0.01em]">
          Nessuna carta · Nessun marketing ·{" "}
          <span className="text-claria-ink/75 font-medium">3 minuti</span>
        </p>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-[22px] h-[22px]">
        <div className="absolute inset-0 bg-claria-ink rounded-full" />
        <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-claria-cream rounded-full" />
        <div className="absolute top-[7px] left-[7px] w-2 h-2 bg-claria-ink rounded-full" />
      </div>
      <span className="text-[15px] font-medium text-claria-ink tracking-[-0.02em]">
        claria
      </span>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-[18px] px-3 py-3 text-center border border-claria-ink/8"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="text-[22px] font-medium tracking-[-0.03em] text-claria-ink leading-none">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-medium text-claria-ink/60 tracking-[0.02em]">
        {label}
      </div>
    </div>
  );
}

function ProfileDot({
  color,
  gradient,
  z,
  isLast = false,
}: {
  color: string;
  gradient: string;
  z: number;
  isLast?: boolean;
}) {
  return (
    <div
      className={`w-[22px] h-[22px] rounded-full border-2 border-claria-cream ${
        !isLast ? "-mr-2" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}, ${gradient})`,
        zIndex: z,
      }}
    />
  );
}
