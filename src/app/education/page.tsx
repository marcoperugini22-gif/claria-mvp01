import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";
import { getToneConfig } from "@/lib/profiling/toneEngine";
import { BottomNav } from "@/components/BottomNav";

interface EducationCard {
  slug: string;
  category: "basics" | "bias" | "advanced";
  icon: string;
  iconFrom: string;
  iconTo: string;
  title: string;
  preview: string;
  readMin: number;
  starred?: boolean;
  recommendedFor?: string[];
}

const EDUCATION_CARDS: EducationCard[] = [
  // Basics
  { slug: "budget-personale", category: "basics", icon: "📊", iconFrom: "#DBEAFE", iconTo: "#BFDBFE",
    title: "Come costruire un budget personale che funziona davvero",
    preview: "Il metodo 50/30/20 e perché funziona meglio se lo adatti al tuo stipendio reale.",
    readMin: 3 },
  { slug: "fondo-emergenza", category: "basics", icon: "🛟", iconFrom: "#D1FAE5", iconTo: "#A7F3D0",
    title: "Il fondo di emergenza: 3 mesi di spese, o forse meno",
    preview: "Quanto mettere via davvero, dove tenerlo, e come iniziare quando hai pochi soldi.",
    readMin: 4, recommendedFor: ["EVITANTE", "RIMANDATORE_STRATEGICO"] },
  { slug: "interesse-composto", category: "basics", icon: "📈", iconFrom: "#EDE9FE", iconTo: "#DDD6FE",
    title: "L'interesse composto: la matematica che cambia tutto",
    preview: "Perché 100€ al mese a 25 anni valgono più di 300€ al mese a 40.",
    readMin: 5, starred: true },
  { slug: "investimenti-base", category: "basics", icon: "🎯", iconFrom: "#FED7AA", iconTo: "#FDBA74",
    title: "Investire da zero: ETF, PAC, e cosa non fare il primo anno",
    preview: "Le basi senza marketing. Diversificazione, costi nascosti, orizzonte temporale.",
    readMin: 6 },
  { slug: "inflazione-vita-vera", category: "basics", icon: "🔥", iconFrom: "#FEF3C7", iconTo: "#FDE68A",
    title: "L'inflazione spiegata con il prezzo del caffè",
    preview: "Cosa significa davvero per i tuoi risparmi, e perché tenere 10.000€ sul conto è una perdita.",
    readMin: 3 },
  { slug: "diversificazione", category: "basics", icon: "🧺", iconFrom: "#E0E7FF", iconTo: "#C7D2FE",
    title: "Diversificare senza farsi venire il mal di testa",
    preview: "Il principio del 'non mettere tutte le uova in un paniere', tradotto in scelte pratiche.",
    readMin: 4 },
  // Bias
  { slug: "fomo", category: "bias", icon: "👀", iconFrom: "#FEE2E2", iconTo: "#FECACA",
    title: "FOMO: quando comprare per non rimanere fuori",
    preview: "Cripto, hype, sneaker drop. Come riconoscere quando stai comprando per paura, non per scelta.",
    readMin: 3, recommendedFor: ["IMPULSIVO_CONSAPEVOLE"] },
  { slug: "loss-aversion", category: "bias", icon: "🛡️", iconFrom: "#E0E7FF", iconTo: "#C7D2FE",
    title: "Perché perdere 100€ fa più male che vincerne 200",
    preview: "L'avversione alla perdita spiegata bene.",
    readMin: 4, recommendedFor: ["EVITANTE", "CONTROLLORE_FRAGILE"] },
  { slug: "present-bias", category: "bias", icon: "⏰", iconFrom: "#FAE8FF", iconTo: "#F5D0FE",
    title: "Il presente vince sempre (e va bene così)",
    preview: "Il bias del presente: perché è difficile risparmiare per 'te del futuro'.",
    readMin: 3, recommendedFor: ["RIMANDATORE_STRATEGICO", "IMPULSIVO_CONSAPEVOLE"] },
  { slug: "bias-conferma", category: "bias", icon: "🔍", iconFrom: "#CFFAFE", iconTo: "#A5F3FC",
    title: "Cercare solo quello che ci dà ragione",
    preview: "Il bias di conferma negli investimenti.",
    readMin: 4 },
  { slug: "overconfidence", category: "bias", icon: "🎲", iconFrom: "#FCE7F3", iconTo: "#FBCFE8",
    title: "L'eccesso di fiducia (e quanto costa)",
    preview: "Perché chi pensa di sapere di più sui mercati di solito guadagna di meno.",
    readMin: 4 },
  { slug: "acquisti-impulsivi", category: "bias", icon: "⚡", iconFrom: "#FED7AA", iconTo: "#FDBA74",
    title: "Acquisti impulsivi: cosa succede nel cervello",
    preview: "Il momento esatto in cui passi da 'guardo solo' a 'l'ho comprato'. E come allungarlo.",
    readMin: 3, recommendedFor: ["IMPULSIVO_CONSAPEVOLE"], starred: true },
  { slug: "gestione-emotiva", category: "bias", icon: "🌊", iconFrom: "#DBEAFE", iconTo: "#BFDBFE",
    title: "Quando il denaro tocca le emozioni",
    preview: "Ansia, controllo eccessivo, evitamento. Riconoscerli senza giudizio.",
    readMin: 5, recommendedFor: ["EVITANTE", "CONTROLLORE_FRAGILE"] },
  { slug: "pianificazione-acquisti", category: "bias", icon: "📝", iconFrom: "#FEF9C3", iconTo: "#FEF08A",
    title: "La regola dei 30 giorni",
    preview: "Una tecnica semplice per gestire i desideri di acquisto: scriverlo, aspettare, decidere.",
    readMin: 3, recommendedFor: ["IMPULSIVO_CONSAPEVOLE", "RIMANDATORE_STRATEGICO"] },
];

export default async function EducationPage() {
  const userId = getUserIdFromCookie();
  if (!userId) redirect("/onboarding");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profile: true, name: true },
  });
  if (!user) redirect("/onboarding");

  const tone = getToneConfig(user.profile);
  const userProfile = user.profile;

  const recommended = EDUCATION_CARDS.filter(
    (c) => c.recommendedFor && userProfile && c.recommendedFor.includes(userProfile)
  );
  const basics = EDUCATION_CARDS.filter((c) => c.category === "basics");
  const bias = EDUCATION_CARDS.filter((c) => c.category === "bias");

  // Top-pick: il primo "recommended", o se non ce ne sono il primo starred bias
  const featured = recommended[0] ?? bias.find((c) => c.starred) ?? bias[0];

  return (
    <main className="px-6 py-5 min-h-dvh">
      {/* Header editoriale */}
      <header>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-claria-ink/55">
              Education
            </span>
            <span className="h-1 w-1 rounded-full bg-claria-ink/30" />
            <span className="text-[10px] text-claria-ink/50">
              {EDUCATION_CARDS.length} letture
            </span>
          </div>
          <span className="text-[18px]">🔍</span>
        </div>

        <h1 className="text-[30px] font-medium leading-[1.05] tracking-[-0.035em] text-claria-ink">
          Capire i soldi,
          <br />
          <span className="font-serif italic font-normal">passo passo.</span>
        </h1>
        <p className="mt-2.5 text-[13.5px] text-claria-ink/65 leading-[1.5] max-w-[280px]">
          Letture brevi che ti accompagnano. Niente paroloni, niente marketing.
        </p>

        <div className="mt-4 flex gap-1.5 flex-wrap">
          <FilterPill active label="Tutti" />
          <FilterPill label="🧠 Bias" />
          <FilterPill label="📊 Finanza" />
        </div>
      </header>

      {/* Featured card */}
      {featured && (
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="h-1.5 w-1.5 rounded-full inline-block"
              style={{
                backgroundColor: tone.accentColor,
                boxShadow: `0 0 0 4px ${tone.accentColor}33`,
              }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-claria-ink/55">
              {recommended.length > 0 ? "Consigliato per te" : "In evidenza"}
            </p>
          </div>

          <FeaturedCard card={featured} accentColor={tone.accentColor} />
        </section>
      )}

      {/* Carosello Bias */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[14px] font-medium text-claria-ink tracking-[-0.01em]">
              🧠 Bias comportamentali
            </p>
            <p className="text-[11px] text-claria-ink/55 mt-0.5">
              Le trappole della mente con i soldi
            </p>
          </div>
          <span className="text-[11px] font-medium text-claria-ink/55 underline underline-offset-2">
            {bias.length} →
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-6 px-6 snap-x snap-mandatory">
          {bias.map((card) => (
            <CarouselCard key={card.slug} card={card} />
          ))}
          <div className="w-2 shrink-0" />
        </div>
      </section>

      {/* Griglia Finanza base */}
      <section className="mt-7">
        <p className="text-[14px] font-medium text-claria-ink tracking-[-0.01em] mb-3">
          📊 Finanza base
        </p>

        <div className="grid grid-cols-2 gap-2">
          {basics.map((card) => (
            <GridCard key={card.slug} card={card} />
          ))}
        </div>
      </section>

      <p className="mt-8 mb-2 text-center text-[11px] text-claria-ink/40">
        Più contenuti in arrivo · Suggerimenti?{" "}
        <Link href="/about" className="underline underline-offset-2">
          Scrivici
        </Link>
      </p>

      <BottomNav />
    </main>
  );
}

function FilterPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors active:scale-95 ${
        active
          ? "bg-claria-ink text-claria-cream"
          : "bg-white text-claria-ink border border-claria-ink/10"
      }`}
    >
      {label}
    </button>
  );
}

function FeaturedCard({
  card,
  accentColor,
}: {
  card: EducationCard;
  accentColor: string;
}) {
  return (
    <Link
      href={`/education/${card.slug}`}
      className="block rounded-3xl p-5 relative overflow-hidden active:scale-[0.99] transition-transform"
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 50%, ${accentColor}cc 100%)`,
        boxShadow: `0 12px 32px ${accentColor}4D`,
      }}
    >
      {/* Glow decorativi */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -left-7 w-36 h-36 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 65%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div
            className="h-[46px] w-[46px] rounded-[14px] flex items-center justify-center text-[22px]"
            style={{
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {card.icon}
          </div>
          <span
            className="text-[10px] font-medium tracking-[0.04em] text-white px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {card.readMin} min · {card.category === "bias" ? "BIAS" : "BASE"}
          </span>
        </div>

        <p className="text-[18px] font-medium text-white leading-[1.2] tracking-[-0.015em]">
          {card.title}
        </p>
        <p className="mt-2 text-[12.5px] text-white/85 leading-[1.45]">
          {card.preview}
        </p>

        <div
          className="mt-3.5 inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-full text-[12px] font-medium"
          style={{ color: accentColor }}
        >
          Leggi ora
          <span
            className="h-[18px] w-[18px] rounded-full flex items-center justify-center text-white text-[11px]"
            style={{ backgroundColor: accentColor }}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CarouselCard({ card }: { card: EducationCard }) {
  return (
    <Link
      href={`/education/${card.slug}`}
      className="snap-start min-w-[170px] max-w-[170px] bg-white rounded-[18px] p-3.5 border border-claria-ink/[0.04] active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 2px 12px rgba(30,21,194,0.06)" }}
    >
      <div
        className="h-[38px] w-[38px] rounded-xl flex items-center justify-center text-[18px] mb-2.5"
        style={{
          background: `linear-gradient(135deg, ${card.iconFrom} 0%, ${card.iconTo} 100%)`,
        }}
      >
        {card.icon}
      </div>
      <p className="text-[12.5px] font-medium text-claria-ink leading-[1.25] tracking-[-0.005em] mb-1.5">
        {card.title}
      </p>
      <p className="text-[10px] text-claria-ink/50 flex items-center gap-1">
        ⏱ {card.readMin} min
        {card.starred && (
          <>
            <span className="mx-0.5">·</span>
            <span style={{ color: "#F59E0B" }}>⭐</span>
          </>
        )}
      </p>
    </Link>
  );
}

function GridCard({ card }: { card: EducationCard }) {
  return (
    <Link
      href={`/education/${card.slug}`}
      className="bg-white rounded-2xl p-3 border border-claria-ink/[0.04] active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
    >
      <div
        className="h-[34px] w-[34px] rounded-[10px] flex items-center justify-center text-[16px] mb-2"
        style={{
          background: `linear-gradient(135deg, ${card.iconFrom} 0%, ${card.iconTo} 100%)`,
        }}
      >
        {card.icon}
      </div>
      <p className="text-[11.5px] font-medium text-claria-ink leading-[1.25] tracking-[-0.005em]">
        {card.title}
      </p>
      <p className="mt-1 text-[9.5px] text-claria-ink/50 flex items-center gap-1">
        {card.readMin} min
        {card.starred && <span style={{ color: "#F59E0B" }}>⭐</span>}
      </p>
    </Link>
  );
}
