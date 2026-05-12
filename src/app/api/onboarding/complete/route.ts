import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";
import { computeProfileForUser } from "@/lib/profiling/scoring";

export async function POST() {
  try {
    const userId = getUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const result = await computeProfileForUser(userId);

    const answers = await prisma.onboardingAnswer.findMany({
      where: { userId },
      include: { question: true, option: true },
    });

    type AnswerWithRelations = {
      question: { code: string };
      option: { value: string; label: string } | null;
      numericAnswer: number | null;
      rawAnswer: string | null;
    };

    const findAnswer = (code: string): AnswerWithRelations | undefined =>
      answers.find((a: AnswerWithRelations) => a.question.code === code);

    const ageAnswer = findAnswer("Q01_AGE");
    const lifeStageAnswer = findAnswer("Q02_LIFE_STAGE");
    const literacyAnswer = findAnswer("Q03_LITERACY");
    const incomeAnswer = findAnswer("Q04_INCOME");
    const goalAnswer = findAnswer("Q12_PRIMARY_GOAL");

    const incomeMidpoint: Record<string, number | null> = {
      lt_200: 100,
      "200_500": 350,
      "500_1000": 750,
      "1000_1500": 1250,
      "1500_2500": 2000,
      gt_2500: 3000,
      prefer_not: null,
    };

    const incomeValue = incomeAnswer?.option?.value;
    const monthlyIncome = incomeValue ? incomeMidpoint[incomeValue] ?? null : null;
    const primaryGoalText = goalAnswer?.option?.label ?? null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        age: ageAnswer?.numericAnswer ? Math.round(ageAnswer.numericAnswer) : null,
        occupation: lifeStageAnswer?.option?.value ?? null,
        selfRatedLiteracy: literacyAnswer?.numericAnswer ? Math.round(literacyAnswer.numericAnswer) : null,
        monthlyIncome,
        primaryGoal: primaryGoalText,
        profile: result.profile,
        profileScores: result.normalizedScores as unknown as object,
        profileConfidence: result.confidence,
        profileAssignedAt: result.profile ? new Date() : null,
        onboardingCompletedAt: new Date(),
      },
    });

    await prisma.behavioralEvent.create({
      data: {
        userId,
        eventType: "ONBOARDING_COMPLETED",
        metadata: { profile: result.profile, confidence: result.confidence, reason: result.reason },
      },
    });

    // NOTA: non creiamo più dati mock automatici.
    // L'utente vedrà la dashboard "empty" con i 3 onboarding-task
    // e li completerà inserendo i SUOI dati reali.

    return NextResponse.json({
      profile: result.profile,
      confidence: result.confidence,
      reason: result.reason,
      scores: result.normalizedScores,
    });
  } catch (err) {
    console.error("[/api/onboarding/complete] error", err);
    return NextResponse.json({ error: "Errore nel completamento dell'onboarding" }, { status: 500 });
  }
}
