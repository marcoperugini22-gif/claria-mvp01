"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EducationProfileWidget, useEduProfile } from "./EducationProfile";

interface EducationCard {
  slug: string;
  category: "basics" | "bias" | "advanced";
  icon: string;
  iconFrom: string;
  iconTo: string;
  title: string;
  preview: string;
  readMin: number;
  starred?: boolean;
  recommendedFor?: string[];
}

type Filter = "all" | "bias" | "basics";

interface Props {
  cards: EducationCard[];
  userProfile: string | null;
  accentColor: string;
}

export function EducationClient({ cards, userProfile, accentColor }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const { profile, checked, setProfile, getRecommendedSlugs } = useEduProfile();

  const recommended = cards.filter(
    (c) => c.recommendedFor && userProfile && c.recommendedFor.includes(userProfile)
  );
  const basics = cards.filter((c) => c.category === "basics");
  const bias = cards.filter((c) => c.category === "bias");

  const featured = recommended[0] ?? bias.find((c) => c.starred) ?? bias[0];

  // Percorso consigliato dal profilo education
  const eduRecommendedSlugs = profile ? getRecommendedSlugs(profile) : [];
  const eduRecommended = cards.filter((c) => eduRecommendedSlugs.includes(c.slug));

  // Filtered lists
  const filteredBias = filter === "basics" ? [] : bias;
  const filteredBasics = filter === "bias" ? [] : basics;

  return (
    <>
      {/* Profiling widget se non ancora fatto */}
      {checked && !profile && (
        <EducationProfileWidget onProfileSaved={setProfile} />
      )}

      {/* Percorso personalizzato da education profile */}
      {profile && eduRecommended.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="h-1.5 w-1.5 rounded-full inline-block"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 0 4px ${accentColor}33`,
              }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-claria-ink/55">
              Il tuo percorso personalizzato
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("claria_edu_profile");
                setProfile(null);
              }}
              className="ml-auto text-[10px] text-claria-ink/35 underline underline-offset-2"
            >
              Rifare profilo
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {eduRecommended.map((card) => (
              <GridCard key={card.slug} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* Featured card (profilo psicologico utente) */}
      {featured && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="h-1.5 w-1.5 rounded-full inline-block"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 0 4px ${accentColor}33`,
              }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-claria-ink/55">
              {recommended.length > 0 ? "Consigliato per il tuo profilo" : "In evidenza"}
            </p>
          </div>
          <FeaturedCard card={featured} accentColor={accentColor} />
        </section>
      )}

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {(["all", "bias", "basics"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors active:scale-95 ${
              filter === f
                ? "bg-claria-ink text-claria-cream"
                : "bg-white text-claria-ink border border-claria-ink/10"
            }`}
          >
            {f === "all" ? "Tutti" : f === "bias" ? "🧠 Bias" : "📊 Finanza"}
          </button>
        ))}
      </div>

      {/* Carosello Bias */}
      {filteredBias.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[14px] font-medium text-claria-ink tracking-[-0.01em]">
                🧠 Bias comportamentali
              </p>
              <p className="text-[11px] text-claria-ink/55 mt-0.5">
                Le trappole della mente con i soldi
              </p>
            </div>
            <span className="text-[11px] font-medium text-claria-ink/55">
              {filteredBias.length} →
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {filteredBias.map((card) => (
              <CarouselCard key={card.slug} card={card} />
            ))}
            <div className="w-2 shrink-0" />
          </div>
        </section>
      )}

      {/* Griglia Finanza base */}
      {filteredBasics.length > 0 && (
        <section className="mb-7">
          <p className="text-[14px] font-medium text-claria-ink tracking-[-0.01em] mb-3">
            📊 Finanza base
          </p>
          <div className="grid grid-cols-2 gap-2">
            {filteredBasics.map((card) => (
              <GridCard key={card.slug} card={card} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-4 mb-2 text-center text-[11px] text-claria-ink/40">
        Più contenuti in arrivo · Suggerimenti?{" "}
        <Link href="/about" className="underline underline-offset-2">
          Scrivici
        </Link>
      </p>
    </>
  );
}

function FeaturedCard({
  card,
  accentColor,
}: {
  card: EducationCard;
  accentColor: string;
}) {
  return (
    <Link
      href={`/education/${card.slug}`}
      className="block rounded-3xl p-5 relative overflow-hidden active:scale-[0.99] transition-transform"
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 50%, ${accentColor}cc 100%)`,
        boxShadow: `0 12px 32px ${accentColor}4D`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -left-7 w-36 h-36 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 65%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div
            className="h-[46px] w-[46px] rounded-[14px] flex items-center justify-center text-[22px]"
            style={{
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {card.icon}
          </div>
          <span
            className="text-[10px] font-medium tracking-[0.04em] text-white px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {card.readMin} min · {card.category === "bias" ? "BIAS" : "BASE"}
          </span>
        </div>
        <p className="text-[18px] font-medium text-white leading-[1.2] tracking-[-0.015em]">
          {card.title}
        </p>
        <p className="mt-2 text-[12.5px] text-white/85 leading-[1.45]">{card.preview}</p>
        <div
          className="mt-3.5 inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-full text-[12px] font-medium"
          style={{ color: accentColor }}
        >
          Leggi ora
          <span
            className="h-[18px] w-[18px] rounded-full flex items-center justify-center text-white text-[11px]"
            style={{ backgroundColor: accentColor }}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CarouselCard({ card }: { card: EducationCard }) {
  return (
    <Link
      href={`/education/${card.slug}`}
      className="snap-start min-w-[170px] max-w-[170px] bg-white rounded-[18px] p-3.5 border border-claria-ink/[0.04] active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 2px 12px rgba(30,21,194,0.06)" }}
    >
      <div
        className="h-[38px] w-[38px] rounded-xl flex items-center justify-center text-[18px] mb-2.5"
        style={{
          background: `linear-gradient(135deg, ${card.iconFrom} 0%, ${card.iconTo} 100%)`,
        }}
      >
        {card.icon}
      </div>
      <p className="text-[12.5px] font-medium text-claria-ink leading-[1.25] tracking-[-0.005em] mb-1.5">
        {card.title}
      </p>
      <p className="text-[10px] text-claria-ink/50 flex items-center gap-1">
        ⏱ {card.readMin} min
        {card.starred && (
          <>
            <span className="mx-0.5">·</span>
            <span style={{ color: "#F59E0B" }}>⭐</span>
          </>
        )}
      </p>
    </Link>
  );
}

function GridCard({ card }: { card: EducationCard }) {
  return (
    <Link
      href={`/education/${card.slug}`}
      className="bg-white rounded-2xl p-3 border border-claria-ink/[0.04] active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 2px 10px rgba(30,21,194,0.04)" }}
    >
      <div
        className="h-[34px] w-[34px] rounded-[10px] flex items-center justify-center text-[16px] mb-2"
        style={{
          background: `linear-gradient(135deg, ${card.iconFrom} 0%, ${card.iconTo} 100%)`,
        }}
      >
        {card.icon}
      </div>
      <p className="text-[11.5px] font-medium text-claria-ink leading-[1.25] tracking-[-0.005em]">
        {card.title}
      </p>
      <p className="mt-1 text-[9.5px] text-claria-ink/50 flex items-center gap-1">
        {card.readMin} min
        {card.starred && <span style={{ color: "#F59E0B" }}>⭐</span>}
      </p>
    </Link>
  );
}
