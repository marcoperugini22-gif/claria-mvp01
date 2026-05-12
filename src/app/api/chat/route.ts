import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromCookie } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getToneConfig } from "@/lib/profiling/toneEngine";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(2000),
    })
  ).min(1).max(30),
});

const SYSTEM_PROMPT = `Sei Claria, un assistente finanziario digitale per le nuove generazioni italiane.
Rispondi in italiano, con tono amichevole, chiaro e mai giudicante.
Aiuti con dubbi su budget, risparmio, investimenti, obiettivi e gestione delle spese.
Non sei un consulente finanziario professionale: concludi risposte su investimenti o prodotti finanziari con un breve disclaimer.
Risposte brevi (max 3 paragrafi). Niente elenchi lunghissimi.`;

// Risposte mock per quando OpenAI non è configurato
const MOCK_RESPONSES: Record<string, string> = {
  default:
    "Ottima domanda! Per risponderti al meglio, considera di analizzare le tue entrate e uscite degli ultimi 30 giorni — spesso i pattern di spesa emergono subito. Hai già un'idea di quanto riesci a mettere via ogni mese?",
  budget:
    "Il metodo più semplice per iniziare è il 50/30/20: 50% per bisogni fissi, 30% per desideri, 20% per risparmio. Adattalo al tuo stipendio reale: se guadagni poco, anche il 5% messo via è un inizio valido.",
  risparmio:
    "Inizia piccolo: anche 20€ al mese fanno la differenza nel lungo periodo grazie all'interesse composto. L'importante è la costanza, non l'importo. Hai già un obiettivo specifico in mente?",
  investimenti:
    "Per chi inizia, un ETF diversificato a basso costo (es. world index) è spesso la scelta più sensata. Ricorda: gli investimenti comportano rischi e il capitale può diminuire. Per scelte personalizzate, consulta un consulente finanziario indipendente iscritto all'albo.",
  obiettivo:
    "Definire l'obiettivo con precisione aiuta molto: quanto ti serve, entro quando, e quanto puoi mettere via ogni mese. Con questi tre dati, Claria può mostrarti il percorso più realistico.",
};

function getMockResponse(lastMessage: string): string {
  const text = lastMessage.toLowerCase();
  if (text.includes("budget") || text.includes("spese")) return MOCK_RESPONSES.budget;
  if (text.includes("risparmio") || text.includes("mettere via")) return MOCK_RESPONSES.risparmio;
  if (text.includes("invest") || text.includes("etf") || text.includes("mercato")) return MOCK_RESPONSES.investimenti;
  if (text.includes("obiettivo") || text.includes("goal")) return MOCK_RESPONSES.obiettivo;
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

    // Recupera profilo utente per personalizzare il tono
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile: true, name: true },
    });
    const tone = getToneConfig(user?.profile);
    const profileInstruction = user?.profile
      ? `\nProfilo finanziario dell'utente: ${tone.label}. ${tone.toneInstruction}`
      : "";

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Mock response
      const reply = getMockResponse(lastUserMessage);
      return NextResponse.json({ reply });
    }

    // OpenAI call
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + profileInstruction },
          ...messages,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const reply = getMockResponse(lastUserMessage);
      return NextResponse.json({ reply });
    }

    const data = await openaiRes.json();
    const reply: string = data.choices?.[0]?.message?.content ?? getMockResponse(lastUserMessage);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/chat] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
