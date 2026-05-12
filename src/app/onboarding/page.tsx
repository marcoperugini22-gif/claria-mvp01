"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard, type Question, type QuestionAnswer } from "./_components/QuestionCard";
import { StartScreen } from "./_components/StartScreen";

type Phase = "start" | "questions" | "completing";

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuestionAnswer>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/onboarding/start");
        const data = await res.json();
        if (data.user) {
          if (data.user.onboardingCompletedAt) {
            router.replace("/onboarding/result");
            return;
          }
          await loadQuestions();
          setPhase("questions");
        }
      } catch {
        /* No session: rimaniamo su start */
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadQuestions() {
    const res = await fetch("/api/onboarding/questions");
    const data = await res.json();
    setQuestions(data.questions ?? []);
  }

  async function handleStarted() {
    await loadQuestions();
    setPhase("questions");
  }

  const currentQuestion = questions[currentIdx];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.code) : undefined;

  function handleAnswer(answer: QuestionAnswer) {
    if (!currentQuestion) return;
    const next = new Map(answers);
    next.set(currentQuestion.code, answer);
    setAnswers(next);

    void fetch("/api/onboarding/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionCode: currentQuestion.code, ...answer }),
    }).catch(() => {});
  }

  async function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      await handleComplete();
    }
  }

  function handleBack() {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  }

  async function handleComplete() {
    setPhase("completing");
    setLoading(true);
    setError(null);

    try {
      await Promise.all(
        Array.from(answers.entries()).map(([questionCode, ans]) =>
          fetch("/api/onboarding/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionCode, ...ans }),
          })
        )
      );

      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!res.ok) throw new Error("Errore nel completamento");

      router.replace("/onboarding/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
      setPhase("questions");
    } finally {
      setLoading(false);
    }
  }

  function isAnswered(q: Question, a?: QuestionAnswer): boolean {
    if (!a) return false;
    if (q.questionType === "single_choice" || q.questionType === "multi_choice") {
      return !!a.optionValue;
    }
    if (q.questionType === "scale_1_5" || q.questionType === "numeric") {
      return typeof a.numericAnswer === "number" && !isNaN(a.numericAnswer);
    }
    if (q.questionType === "open_text") {
      return !!a.rawAnswer && a.rawAnswer.trim().length > 0;
    }
    return false;
  }

  if (phase === "start") {
    return (
      <main className="px-6 py-10 min-h-dvh">
        <StartScreen onStarted={handleStarted} />
      </main>
    );
  }

  if (phase === "completing") {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 py-10">
        <div className="text-center animate-fade-in">
          <div className="h-12 w-12 mx-auto rounded-full bg-claria-ink/10 animate-soft-pulse" />
          <p className="mt-6 text-lg font-medium text-claria-ink">
            Sto leggendo le tue risposte…
          </p>
          <p className="mt-2 text-sm text-claria-ink/60">
            Un secondo per costruire il tuo profilo.
          </p>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-claria-ink/60">Caricamento…</p>
      </main>
    );
  }

  const pct = ((currentIdx + 1) / questions.length) * 100;

  return (
    <main className="flex min-h-dvh flex-col px-5 py-5">
      {/* Header con back + progress */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIdx === 0}
          className="h-9 w-9 rounded-xl bg-claria-ink/[0.08] flex items-center justify-center text-claria-ink text-lg disabled:opacity-30 active:scale-95"
        >
          ←
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-claria-ink/50">
            {currentIdx + 1} di {questions.length}
          </span>
          <div className="flex-1 h-1 bg-claria-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-claria-ink rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-claria-ink/40">
          <span className="h-1.5 w-1.5 rounded-full bg-claria-ink/40" />
          claria
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1">
        <QuestionCard
          key={currentQuestion.code}
          question={currentQuestion}
          initialAnswer={currentAnswer}
          onAnswer={handleAnswer}
        />
      </div>

      {error && (
        <p className="my-3 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="mt-6 pt-2">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered(currentQuestion, currentAnswer) || loading}
          className="w-full bg-claria-ink text-claria-cream py-4 rounded-2xl text-[14px] font-medium shadow-lg disabled:opacity-40 active:scale-[0.98] flex items-center justify-between px-5"
        >
          <span>{currentIdx === questions.length - 1 ? "Completa" : "Avanti"}</span>
          <span className="h-7 w-7 bg-claria-cream text-claria-ink rounded-full flex items-center justify-center text-sm">
            →
          </span>
        </button>
      </div>
    </main>
  );
}
