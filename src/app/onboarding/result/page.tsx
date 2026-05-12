import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/session";
import { getRevealCopy } from "@/lib/profiling/revealCopy";
import { getToneConfig } from "@/lib/profiling/toneEngine";

export default async function OnboardingResultPage() {
  const userId = getUserIdFromCookie();
  if (!userId) redirect("/onboarding");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      profile: true,
      profileConfidence: true,
      onboardingCompletedAt: true,
      primaryGoal: true,
    },
  });

  if (!user || !user.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const copy = getRevealCopy(user.profile);
  const tone = getToneConfig(user.profile);

  return (
    <main className="px-6 py-10 min-h-dvh flex flex-col">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="text-sm font-medium text-claria-ink/60 uppercase tracking-wider">
          {user.name ? `${user.name}, il tuo profilo è` : "Il tuo profilo è"}
        </p>

        {/* Accent bar che usa il colore semantico del profilo */}
        <div
          className="mt-3 h-1 w-12 rounded-full"
          style={{ backgroundColor: tone.accentColor }}
        />

        <h1 className="mt-3 text-4xl font-bold leading-tight text-claria-ink">
          {copy.headline}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-claria-ink/80">
          {copy.subline}
        </p>
      </div>

      {/* Traits */}
      <div className="mt-10 space-y-4 animate-slide-up">
        {copy.traits.map((trait, i) => (
          <div
            key={i}
            className="flex gap-3 items-start"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div
              className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: tone.accentColor }}
            />
            <p className="text-base leading-relaxed text-claria-ink/90">
              {trait}
            </p>
          </div>
        ))}
      </div>

      {/* What Claria will do */}
      <div className="mt-10 rounded-3xl bg-claria-cream-deep/40 px-6 py-6 animate-slide-up">
        <p className="text-sm font-semibold uppercase tracking-wider text-claria-ink/60 mb-2">
          Cosa cambierà per te in Claria
        </p>
        <p className="text-base leading-relaxed text-claria-ink">
          {copy.whatClariaWillDo}
        </p>
      </div>

      {/* Disclaimer non-giudicante */}
      <p className="mt-6 text-sm leading-relaxed text-claria-ink/60 italic">
        {copy.disclaimer}
      </p>

      {/* CTA */}
      <div className="mt-auto pt-10">
        <Link
          href="/dashboard"
          className="block w-full rounded-2xl py-4 text-center font-semibold shadow-sm transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: tone.accentColor,
            color: "#FFF7CE",
          }}
        >
          {copy.ctaLabel}
        </Link>

        {/* Debug info — utile in fase di test, da rimuovere prima di go-live */}
        {process.env.NODE_ENV === "development" && user.profileConfidence !== null && (
          <p className="mt-4 text-xs text-claria-ink/40 text-center">
            confidence: {(user.profileConfidence * 100).toFixed(1)}%
          </p>
        )}
      </div>
    </main>
  );
}
