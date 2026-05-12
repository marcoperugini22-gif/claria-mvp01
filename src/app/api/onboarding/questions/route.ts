import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const questions = await prisma.onboardingQuestion.findMany({
      where: { version: 1, isActive: true },
      orderBy: { order: "asc" },
      include: {
        options: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            label: true,
            value: true,
            order: true,
            // NB: NON esponiamo profileWeights al client — è logica server-only
          },
        },
      },
    });

    type QuestionWithOptions = {
      id: string;
      code: string;
      text: string;
      helperText: string | null;
      questionType: string;
      order: number;
      options: Array<{ id: string; label: string; value: string; order: number }>;
    };

    const safe = questions.map((q: QuestionWithOptions) => ({
      id: q.id,
      code: q.code,
      text: q.text,
      helperText: q.helperText,
      questionType: q.questionType,
      order: q.order,
      options: q.options,
    }));

    return NextResponse.json({ questions: safe });
  } catch (err) {
    console.error("[/api/onboarding/questions] error", err);
    return NextResponse.json(
      { error: "Errore nel recupero delle domande" },
      { status: 500 }
    );
  }
}
