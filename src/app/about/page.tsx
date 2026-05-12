import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

interface Founder {
  name: string;
  role: string;
  background: string;
  contribution: string;
  emoji: string;
  color: string;
}

// Descrizioni neutre estratte dal business plan (sezione TEAM, pag. 11-12)
const FOUNDERS: Founder[] = [
  {
    name: "Marta Paniconi",
    role: "AI & Product",
    background: "Studentessa in Artificial Intelligence",
    contribution:
      "Sviluppo della piattaforma, definizione della logica AI e validazione delle componenti tecnologiche di Claria.",
    emoji: "🤖",
    color: "#7C6FF0",
  },
  {
    name: "Chiara Pierini",
    role: "AI & Product",
    background: "Studentessa in Artificial Intelligence",
    contribution:
      "Sviluppo della piattaforma, definizione della logica AI e validazione delle componenti tecnologiche di Claria.",
    emoji: "🧠",
    color: "#FF7A6B",
  },
  {
    name: "Marco Perugini",
    role: "Strategy & Business",
    background: "Studente in Digital Economics and Business",
    contribution:
      "Gestione strategica, definizione del modello di business, posizionamento sul mercato e aspetti economico-organizzativi.",
    emoji: "📊",
    color: "#3D5AFE",
  },
  {
    name: "Giacomo Renzi",
    role: "Strategy & Business",
    background: "Studente in Economia Aziendale",
    contribution:
      "Gestione strategica, definizione del modello di business, posizionamento sul mercato e aspetti economico-organizzativi.",
    emoji: "💼",
    color: "#F4B860",
  },
];

export default async function AboutPage() {
  const userId = getUserIdFromCookie();
  if (!userId) redirect("/onboarding");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profile: true },
  });
  if (!user) redirect("/onboarding");

  return (
    <main className="px-5 py-5 min-h-dvh">
      {/* Header */}
      <header>
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-claria-ink/50">
          Chi siamo
        </p>
        <h1 className="mt-1 text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-claria-ink">
          Quattro persone,
          <br />
          un&apos;<span className="font-serif italic font-normal">idea</span>.
        </h1>
      </header>

      {/* Mission */}
      <section className="mt-6">
        <div className="rounded-3xl bg-claria-ink p-5 text-claria-cream">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-claria-cream/60 mb-2">
            La nostra missione
          </p>
          <p className="text-[15px] leading-[1.55] font-medium">
            Aiutare le nuove generazioni a sviluppare un rapporto più consapevole
            ed equilibrato con il denaro, rendendo l&apos;educazione finanziaria
            <span className="font-serif italic"> più accessibile e personalizzata</span>.
          </p>
        </div>
      </section>

      {/* Origin story */}
      <section className="mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-claria-ink/50 mb-2 px-1">
          Come è nata Claria
        </p>
        <div className="bg-white rounded-3xl p-5 border border-claria-ink/5">
          <p className="text-[13.5px] text-claria-ink/85 leading-[1.6]">
            Siamo quattro studenti universitari{" "}
            <strong className="font-medium">under 25</strong>. Abbiamo vissuto in
            prima persona la fatica di affrontare risparmio, prime carte bancarie e decisioni
            di spesa senza riferimenti chiari, semplici e vicini al nostro linguaggio.
          </p>
          <p className="mt-3 text-[13.5px] text-claria-ink/85 leading-[1.6]">
            Da qui è nata Claria: una piattaforma che unisce educazione finanziaria,
            comprensione dei comportamenti decisionali e percorsi di risparmio personalizzati.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="mt-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-claria-ink/50 mb-3 px-1">
          Il team
        </p>
        <div className="space-y-2.5">
          {FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>
      </section>

      {/* What makes us different */}
      <section className="mt-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-claria-ink/50 mb-3 px-1">
          Cosa ci rende diversi
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <DiffCard
            icon="🧠"
            title="Comportamentale"
            text="Non solo numeri: capire perché spendi come spendi."
          />
          <DiffCard
            icon="🎯"
            title="Personalizzata"
            text="4 profili psicofinanziari, una dashboard adattiva."
          />
          <DiffCard
            icon="💛"
            title="Senza giudizio"
            text="Il denaro è frutto del tuo lavoro. Merita rispetto."
          />
          <DiffCard
            icon="📱"
            title="Per la tua generazione"
            text="Linguaggio, design e tono pensati per chi è nato dopo il 1995."
          />
        </div>
      </section>

      {/* Contact */}
      <section className="mt-7">
        <div className="rounded-3xl bg-claria-cream-deep/30 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-claria-ink/60 mb-1">
            ✉️ Scrivici
          </p>
          <p className="text-[14px] text-claria-ink font-medium leading-tight">
            Hai feedback, idee, segnalazioni?
          </p>
          <p className="mt-1 text-[12px] text-claria-ink/65 leading-relaxed">
            Siamo all&apos;inizio. Il tuo input vale tanto.
          </p>
          <a
            href="mailto:hello@claria.app"
            className="mt-3 inline-block text-[13px] font-medium text-claria-ink underline underline-offset-2"
          >
            hello@claria.app
          </a>
        </div>
      </section>

      <p className="mt-6 text-center text-[11px] text-claria-ink/40">
        Claria · MVP · Made in Italy 🇮🇹
      </p>

      <BottomNav />
    </main>
  );
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-claria-ink/5 flex gap-3">
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: `${founder.color}25` }}
      >
        {founder.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-[15px] font-medium text-claria-ink">
            {founder.name}
          </h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${founder.color}20`,
              color: founder.color,
            }}
          >
            {founder.role}
          </span>
        </div>
        <p className="mt-0.5 text-[11.5px] text-claria-ink/55">
          {founder.background}
        </p>
        <p className="mt-1.5 text-[12px] text-claria-ink/75 leading-[1.5]">
          {founder.contribution}
        </p>
      </div>
    </div>
  );
}

function DiffCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-3.5 border border-claria-ink/5">
      <div className="text-2xl mb-1.5">{icon}</div>
      <p className="text-[12px] font-medium text-claria-ink leading-tight">
        {title}
      </p>
      <p className="mt-1 text-[10.5px] text-claria-ink/60 leading-[1.4]">
        {text}
      </p>
    </div>
  );
}
