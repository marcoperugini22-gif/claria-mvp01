import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";

/**
 * Bulk parser per inserire più transazioni con una sola query.
 * Linguaggio target: italiano, una transazione per riga (o separata da virgole).
 *
 * Pattern riconosciuti:
 *   "5€ caffè"
 *   "ieri 30 cena con amici"
 *   "oggi 1200 stipendio"  (numeri >= 500 senza segno = entrata di default)
 *   "speso 15 al bar"
 *   "incassato 50 vendita"
 *
 * Non usa LLM: tutto via regex + euristiche. Risultato preview, l'utente
 * conferma prima di committare in DB.
 */

const bulkSchema = z.object({
  text: z.string().min(1).max(5000),
  commit: z.boolean().optional().default(false),
});

interface ParsedTransaction {
  amount: number;
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  date: string; // ISO
  confidence: number; // 0-1
}

// Keyword → categoria + segno default
const KEYWORDS: Array<{
  patterns: RegExp[];
  category: string;
  type?: "INCOME" | "EXPENSE";
}> = [
  { patterns: [/stipendio/i, /paghett/i, /salari/i], category: "OTHER", type: "INCOME" },
  { patterns: [/rimborso/i, /vendita/i, /vincita/i, /regalo/i, /incassat/i], category: "OTHER", type: "INCOME" },
  { patterns: [/freelance/i, /fattur/i, /onorari/i], category: "OTHER", type: "INCOME" },

  { patterns: [/caff(e|è)/i, /bar/i, /pranzo/i, /cena/i, /aperitivo/i, /spritz/i, /pizz/i, /sushi/i, /poke/i, /ristorante/i, /trattoria/i, /spes(a|e) (al )?super/i, /supermerc/i], category: "FOOD", type: "EXPENSE" },
  { patterns: [/treno/i, /metro/i, /bus/i, /taxi/i, /uber/i, /benzin/i, /carburante/i, /parcheggi/i, /trenitalia/i, /italo/i, /flixbus/i], category: "TRANSPORT", type: "EXPENSE" },
  { patterns: [/netflix/i, /spotify/i, /abbonament/i, /prime/i, /disney/i, /youtube/i], category: "SUBSCRIPTIONS", type: "EXPENSE" },
  { patterns: [/cinema/i, /concert/i, /spettac/i, /teatr/i, /event/i, /palestra/i, /gym/i], category: "ENTERTAINMENT", type: "EXPENSE" },
  { patterns: [/affitto/i, /bolletta/i, /luce/i, /gas/i, /acqua/i, /internet/i, /telefono/i], category: "BILLS", type: "EXPENSE" },
  { patterns: [/farmaci/i, /medicin/i, /dottor/i, /dentista/i], category: "HEALTH", type: "EXPENSE" },
  { patterns: [/amazon/i, /zalando/i, /felpa/i, /scarpe/i, /sneaker/i, /maglia/i, /jeans/i, /vestito/i, /shop/i, /comprat/i], category: "SHOPPING", type: "EXPENSE" },
  { patterns: [/libro/i, /universit/i, /corso/i, /tasse/i], category: "EDUCATION", type: "EXPENSE" },
];

const EXPENSE_VERBS = /\b(speso|spesa|pagato|comprato|preso)\b/i;
const INCOME_VERBS = /\b(incassato|ricevuto|guadagnato|entrato)\b/i;

function parseDate(rawText: string): Date {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (/\bieri\b/i.test(rawText)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (/\bavantieri\b/i.test(rawText) || /\bl['']altro ieri\b/i.test(rawText)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return d;
  }
  return today;
}

function parseLine(line: string): ParsedTransaction | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Estrae il numero (con eventuale separatore decimale)
  const amountMatch = trimmed.match(/(\d+[.,]?\d*)\s*(€|euro|eur)?/i);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1].replace(",", "."));
  if (isNaN(amount) || amount <= 0) return null;

  // Rimuove il numero dal testo per il resto della classificazione
  const cleaned = trimmed.replace(amountMatch[0], "").trim();

  // Categoria + tipo via keyword
  let type: "INCOME" | "EXPENSE" = "EXPENSE";
  let category = "OTHER";
  let confidence = 0.5;

  for (const kw of KEYWORDS) {
    if (kw.patterns.some((p) => p.test(cleaned))) {
      category = kw.category;
      if (kw.type) type = kw.type;
      confidence = 0.85;
      break;
    }
  }

  // Override esplicito da verbi
  if (INCOME_VERBS.test(cleaned)) {
    type = "INCOME";
    confidence = Math.max(confidence, 0.9);
  } else if (EXPENSE_VERBS.test(cleaned)) {
    type = "EXPENSE";
    confidence = Math.max(confidence, 0.9);
  }

  // Euristica: importi grandi senza keyword di spesa → potrebbe essere entrata
  if (amount >= 500 && category === "OTHER" && !EXPENSE_VERBS.test(cleaned)) {
    type = "INCOME";
    confidence = 0.65;
  }

  const date = parseDate(trimmed);

  // Descrizione: il testo "pulito" senza parole-chiave temporali
  const description = cleaned
    .replace(/\b(ieri|oggi|avantieri|l['']altro ieri|stamattina|stasera|stanotte|stamani)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || (type === "INCOME" ? "Entrata" : "Spesa");

  return {
    amount,
    type,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    category,
    date: date.toISOString(),
    confidence,
  };
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const { text, commit } = parsed.data;

    // Split per newline o virgola, mantenendo solo righe sensate
    const lines = text
      .split(/\n|;/)
      .flatMap((l) => l.split(/,(?=\s*\d)/)) // virgola seguita da numero = nuova transazione
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsedTxs = lines
      .map(parseLine)
      .filter((x): x is ParsedTransaction => x !== null);

    if (!commit) {
      // Modalità preview: ritorna solo il parsing senza scrivere in DB
      return NextResponse.json({
        preview: true,
        transactions: parsedTxs,
        count: parsedTxs.length,
      });
    }

    // Modalità commit: scrive le transazioni
    if (parsedTxs.length === 0) {
      return NextResponse.json({
        ok: true,
        created: 0,
      });
    }

    await prisma.transaction.createMany({
      data: parsedTxs.map((t) => ({
        userId,
        amount: t.amount,
        type: t.type as "INCOME" | "EXPENSE",
        category: t.category as "FOOD" | "TRANSPORT" | "ENTERTAINMENT" | "SHOPPING" | "BILLS" | "HEALTH" | "EDUCATION" | "SUBSCRIPTIONS" | "SAVINGS" | "TRANSFER" | "OTHER",
        description: t.description,
        date: new Date(t.date),
        source: "bulk",
      })),
    });

    await prisma.behavioralEvent.create({
      data: {
        userId,
        eventType: "TRANSACTION_LOGGED",
        metadata: { source: "bulk", count: parsedTxs.length },
      },
    });

    return NextResponse.json({ ok: true, created: parsedTxs.length });
  } catch (err) {
    console.error("[/api/transactions/bulk] error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
