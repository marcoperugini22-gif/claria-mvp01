import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";

const answerSchema = z.object({
  questionCode: z.string(),
  optionValue: z.string().optional(),
  rawAnswer: z.string().optional(),
  numericAnswer: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = answerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { questionCode, optionValue, rawAnswer, numericAnswer } = parsed.data;

    const question = await prisma.onboardingQuestion.findUnique({
      where: { code: questionCode },
      include: { options: true },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Domanda non trovata" },
        { status: 404 }
      );
    }

    let optionId: string | null = null;
    if (optionValue) {
      const opt = question.options.find((o: { value: string; id: string }) => o.value === optionValue);
      if (!opt) {
        return NextResponse.json(
          { error: "Opzione non valida per questa domanda" },
          { status: 400 }
        );
      }
      optionId = opt.id;
    }

    // Upsert: se l'utente ripensa una risposta, sovrascrive invece di duplicare.
    // Usiamo deleteMany + create perché Prisma non ha @@unique su [userId,questionId]
    // (volutamente, per supportare A/B test futuri con version dverse).
    await prisma.onboardingAnswer.deleteMany({
      where: { userId, questionId: question.id },
    });

    const answer = await prisma.onboardingAnswer.create({
      data: {
        userId,
        questionId: question.id,
        optionId,
        rawAnswer: rawAnswer ?? null,
        numericAnswer: numericAnswer ?? null,
      },
    });

    return NextResponse.json({ ok: true, answerId: answer.id });
  } catch (err) {
    console.error("[/api/onboarding/answer] error", err);
    return NextResponse.json(
      { error: "Errore nel salvataggio della risposta" },
      { status: 500 }
    );
  }
}
