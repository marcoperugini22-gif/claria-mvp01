import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromCookie } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getToneConfig } from "@/lib/profiling/toneEngine";
import { computeAvailableBalance } from "@/lib/balance";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(2000),
    })
  ).min(1).max(30),
});

const BASE_SYSTEM_PROMPT = `Sei Claria, assistente finanziario per italiani under 35.
Rispondi SEMPRE in italiano. Tono: amichevole, diretto, mai giudicante.

REGOLA PRINCIPALE: Rispondi breve, concreto, mobile-first. Massimo 120 parole. Niente elenchi lunghi.

DOMANDE EDUCATIVE (cos'è X, come funziona Y): rispondi in modo pratico e generale, senza esempi di prodotti specifici.
DOMANDE PERSONALI (posso spendere X, come sto andando): usa il contesto finanziario dell'utente fornito sotto. Se manca, chiedi UNA sola informazione utile e basta.

REGOLE ASSOLUTE:
- Non consigliare mai prodotti finanziari specifici (ETF noti, azioni, crypto).
- Per qualsiasi domanda su investimenti aggiungi: "(Non è consulenza finanziaria — per investire parla con un professionista.)"
- Le spese impulsive sono "decisioni veloci", mai errori.
- Non fare mai la morale.`;

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Cibo",
  TRANSPORT: "Trasporti",
  SHOPPING: "Shopping",
  ENTERTAINMENT: "Svago",
  HEALTH: "Salute",
  UTILITIES: "Bollette",
  SALARY: "Stipendio",
  FREELANCE: "Freelance",
  OTHER: "Altro",
};

function buildFinancialContext(
  available: number,
  goals: Array<{ title: string; currentAmount: number; targetAmount: number; deadline: Date | null }>,
  recentTx: Array<{ amount: number; type: string; category: string; description: string | null; date: Date }>
): string {
  const lines: string[] = ["CONTESTO FINANZIARIO UTENTE:"];

  lines.push(`- Saldo disponibile: ${available.toFixed(0)}€`);

  if (goals.length > 0) {
    const goalsSummary = goals
      .map((g) => {
        const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100).toFixed(0);
        const deadlineStr = g.deadline
          ? ` · scadenza ${g.deadline.toLocaleDateString("it-IT", { month: "short", year: "numeric" })}`
          : "";
        return `"${g.title}" ${g.currentAmount.toFixed(0)}€/${g.targetAmount.toFixed(0)}€ (${pct}%${deadlineStr})`;
      })
      .join("; ");
    lines.push(`- Obiettivi attivi: ${goalsSummary}`);
  } else {
    lines.push("- Obiettivi attivi: nessuno");
  }

  if (recentTx.length > 0) {
    const txSummary = recentTx
      .map((t) => {
        const daysAgo = Math.floor((Date.now() - t.date.getTime()) / 86400000);
        const when = daysAgo === 0 ? "oggi" : daysAgo === 1 ? "ieri" : `${daysAgo}gg fa`;
        const label = CATEGORY_LABELS[t.category] ?? t.category;
        const desc = t.description ? ` "${t.description}"` : "";
        const sign = t.type === "INCOME" ? "+" : "-";
        return `${sign}${t.amount.toFixed(0)}€ ${label}${desc} (${when})`;
      })
      .join("; ");
    lines.push(`- Ultime transazioni: ${txSummary}`);
  } else {
    lines.push("- Ultime transazioni: nessuna registrata");
  }

  return lines.join("\n");
}

// Fallback mock usato solo quando OpenAI non è disponibile
const MOCK_RESPONSES: Record<string, string> = {
  interesse_composto:
    "L'interesse composto fa sì che i tuoi rendimenti generino altri rendimenti. 100€ al 5% annuo diventano 163€ in 10 anni. Prima inizi, meglio è.",
  etf:
    "Un ETF replica passivamente un indice di mercato (es. 500 grandi aziende) con costi bassi. È diversificato per natura. Non è consulenza finanziaria — per investire parla con un professionista.",
  investimenti:
    "Prima di investire, assicurati di avere un fondo di emergenza (3-6 mesi di spese) e nessun debito ad alto interesse. Poi valuta con un consulente. (Non è consulenza finanziaria.)",
  spesa_piccola:
    "Le piccole spese quotidiane si sommano in modo sorprendente. Calcola quanto spendi in un mese su una sola categoria — il numero reale di solito stupisce.",
  spesa_impulsiva:
    "Le decisioni veloci capitano. Una tecnica: aspetta 30 minuti prima di comprare qualcosa non pianificato. Spesso basta per capire se lo vuoi davvero.",
  budget:
    "Parti dal semplice: tieni traccia di entrate e uscite per un mese. Il metodo 50/30/20 è un buon punto di riferimento — 50% bisogni, 30% desideri, 20% risparmio.",
  risparmio:
    "Inizia piccolo e automatizza: anche 20€ al mese trasferiti subito dopo lo stipendio fanno la differenza. La costanza conta più dell'importo.",
  obiettivo:
    "Un obiettivo chiaro ha tre elementi: importo target, scadenza e quota mensile da mettere via. Con questi tre dati riesci a capire se il ritmo è quello giusto.",
  default:
    "Puoi dirmi qualcosa in più? Ad esempio se stai pensando a una spesa specifica, a un obiettivo o a qualcosa che non ti torna — così posso essere più utile.",
};

function getMockResponse(msg: string): string {
  const t = msg.toLowerCase();
  if (t.includes("interesse composto")) return MOCK_RESPONSES.interesse_composto;
  if (t.includes("etf") || t.includes("fondo") || t.includes("azione") || t.includes("mercato")) return MOCK_RESPONSES.etf;
  if (t.includes("invest")) return MOCK_RESPONSES.investimenti;
  if (t.includes("piccol") || t.includes("caffè") || t.includes("abbonament")) return MOCK_RESPONSES.spesa_piccola;
  if (t.includes("impulsiv") || t.includes("comprare") || t.includes("spender") || t.includes("spendo")) return MOCK_RESPONSES.spesa_impulsiva;
  if (t.includes("budget") || t.includes("entrate") || t.includes("uscite") || t.includes("spese")) return MOCK_RESPONSES.budget;
  if (t.includes("risparmio") || t.includes("risparmiare") || t.includes("mettere via")) return MOCK_RESPONSES.risparmio;
  if (t.includes("obiettivo") || t.includes("goal") || t.includes("meta")) return MOCK_RESPONSES.obiettivo;
  return MOCK_RESPONSES.default;
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const { messages } = parsed.data;
    const lastUserMessage = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";

    // Fetch user + contesto finanziario in parallelo
    const [user, transactions, goals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { profile: true, name: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        select: { amount: true, type: true, category: true, description: true, date: true },
        orderBy: { date: "desc" },
        take: 200, // per calcolo saldo corretto
      }),
      prisma.savingGoal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { title: true, currentAmount: true, targetAmount: true, deadline: true },
        orderBy: { isPinned: "desc" },
        take: 5,
      }),
    ]);

    const tone = getToneConfig(user?.profile);
    const profileInstruction = user?.profile
      ? `\nPROFILO UTENTE: ${tone.label}. ${tone.toneInstruction}`
      : "";

    // Calcola saldo disponibile reale
    const { available } = computeAvailableBalance(
      transactions,
      goals
    );
    const recentTx = transactions.slice(0, 5);

    const financialContext = buildFinancialContext(available, goals, recentTx as Parameters<typeof buildFinancialContext>[2]);

    const systemPrompt = `${BASE_SYSTEM_PROMPT}${profileInstruction}\n\n${financialContext}`;

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const apiKeyValid = !!apiKey && apiKey.length > 20;

    console.log(
      `[/api/chat] apiKeyValid=${apiKeyValid} keyLen=${apiKey?.length ?? 0} | profile=${user?.profile ?? "none"} | balance=${available.toFixed(0)}€ | msg="${lastUserMessage.slice(0, 80)}"`
    );

    if (!apiKeyValid) {
      console.warn(`[/api/chat] OPENAI_API_KEY non valida (len=${apiKey?.length ?? 0}) — mock`);
      return NextResponse.json({ reply: getMockResponse(lastUserMessage) });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error(`[/api/chat] OpenAI error: status=${openaiRes.status} body=${errBody.slice(0, 400)}`);
      return NextResponse.json({
        reply: "Ho difficoltà a rispondere in questo momento. Riprova tra qualche secondo.",
      });
    }

    const data = await openaiRes.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("[/api/chat] OpenAI returned empty content:", JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ reply: getMockResponse(lastUserMessage) });
    }

    console.log(`[/api/chat] OpenAI OK | reply=${reply.length}ch`);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/chat] unexpected error:", err);
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}
