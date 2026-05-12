import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";
import { getToneConfig } from "@/lib/profiling/toneEngine";
import { BottomNav } from "@/components/BottomNav";
import { EducationClient } from "./_components/EducationClient";

const EDUCATION_CARDS = [
  // Basics
  { slug: "budget-personale", category: "basics" as const, icon: "📊", iconFrom: "#DBEAFE", iconTo: "#BFDBFE",
    title: "Come costruire un budget personale che funziona davvero",
    preview: "Il metodo 50/30/20 e perché funziona meglio se lo adatti al tuo stipendio reale.",
    readMin: 3 },
  { slug: "fondo-emergenza", category: "basics" as const, icon: "🛟", iconFrom: "#D1FAE5", iconTo: "#A7F3D0",
    title: "Il fondo di emergenza: 3 mesi di spese, o forse meno",
    preview: "Quanto mettere via davvero, dove tenerlo, e come iniziare quando hai pochi soldi.",
    readMin: 4, recommendedFor: ["EVITANTE", "RIMANDATORE_STRATEGICO"] },
  { slug: "interesse-composto", category: "basics" as const, icon: "📈", iconFrom: "#EDE9FE", iconTo: "#DDD6FE",
    title: "L'interesse composto: la matematica che cambia tutto",
    preview: "Perché 100€ al mese a 25 anni valgono più di 300€ al mese a 40.",
    readMin: 5, starred: true },
  { slug: "investimenti-base", category: "basics" as const, icon: "🎯", iconFrom: "#FED7AA", iconTo: "#FDBA74",
    title: "Investire da zero: ETF, PAC, e cosa non fare il primo anno",
    preview: "Le basi senza marketing. Diversificazione, costi nascosti, orizzonte temporale.",
    readMin: 6 },
  { slug: "inflazione-vita-vera", category: "basics" as const, icon: "🔥", iconFrom: "#FEF3C7", iconTo: "#FDE68A",
    title: "L'inflazione spiegata con il prezzo del caffè",
    preview: "Cosa significa davvero per i tuoi risparmi, e perché tenere 10.000€ sul conto è una perdita.",
    readMin: 3 },
  { slug: "diversificazione", category: "basics" as const, icon: "🧺", iconFrom: "#E0E7FF", iconTo: "#C7D2FE",
    title: "Diversificare senza farsi venire il mal di testa",
    preview: "Il principio del 'non mettere tutte le uova in un paniere', tradotto in scelte pratiche.",
    readMin: 4 },
  // Bias
  { slug: "fomo", category: "bias" as const, icon: "👀", iconFrom: "#FEE2E2", iconTo: "#FECACA",
    title: "FOMO: quando comprare per non rimanere fuori",
    preview: "Cripto, hype, sneaker drop. Come riconoscere quando stai comprando per paura, non per scelta.",
    readMin: 3, recommendedFor: ["IMPULSIVO_CONSAPEVOLE"] },
  { slug: "loss-aversion", category: "bias" as const, icon: "🛡️", iconFrom: "#E0E7FF", iconTo: "#C7D2FE",
    title: "Perché perdere 100€ fa più male che vincerne 200",
    preview: "L'avversione alla perdita spiegata bene.",
    readMin: 4, recommendedFor: ["EVITANTE", "CONTROLLORE_FRAGILE"] },
  { slug: "present-bias", category: "bias" as const, icon: "⏰", iconFrom: "#FAE8FF", iconTo: "#F5D0FE",
    title: "Il presente vince sempre (e va bene così)",
    preview: "Il bias del presente: perché è difficile risparmiare per 'te del futuro'.",
    readMin: 3, recommendedFor: ["RIMANDATORE_STRATEGICO", "IMPULSIVO_CONSAPEVOLE"] },
  { slug: "bias-conferma", category: "bias" as const, icon: "🔍", iconFrom: "#CFFAFE", iconTo: "#A5F3FC",
    title: "Cercare solo quello che ci dà ragione",
    preview: "Il bias di conferma negli investimenti.",
    readMin: 4 },
  { slug: "overconfidence", category: "bias" as const, icon: "🎲", iconFrom: "#FCE7F3", iconTo: "#FBCFE8",
    title: "L'eccesso di fiducia (e quanto costa)",
    preview: "Perché chi pensa di sapere di più sui mercati di solito guadagna di meno.",
    readMin: 4 },
  { slug: "acquisti-impulsivi", category: "bias" as const, icon: "⚡", iconFrom: "#FED7AA", iconTo: "#FDBA74",
    title: "Acquisti impulsivi: cosa succede nel cervello",
    preview: "Il momento esatto in cui passi da 'guardo solo' a 'l'ho comprato'. E come allungarlo.",
    readMin: 3, recommendedFor: ["IMPULSIVO_CONSAPEVOLE"], starred: true },
  { slug: "gestione-emotiva", category: "bias" as const, icon: "🌊", iconFrom: "#DBEAFE", iconTo: "#BFDBFE",
    title: "Quando il denaro tocca le emozioni",
    preview: "Ansia, controllo eccessivo, evitamento. Riconoscerli senza giudizio.",
    readMin: 5, recommendedFor: ["EVITANTE", "CONTROLLORE_FRAGILE"] },
  { slug: "pianificazione-acquisti", category: "bias" as const, icon: "📝", iconFrom: "#FEF9C3", iconTo: "#FEF08A",
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

  return (
    <main className="px-6 py-5 min-h-dvh pb-nav">
      <header className="mb-6">
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
        </div>
        <h1 className="text-[30px] font-medium leading-[1.05] tracking-[-0.035em] text-claria-ink">
          Capire i soldi,
          <br />
          <span className="font-serif italic font-normal">passo passo.</span>
        </h1>
        <p className="mt-2.5 text-[13.5px] text-claria-ink/65 leading-[1.5] max-w-[280px]">
          Letture brevi. Niente paroloni, niente marketing.
        </p>
      </header>

      <EducationClient
        cards={EDUCATION_CARDS}
        userProfile={user.profile}
        accentColor={tone.accentColor}
      />

      <BottomNav />
    </main>
  );
}
