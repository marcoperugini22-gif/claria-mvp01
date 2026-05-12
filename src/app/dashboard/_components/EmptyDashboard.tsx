"use client";

import Link from "next/link";
import { ResetButton } from "./ResetButton";
import type { OnboardingTask, TaskKey } from "@/lib/onboardingTasks";

interface EmptyDashboardProps {
  userName: string | null;
  profileLabel: string;
  accentColor: string;
  tasks: OnboardingTask[];
  completedCount: number;
}

const TASK_LINKS: Record<TaskKey, string> = {
  FIRST_INCOME: "/transactions/new?type=income",
  FIRST_GOAL: "/goals/new",
  FIRST_EXPENSE: "/transactions/new?type=expense",
};

export function EmptyDashboard({
  userName,
  profileLabel,
  accentColor,
  tasks,
  completedCount,
}: EmptyDashboardProps) {
  const nextTaskIdx = tasks.findIndex((t) => !t.completed);
  const initial = (userName?.charAt(0) ?? "?").toUpperCase();

  return (
    <main className="px-5 py-5 min-h-dvh pb-nav">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-[38px] w-[38px] rounded-full flex items-center justify-center text-claria-cream text-sm font-medium"
            style={{
              background: "linear-gradient(135deg, #1E15C2 0%, #2A20D9 100%)",
              boxShadow: "0 4px 12px rgba(30,21,194,0.2)",
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-claria-ink/50">
              {profileLabel}
            </p>
            <p className="text-[15px] font-medium text-claria-ink tracking-[-0.01em]">
              Ciao {userName ?? ""} <span className="ml-0.5">👋</span>
            </p>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="mt-7">
        <h1 className="text-[26px] font-medium leading-[1.1] tracking-[-0.03em] text-claria-ink">
          Iniziamo a conoscerci
          <br />
          <span className="font-serif italic font-normal">davvero.</span>
        </h1>
        <p className="mt-2 text-[13.5px] text-claria-ink/65 leading-[1.5]">
          {completedCount === 0 ? (
            <>
              {tasks.length} piccoli passi e Claria diventa{" "}
              <span className="text-claria-ink font-medium">davvero tua</span>.
            </>
          ) : completedCount < tasks.length ? (
            "Bene così. Manca poco per finire l'allestimento."
          ) : (
            "Tutto pronto! 🎉"
          )}
        </p>

        <div className="mt-4 flex items-center gap-1.5">
          {tasks.map((t) => (
            <div
              key={t.key}
              className="flex-1 h-1.5 rounded-full transition-colors duration-500"
              style={{
                backgroundColor: t.completed
                  ? accentColor
                  : "rgba(30, 21, 194, 0.12)",
              }}
            />
          ))}
          <span className="ml-1 text-[11px] font-medium text-claria-ink/60 tabular-nums">
            {completedCount} / {tasks.length}
          </span>
        </div>
      </section>

      {/* Task list */}
      <section className="mt-5 flex flex-col gap-2.5">
        {tasks.map((task, i) => {
          if (task.completed) {
            return (
              <div
                key={task.key}
                className="bg-white rounded-3xl px-4 py-3.5 flex items-center gap-3 opacity-70"
                style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
              >
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  ✓
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-claria-ink line-through decoration-claria-ink/30">
                    {task.title}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-claria-ink/40">
                  fatto
                </span>
              </div>
            );
          }

          if (i === nextTaskIdx) {
            return (
              <Link
                key={task.key}
                href={TASK_LINKS[task.key]}
                className="rounded-[22px] p-[18px] relative overflow-hidden active:scale-[0.99] transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}ee 50%, ${accentColor}dd 100%)`,
                  boxShadow: `0 10px 28px ${accentColor}40`,
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)",
                  }}
                />
                <div className="relative">
                  <div
                    className="inline-block px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <span className="text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
                      Passo {i + 1} di {tasks.length}
                    </span>
                  </div>
                  <p className="mt-3 text-[18px] font-medium text-white leading-[1.2] tracking-[-0.015em]">
                    {task.title}
                  </p>
                  <p className="mt-1.5 text-[12px] text-white/85 leading-[1.4]">
                    {task.subtitle}
                  </p>
                  <div
                    className="mt-3.5 inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-[13px] font-medium"
                    style={{ color: accentColor }}
                  >
                    Inizia
                    <span
                      className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[11px]"
                      style={{ backgroundColor: accentColor }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          }

          // Locked
          return (
            <div
              key={task.key}
              className="bg-white rounded-3xl px-4 py-3.5 flex items-center gap-3 opacity-55"
              style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
            >
              <div className="h-8 w-8 rounded-xl bg-claria-ink/[0.08] flex items-center justify-center text-claria-ink/60 text-sm">
                🔒
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-claria-ink leading-tight">
                  {task.title}
                </p>
                <p className="text-[11px] text-claria-ink/55 mt-0.5">
                  {task.subtitle}
                </p>
              </div>
              <span className="text-[11px] font-medium text-claria-ink/40">
                Passo {i + 1}
              </span>
            </div>
          );
        })}
      </section>

      {/* Promessa AI */}
      <section className="mt-5">
        <div className="bg-claria-ink/[0.06] rounded-[18px] px-4 py-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-claria-ink flex items-center justify-center text-claria-cream text-base">
            ✨
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-claria-ink">
              Sblocca consigli AI personalizzati
            </p>
            <p className="text-[11px] text-claria-ink/60 mt-0.5">
              Completa i {tasks.length} passi qui sopra
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 pt-4 border-t border-claria-ink/[0.08] flex items-center justify-between">
        <span className="text-[11px] font-medium text-claria-ink/40 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-soft-pulse" />
          Claria · Beta
        </span>
        <ResetButton />
      </div>
    </main>
  );
}
