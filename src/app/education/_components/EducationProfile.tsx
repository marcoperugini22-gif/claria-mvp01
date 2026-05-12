"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "claria_edu_profile";

interface EduProfile {
  goal: string;
  level: string;
  horizon: string;
  risk: string;
  topics: string[];
}

const STEPS = [
  {
    key: "goal",
    question: "Qual è il tuo obiettivo principale?",
    emoji: "🎯",
    options: [
      { value: "emergency", label: "Fondo di emergenza" },
      { value: "house", label: "Casa o grande acquisto" },
      { value: "travel", label: "Viaggiare di più" },
      { value: "invest", label: "Far crescere i risparmi" },
      { value: "freedom", label: "Indipendenza finanziaria" },
    ],
  },
  {
    key: "level",
    question: "Quanto conosci già la finanza personale?",
    emoji: "📊",
    options: [
      { value: "beginner", label: "Quasi nulla, parto da zero" },
      { value: "basic", label: "Le basi, qualche lettura" },
      { value: "intermediate", label: "Mi oriento, voglio approfondire" },
      { value: "advanced", label: "Già investo, cerco ottimizzazioni" },
    ],
  },
  {
    key: "horizon",
    question: "In quanto tempo vuoi vedere risultati?",
    emoji: "⏳",
    options: [
      { value: "short", label: "Entro 6 mesi" },
      { value: "medium", label: "1-3 anni" },
      { value: "long", label: "Oltre 5 anni" },
    ],
  },
  {
    key: "risk",
    question: "Come reagisci di fronte al rischio finanziario?",
    emoji: "🎲",
    options: [
      { value: "low", label: "Preferisco dormire tranquillo" },
      { value: "medium", label: "Un po' di oscillazione va bene" },
      { value: "high", label: "Rischio alto, potenziale alto" },
    ],
  },
  {
    key: "topics",
    question: "Quali argomenti ti interessano?",
    emoji: "📚",
    multi: true,
    options: [
      { value: "budgeting", label: "Budget e controllo spese" },
      { value: "savings", label: "Risparmio e obiettivi" },
      { value: "investing", label: "Investimenti e mercati" },
      { value: "bias", label: "Psicologia del denaro" },
      { value: "mindset", label: "Abitudini finanziarie" },
    ],
  },
] as const;

// Slug consigliati per combinazione profilo
function getRecommendedSlugs(profile: Partial<EduProfile>): string[] {
  const slugs: string[] = [];
  if (profile.level === "beginner" || profile.level === "basic") {
    slugs.push("budget-personale", "fondo-emergenza", "interesse-composto");
  }
  if (profile.goal === "invest" || profile.level === "intermediate" || profile.level === "advanced") {
    slugs.push("investimenti-base", "diversificazione", "inflazione-vita-vera");
  }
  if (profile.topics?.includes("bias")) {
    slugs.push("acquisti-impulsivi", "present-bias", "loss-aversion", "fomo");
  }
  if (profile.risk === "low") {
    slugs.push("loss-aversion", "gestione-emotiva");
  }
  if (profile.topics?.includes("savings") || profile.goal === "emergency") {
    slugs.push("fondo-emergenza", "pianificazione-acquisti");
  }
  return [...new Set(slugs)].slice(0, 4);
}

interface Props {
  onProfileSaved: (profile: EduProfile) => void;
}

export function EducationProfileWidget({ onProfileSaved }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [done, setDone] = useState(false);

  const current = STEPS[step];
  const isMulti = "multi" in current && current.multi;

  function selectOption(value: string) {
    if (isMulti) {
      const prev = (answers[current.key] as string[]) ?? [];
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      setAnswers({ ...answers, [current.key]: next });
    } else {
      const next = { ...answers, [current.key]: value };
      setAnswers(next);
      if (step < STEPS.length - 1) {
        setTimeout(() => setStep(step + 1), 220);
      } else {
        finalize(next);
      }
    }
  }

  function nextMulti() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finalize(answers);
    }
  }

  function finalize(final: Record<string, string | string[]>) {
    const profile: EduProfile = {
      goal: (final.goal as string) ?? "",
      level: (final.level as string) ?? "",
      horizon: (final.horizon as string) ?? "",
      risk: (final.risk as string) ?? "",
      topics: (final.topics as string[]) ?? [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    onProfileSaved(profile);
    setDone(true);
  }

  if (done) return null;

  const selected = answers[current.key];
  const multiSelected = isMulti ? ((selected as string[]) ?? []) : [];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div
      className="rounded-3xl p-5 mb-6"
      style={{
        background: "linear-gradient(135deg,#1E15C2,#2A20D9,#3B30E8)",
        boxShadow: "0 10px 30px rgba(30,21,194,0.2)",
      }}
    >
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-claria-cream/65">
            Personalizza il tuo percorso
          </p>
          <p className="text-[10px] text-claria-cream/50 tabular-nums">
            {step + 1}/{STEPS.length}
          </p>
        </div>
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-claria-cream rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-[22px] mb-1">{current.emoji}</p>
        <p className="text-[16px] font-medium text-claria-cream leading-[1.3] tracking-[-0.01em]">
          {current.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {current.options.map((opt) => {
          const isSelected = isMulti
            ? multiSelected.includes(opt.value)
            : selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => selectOption(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-[13px] font-medium transition-all active:scale-[0.98] ${
                isSelected
                  ? "bg-claria-cream text-claria-ink"
                  : "bg-white/15 text-claria-cream border border-white/20"
              }`}
            >
              {isSelected && "✓ "}
              {opt.label}
            </button>
          );
        })}
      </div>

      {isMulti && (
        <button
          type="button"
          onClick={nextMulti}
          disabled={multiSelected.length === 0}
          className="mt-3 w-full bg-claria-cream text-claria-ink py-3 rounded-2xl text-[13px] font-medium active:scale-[0.98] disabled:opacity-40"
        >
          {step < STEPS.length - 1 ? "Avanti →" : "Mostrami il mio percorso →"}
        </button>
      )}
    </div>
  );
}

export function useEduProfile() {
  const [profile, setProfile] = useState<EduProfile | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
    setChecked(true);
  }, []);

  return { profile, checked, setProfile, getRecommendedSlugs };
}
