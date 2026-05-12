/**
 * Claria — Seed del questionario di onboarding v2
 * ------------------------------------------------
 * v2 (May 2026): ribilanciati i pesi per portare tutti e 4 i profili
 * a un max teorico simile (~16) e ridotte le dipendenze incrociate
 * tra opzioni che davano punti a 2 profili contemporaneamente.
 *
 * Max teorici target:
 *   R (Rimandatore)  → 16
 *   E (Evitante)     → 16
 *   C (Controllore)  → 16
 *   I (Impulsivo)    → 16
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ProfileWeights = { R?: number; E?: number; C?: number; I?: number };

interface OptionSeed {
  value: string;
  label: string;
  weights: ProfileWeights;
}

interface QuestionSeed {
  code: string;
  text: string;
  helperText?: string;
  questionType: "single_choice" | "multi_choice" | "scale_1_5" | "numeric" | "open_text";
  scoringEnabled: boolean;
  options?: OptionSeed[];
}

const QUESTIONNAIRE_V2: QuestionSeed[] = [
  // Blocco A - Contesto (no scoring)
  { code: "Q01_AGE", text: "Quanti anni hai?", questionType: "numeric", scoringEnabled: false },

  {
    code: "Q02_LIFE_STAGE",
    text: "In che fase sei in questo momento?",
    questionType: "single_choice",
    scoringEnabled: false,
    options: [
      { value: "student", label: "Studente / studentessa", weights: {} },
      { value: "student_working", label: "Studio e lavoricchio (part-time, stage, freelance)", weights: {} },
      { value: "first_job", label: "Primo lavoro stabile (entro 2 anni)", weights: {} },
      { value: "working", label: "Lavoro da qualche anno", weights: {} },
      { value: "in_between", label: "Tra un'esperienza e l'altra", weights: {} },
    ],
  },

  {
    code: "Q03_LITERACY",
    text: "Quanto ti senti a tuo agio quando si parla di soldi, conti, risparmio, investimenti?",
    helperText: "1 = per niente · 5 = molto a mio agio",
    questionType: "scale_1_5",
    scoringEnabled: false,
  },

  {
    code: "Q04_INCOME",
    text: "In media, quanto ti entra ogni mese?",
    helperText: "Stipendio, paghetta, freelance, qualsiasi cosa.",
    questionType: "single_choice",
    scoringEnabled: false,
    options: [
      { value: "lt_200", label: "Meno di 200€", weights: {} },
      { value: "200_500", label: "200 – 500€", weights: {} },
      { value: "500_1000", label: "500 – 1.000€", weights: {} },
      { value: "1000_1500", label: "1.000 – 1.500€", weights: {} },
      { value: "1500_2500", label: "1.500 – 2.500€", weights: {} },
      { value: "gt_2500", label: "Più di 2.500€", weights: {} },
      { value: "prefer_not", label: "Preferisco non dirlo", weights: {} },
    ],
  },

  // ==== BLOCCO B — Profilazione (8 domande) ====
  // Strategia: max 1 profilo premiato per opzione. Pesi più alti su opzioni signature.

  {
    code: "Q05_APP_BEHAVIOR",
    text: "Quando apri l'app della tua banca, cosa succede di solito?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "check_balance", label: "La prima cosa che guardo è il saldo, sempre", weights: { C: 3 } },
      { value: "quick_look", label: "Do un'occhiata generale e chiudo", weights: {} },
      { value: "avoid_balance", label: "La apro solo quando devo fare qualcosa di specifico, non guardo il saldo", weights: { E: 3 } },
      { value: "distracted", label: "La apro, ma poi mi distraggo e finisco a guardare altro", weights: { I: 2 } },
    ],
  },

  {
    code: "Q06_INTENTION_ACTION_GAP",
    text: "Ti è mai capitato di pensare \"da questo mese inizio a mettere via qualcosa\" senza poi farlo davvero?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "never", label: "Mai, quando decido di farlo lo faccio", weights: { C: 2 } },
      { value: "sometimes", label: "Qualche volta, ma poi mi attivo nei giorni successivi", weights: {} },
      { value: "often_stuck", label: "Spesso, è un pensiero che ho ma non si concretizza mai", weights: { R: 4 } },
      { value: "spent_meanwhile", label: "Sì, e di solito succede perché nel frattempo ho speso quei soldi per altro", weights: { I: 3 } },
    ],
  },

  {
    code: "Q07_IMPULSE_BUYING",
    text: "Ti capita di comprare qualcosa e pentirtene poco dopo?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "almost_never", label: "Quasi mai, ci penso bene prima", weights: { C: 2 } },
      { value: "rarely", label: "Raramente, di solito sono spese ragionate", weights: {} },
      { value: "notice_later", label: "Sì, e spesso me ne accorgo solo guardando l'estratto conto", weights: { E: 3 } },
      { value: "immediate_regret", label: "Sì, e subito dopo mi sento in colpa o ci ripenso", weights: { I: 2 } },
    ],
  },

  {
    code: "Q08_MONEY_ANXIETY",
    text: "Pensare ai tuoi soldi che effetto ti fa?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "none", label: "Nessuno, è una cosa pratica", weights: {} },
      { value: "mild_tension", label: "Un po' di tensione, come per ogni cosa importante", weights: {} },
      { value: "avoidance", label: "Mi mette ansia, preferisco non pensarci troppo", weights: { E: 4 } },
      { value: "rumination", label: "Ci penso spesso e fatico a staccare il pensiero", weights: { C: 3 } },
    ],
  },

  {
    code: "Q09_PLANNING_STYLE",
    text: "Quanto pianifichi le tue spese in anticipo?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "detailed_tracking", label: "Tutto in un foglio Excel o app dedicata, anche le piccole spese", weights: { C: 4 } },
      { value: "big_only", label: "Le spese grandi sì, le piccole no", weights: {} },
      { value: "rough_idea", label: "Ho un'idea di massima ma non scrivo niente", weights: {} },
      { value: "day_by_day", label: "Vivo abbastanza alla giornata, vediamo come va", weights: { I: 2 } },
    ],
  },

  {
    code: "Q10_WINDFALL_REACTION",
    text: "Ti arrivano 200€ inaspettati (regalo, rimborso, vincita piccola). Cosa fai per primo?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "save_invest", label: "Li sposto subito sul fondo risparmio o li investo", weights: { C: 2 } },
      { value: "treat_self", label: "Li uso per qualcosa che mi va, in fondo sono extra", weights: { I: 3 } },
      { value: "postpone_decision", label: "Aspetto, ci penso, poi decido", weights: { R: 4 } },
      { value: "leave_account", label: "Li lascio sul conto e non ci penso", weights: { E: 3 } },
    ],
  },

  {
    code: "Q11_UNEXPECTED_EXPENSE",
    text: "Devi affrontare una spesa imprevista importante (auto, dentista, contributo affitto). La tua prima reazione?",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "calculate_now", label: "Apro l'app, faccio i conti, capisco esattamente come gestirla", weights: { C: 3 } },
      { value: "freeze", label: "Mi blocco, ho bisogno di tempo prima di guardare i numeri", weights: { E: 3 } },
      { value: "postpone", label: "So che devo affrontarla ma rimando il momento di farci i conti", weights: { R: 4 } },
      { value: "quickest_fix", label: "Cerco la soluzione più veloce per chiudere il problema", weights: { I: 2 } },
    ],
  },

  {
    code: "Q12_PRIMARY_GOAL",
    text: "Qual è la cosa che ti aspetti di più da Claria?",
    helperText: "Useremo questa risposta come tuo obiettivo principale.",
    questionType: "single_choice",
    scoringEnabled: true,
    options: [
      { value: "save_for_something", label: "Riuscire a risparmiare per qualcosa di concreto che ho in mente", weights: {} },
      { value: "understand_money", label: "Capire dove vanno a finire i miei soldi", weights: { E: 3 } },
      { value: "stop_postponing", label: "Smettere di rimandare e fare il primo passo", weights: { R: 4 } },
      { value: "stop_impulse", label: "Smettere di comprare cose che poi non uso", weights: { I: 3 } },
      { value: "feel_confident", label: "Sentirmi più sicuro/a quando si parla di soldi", weights: {} },
    ],
  },
];

async function seedQuestionnaire(): Promise<void> {
  console.log("🌱 Seeding questionario onboarding v2 (rebalanced)…");

  for (let i = 0; i < QUESTIONNAIRE_V2.length; i++) {
    const q = QUESTIONNAIRE_V2[i];
    const order = i + 1;

    const question = await prisma.onboardingQuestion.upsert({
      where: { code: q.code },
      create: {
        code: q.code,
        text: q.text,
        helperText: q.helperText,
        questionType: q.questionType,
        order,
        version: 1,
        isActive: true,
      },
      update: {
        text: q.text,
        helperText: q.helperText,
        questionType: q.questionType,
        order,
        isActive: true,
      },
    });

    if (q.options && q.options.length > 0) {
      await prisma.onboardingOption.deleteMany({
        where: { questionId: question.id },
      });

      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        await prisma.onboardingOption.create({
          data: {
            questionId: question.id,
            label: opt.label,
            value: opt.value,
            profileWeights: {
              R: opt.weights.R ?? 0,
              E: opt.weights.E ?? 0,
              C: opt.weights.C ?? 0,
              I: opt.weights.I ?? 0,
            },
            order: j,
          },
        });
      }
    }

    console.log(`  ✓ ${q.code} — ${q.text.slice(0, 60)}…`);
  }

  const totalQ = await prisma.onboardingQuestion.count({ where: { version: 1, isActive: true } });
  const totalO = await prisma.onboardingOption.count();
  console.log(`✅ Seed completato: ${totalQ} domande, ${totalO} opzioni`);
}

async function main() {
  await seedQuestionnaire();
}

main()
  .catch((e) => {
    console.error("❌ Errore durante il seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
