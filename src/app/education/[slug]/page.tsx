import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerUserId } from "@/lib/session";
import { getToneConfig } from "@/lib/profiling/toneEngine";
import { getArticle } from "@/lib/educationContent";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const userId = await getServerUserId();
  if (!userId) redirect("/auth/login");

  const article = getArticle(params.slug);
  if (!article) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profile: true },
  });
  const tone = getToneConfig(user?.profile);

  return (
    <main className="px-5 py-5 min-h-dvh pb-nav">
      {/* Back */}
      <Link
        href="/education"
        className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-medium text-claria-ink/65 active:scale-[0.98]"
      >
        <span className="h-7 w-7 rounded-xl bg-claria-ink/[0.08] flex items-center justify-center text-claria-ink">
          ←
        </span>
        Education
      </Link>

      {/* Category badge + read time */}
      <div className="flex items-center gap-2">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${tone.accentColor}20` }}
        >
          <span className="text-sm">{article.icon}</span>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: tone.accentColor }}
          >
            {article.category === "bias" ? "Bias comportamentale" : "Finanza base"}
          </span>
        </div>
        <span className="text-[10px] font-medium text-claria-ink/50 flex items-center gap-1">
          ⏱ {article.readMin} min
        </span>
      </div>

      <h1 className="mt-4 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-claria-ink">
        {article.title}
      </h1>

      <p className="mt-2 text-[14px] text-claria-ink/65 leading-relaxed">
        {article.subtitle}
      </p>

      {/* Body */}
      <article className="mt-6 text-[14.5px] text-claria-ink/85 leading-[1.7] whitespace-pre-line">
        {article.body}
      </article>

      {/* Footer call-to-action */}
      <div
        className="mt-8 rounded-3xl p-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${tone.accentColor} 0%, ${tone.accentColor}dd 100%)`,
        }}
      >
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/80">
          Ti è stato utile?
        </p>
        <p className="mt-2 text-[16px] font-medium leading-tight">
          Applica subito quello che hai letto.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-[13px] font-medium active:scale-[0.98]"
          style={{ color: tone.accentColor }}
        >
          Vai alla dashboard
          <span
            className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[11px]"
            style={{ backgroundColor: tone.accentColor }}
          >
            →
          </span>
        </Link>
      </div>

      <p className="mt-6 text-center text-[11px] text-claria-ink/40">
        Claria · Education
      </p>

    </main>
  );
}
