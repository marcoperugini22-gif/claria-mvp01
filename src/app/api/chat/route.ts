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
Rispondi SEMPRE in italiano, con tono amichevole, diretto e mai giudicante.
Rispondi in modo specifico alla domanda posta — non usare frasi generiche o risposte preconfezionate.
Per domande di educazione finanziaria (budget, risparmio, investimenti, bias cognitivi): fornisci informazioni concrete e pratiche.
Per domande personali ("posso spendere X?", "sto sbagliando?"): non giudicare mai, aiuta a riflettere sulle conseguenze senza imporre scelte.
Le spese impulsive non sono "errori" ma "decisioni veloci" — rispetta sempre l'autonomia dell'utente.
Aggiungi un breve disclaimer solo quando parli di prodotti finanziari specifici o investimenti (es. ETF, azioni, criptovalute).
Risposte brevi: 2-3 paragrafi al massimo. Puoi fare una domanda di follow-up per capire meglio il contesto.`;

// Fallback mock: più keyword e risposte più specifiche
const MOCK_RESPONSES: Record<string, string> = {
  interesse_composto:
    "L'interesse composto è il meccanismo per cui i rendimenti si reinvestono e generano a loro volta rendimenti. In pratica: 100€ che crescono del 5% annuo diventano 163€ in 10 anni, 265€ in 20. Prima inizi, più il tempo lavora per te.",
  budget:
    "Il punto di partenza è sapere dove vanno i tuoi soldi. Tieni traccia di entrate e uscite per un mese, poi dividi in 'fisso' (affitto, bollette) e 'variabile' (cibo, svago). Il metodo 50/30/20 è un buon riferimento: 50% bisogni, 30% desideri, 20% risparmio.",
  risparmio:
    "Inizia piccolo e automatizza: anche 20–50€ al mese trasferiti su un conto separato il giorno dello stipendio fanno la differenza nel tempo. L'obiettivo non è l'importo, è la costanza.",
  spesa_impulsiva:
    "Le spese veloci succedono a tutti — non c'è nulla di sbagliato in questo. Una tecnica utile è la 'regola dei 30 minuti': prima di comprare qualcosa non pianificato, aspetta 30 minuti e chiediti se lo vorresti ancora. Spesso basta.",
  investimenti:
    "Per chi inizia, un ETF a basso costo su indice mondiale (tipo MSCI World) è una delle opzioni più semplici e diversificate. Gli investimenti però comportano rischi e il capitale può diminuire: per scelte personalizzate, consulta un consulente finanziario indipendente iscritto all'albo.",
  obiettivo:
    "Un buon obiettivo ha tre elementi: importo target, scadenza e importo mensile da mettere via. Con questi tre dati, puoi calcolare se il ritmo attuale è sufficiente o se serve aggiustare qualcosa.",
  spesa_piccola:
    "Le spese piccole e frequenti (caffè, abbonamenti, consegne) spesso passano inosservate ma si sommano in modo significativo. Prova a calcolare quanto spendi in un mese su una categoria specifica — il numero reale di solito sorprende.",
  etf:
    "Un ETF (Exchange Traded Fund) è un fondo che replica passivamente un indice di mercato — ad esempio le 500 maggiori aziende americane (S&P 500) o il mercato mondiale (MSCI World). Costa poco, è diversificato e si acquista come un'azione. Gli investimenti comportano rischi: consulta un consulente per decisioni personalizzate.",
  default:
    "Buona domanda. Puoi dirmi qualcosa in più sul contesto? Ad esempio, se stai parlando di una spesa specifica, di un obiettivo di risparmio o di qualcosa che hai visto — così posso darti una risposta più utile.",
};

function getMockResponse(lastMessage: string): string {
  const text = lastMessage.toLowerCase();
  if (text.includes("interesse composto") || text.includes("compound")) return MOCK_RESPONSES.interesse_composto;
  if (text.includes("etf") || text.includes("fondo") || text.includes("azione") || text.includes("mercato")) return MOCK_RESPONSES.etf;
  if (text.includes("invest")) return MOCK_RESPONSES.investimenti;
  if (text.includes("piccol") || text.includes("caffè") || text.includes("abbonament")) return MOCK_RESPONSES.spesa_piccola;
  if (text.includes("impulsiv") || text.includes("resist") || text.includes("comprare") || text.includes("spender") || text.includes("spendo")) return MOCK_RESPONSES.spesa_impulsiva;
  if (text.includes("budget") || text.includes("entrate") || text.includes("uscite") || text.includes("spese")) return MOCK_RESPONSES.budget;
  if (text.includes("risparmio") || text.includes("risparmiare") || text.includes("mettere via")) return MOCK_RESPONSES.risparmio;
  if (text.includes("obiettivo") || text.includes("goal") || text.includes("meta")) return MOCK_RESPONSES.obiettivo;
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile: true, name: true },
    });
    const tone = getToneConfig(user?.profile);
    const profileInstruction = user?.profile
      ? `\nProfilo finanziario dell'utente: ${tone.label}. ${tone.toneInstruction}`
      : "";

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    // Una chiave OpenAI valida inizia con "sk-" e ha almeno 20 caratteri
    const apiKeyValid = !!apiKey && apiKey.length > 20;

    // Log key status senza stamparne il valore
    console.log(
      `[/api/chat] apiKeyPresent=${!!apiKey} apiKeyValid=${apiKeyValid} keyLen=${apiKey?.length ?? 0} | profile=${user?.profile ?? "none"} | msg="${lastUserMessage.slice(0, 80)}"`
    );

    if (!apiKeyValid) {
      console.warn(`[/api/chat] OPENAI_API_KEY assente o non valida (lunghezza: ${apiKey?.length ?? 0}) — uso risposta mock`);
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
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + profileInstruction },
          ...messages,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error(
        `[/api/chat] OpenAI error: status=${openaiRes.status} body=${errBody.slice(0, 400)}`
      );
      // Fallback con messaggio onesto, non risposta generica
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

    console.log(`[/api/chat] OpenAI OK | reply length=${reply.length}`);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/chat] unexpected error:", err);
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}
