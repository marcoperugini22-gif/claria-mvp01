"use client";

import { useEffect, useRef, useState } from "react";

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface Question {
  id: string;
  code: string;
  text: string;
  helperText?: string | null;
  questionType: "single_choice" | "multi_choice" | "scale_1_5" | "numeric" | "open_text";
  order: number;
  options: QuestionOption[];
}

export interface QuestionAnswer {
  optionValue?: string;
  numericAnswer?: number;
  rawAnswer?: string;
}

interface QuestionCardProps {
  question: Question;
  initialAnswer?: QuestionAnswer;
  onAnswer: (answer: QuestionAnswer) => void;
}

// Mapping codice domanda → emoji + "capitolo"
const QUESTION_META: Record<string, { chapter: string; emoji: string; titleSuffix?: string }> = {
  Q01_AGE: { chapter: "Capitolo 1 — Chi sei", emoji: "👋" },
  Q02_LIFE_STAGE: { chapter: "Capitolo 1 — Chi sei", emoji: "🌱" },
  Q03_LITERACY: { chapter: "Capitolo 1 — Chi sei", emoji: "📚" },
  Q04_INCOME: { chapter: "Capitolo 1 — Chi sei", emoji: "💰" },
  Q05_APP_BEHAVIOR: { chapter: "Capitolo 2 — Come ti rapporti", emoji: "📱" },
  Q06_INTENTION_ACTION_GAP: { chapter: "Capitolo 2 — Come ti rapporti", emoji: "⏳" },
  Q07_IMPULSE_BUYING: { chapter: "Capitolo 3 — Come spendi", emoji: "🧠" },
  Q08_MONEY_ANXIETY: { chapter: "Capitolo 3 — Come spendi", emoji: "💭" },
  Q09_PLANNING_STYLE: { chapter: "Capitolo 3 — Come spendi", emoji: "📅" },
  Q10_WINDFALL_REACTION: { chapter: "Capitolo 4 — Le tue scelte", emoji: "🎁" },
  Q11_UNEXPECTED_EXPENSE: { chapter: "Capitolo 4 — Le tue scelte", emoji: "⚡" },
  Q12_PRIMARY_GOAL: { chapter: "Capitolo 5 — Il tuo perché", emoji: "🎯" },
};

// Mapping value opzione → emoji
const OPTION_EMOJI: Record<string, string> = {
  // Q05
  check_balance: "🔍",
  quick_look: "👀",
  avoid_balance: "🙈",
  distracted: "🤹",
  // Q06
  never: "🛡️",
  sometimes: "🤷",
  often_stuck: "⏳",
  spent_meanwhile: "💸",
  // Q07
  almost_never: "🛡️",
  rarely: "🤷",
  notice_later: "👀",
  immediate_regret: "😬",
  // Q08
  none: "😌",
  mild_tension: "😐",
  avoidance: "😰",
  rumination: "🌀",
  // Q09
  detailed_tracking: "📊",
  big_only: "📋",
  rough_idea: "🤷",
  day_by_day: "🌊",
  // Q10
  save_invest: "🏦",
  treat_self: "🎉",
  postpone_decision: "⏳",
  leave_account: "🤷",
  // Q11
  calculate_now: "🧮",
  freeze: "🥶",
  postpone: "⏳",
  quickest_fix: "⚡",
  // Q12
  save_for_something: "🎯",
  understand_money: "🔍",
  stop_postponing: "🚀",
  stop_impulse: "🧘",
  feel_confident: "💪",
  // Q02
  student: "🎓",
  student_working: "💼",
  first_job: "🌟",
  working: "💪",
  in_between: "🌊",
  // Q04
  lt_200: "🌱",
  "200_500": "🌿",
  "500_1000": "🌳",
  "1000_1500": "🌲",
  "1500_2500": "🌴",
  gt_2500: "🏔️",
  prefer_not: "🤐",
};

export function QuestionCard({
  question,
  initialAnswer,
  onAnswer,
}: QuestionCardProps) {
  const meta = QUESTION_META[question.code] ?? { chapter: "", emoji: "✨" };

  return (
    <div className="animate-fade-in">
      {/* Chapter tag */}
      {meta.chapter && (
        <div className="inline-flex items-center gap-1.5 bg-claria-ink/[0.08] rounded-full px-3 py-1 mb-4">
          <span className="text-sm">{meta.emoji}</span>
          <span className="text-[11px] font-medium text-claria-ink">{meta.chapter}</span>
        </div>
      )}

      <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-claria-ink">
        {question.text}
      </h2>

      {question.helperText && (
        <p className="mt-2 text-[13px] text-claria-ink/60 leading-[1.5]">
          {question.helperText}
        </p>
      )}

      <div className="mt-6">
        {question.questionType === "single_choice" && (
          <SingleChoiceField
            options={question.options}
            initial={initialAnswer?.optionValue}
            onChange={(v) => onAnswer({ optionValue: v })}
          />
        )}

        {question.questionType === "scale_1_5" && (
          <Scale1to5Field
            initial={initialAnswer?.numericAnswer}
            onChange={(n) => onAnswer({ numericAnswer: n })}
          />
        )}

        {question.questionType === "numeric" && (
          <NumericField
            initial={initialAnswer?.numericAnswer}
            onChange={(n) => onAnswer({ numericAnswer: n })}
          />
        )}

        {question.questionType === "open_text" && (
          <OpenTextField
            initial={initialAnswer?.rawAnswer}
            onChange={(t) => onAnswer({ rawAnswer: t })}
          />
        )}
      </div>
    </div>
  );
}

function SingleChoiceField({
  options,
  initial,
  onChange,
}: {
  options: QuestionOption[];
  initial?: string;
  onChange: (v: string) => void;
}) {
  const [selected, setSelected] = useState<string | undefined>(initial);

  useEffect(() => setSelected(initial), [initial]);

  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        const emoji = OPTION_EMOJI[opt.value] ?? "•";
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              setSelected(opt.value);
              onChange(opt.value);
            }}
            className={`block w-full rounded-[18px] px-4 py-3.5 text-left transition-all active:scale-[0.99] flex items-center gap-3 border-2 ${
              isSelected
                ? "border-claria-ink bg-claria-ink text-claria-cream shadow-[0_4px_14px_rgba(30,21,194,0.25)]"
                : "border-claria-ink/10 bg-white text-claria-ink"
            }`}
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              isSelected ? "bg-white/20" : "bg-claria-ink/[0.05]"
            }`}>
              {emoji}
            </div>
            <span className={`flex-1 text-[14px] font-medium leading-[1.3] ${
              isSelected ? "text-claria-cream" : "text-claria-ink"
            }`}>
              {opt.label}
            </span>
            {isSelected && (
              <div className="h-5 w-5 rounded-full bg-claria-cream text-claria-ink flex items-center justify-center text-[11px] font-medium shrink-0">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Scale1to5Field({
  initial,
  onChange,
}: {
  initial?: number;
  onChange: (n: number) => void;
}) {
  const [value, setValue] = useState<number | undefined>(initial);

  useEffect(() => setValue(initial), [initial]);

  return (
    <div>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                setValue(n);
                onChange(n);
              }}
              className={`flex-1 aspect-square rounded-2xl text-2xl font-medium transition-all active:scale-95 border-2 ${
                isSelected
                  ? "border-claria-ink bg-claria-ink text-claria-cream shadow-md"
                  : "border-claria-ink/10 bg-white text-claria-ink"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-claria-ink/50">
        <span>Per niente</span>
        <span>Molto</span>
      </div>
    </div>
  );
}

function NumericField({
  initial,
  onChange,
}: {
  initial?: number;
  onChange: (n: number) => void;
}) {
  const [value, setValue] = useState<string>(initial?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        setValue(v);
        const n = parseInt(v, 10);
        if (!isNaN(n)) onChange(n);
      }}
      placeholder="Es. 22"
      className="w-full rounded-2xl border-2 border-claria-ink/10 bg-white px-5 py-4 text-2xl font-medium text-claria-ink focus:border-claria-ink focus:outline-none"
    />
  );
}

function OpenTextField({
  initial,
  onChange,
}: {
  initial?: string;
  onChange: (t: string) => void;
}) {
  const [value, setValue] = useState<string>(initial ?? "");

  return (
    <textarea
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      rows={4}
      className="w-full rounded-2xl border-2 border-claria-ink/10 bg-white px-5 py-4 text-base text-claria-ink focus:border-claria-ink focus:outline-none resize-none"
      placeholder="Scrivi qui…"
    />
  );
}
