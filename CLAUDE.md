# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # prisma generate + Next.js production build
npm run lint         # ESLint via next lint

npm run db:push      # Sync schema to DB without migration history
npm run db:migrate   # Create and apply a named migration
npm run db:studio    # Open Prisma Studio at localhost:5555
npm run db:seed      # Seed questionnaire questions + answer options
```

Environment: copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL) and `OPENAI_API_KEY`. `OPENAI_API_KEY` can be left blank until Fase 4+ AI features are needed.

PostgreSQL options: **Neon** (recommended for MVP — free tier at neon.tech), **Supabase** (free tier), or local Docker:
```bash
docker run --name claria-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/claria?schema=public"
```

## Architecture

**Full-stack Next.js 14 (App Router) + TypeScript + PostgreSQL via Prisma.**

The app is a mobile-first (`max-w-md` container) psychofinancial engagement platform. Every UX decision—widget tone, copy, colors, LLM prompts—is driven by the user's **psychofinancial profile**, assigned at onboarding.

### Core concepts

**4 psychofinancial profiles** (`src/lib/profiling/types.ts`):
- `RIMANDATORE_STRATEGICO` — strategic procrastinator: encouraging, max 1 action, small milestones
- `EVITANTE` — anxious avoider: soft tone, no red numbers, gentle nudges
- `CONTROLLORE_FRAGILE` — brittle planner: precise data, visible automation, detailed metrics
- `IMPULSIVO_CONSAPEVOLE` — aware impulsive: empathetic, 60-second pause before spending, opportunity-cost framing

**`src/lib/profiling/toneEngine.ts`** is the single source of truth for profile→UX mapping. When building any profile-adaptive feature, start here. It exports `ProfileToneConfig` keyed by profile enum with taglines, UX strategies, accent colors, and LLM instruction snippets.

**`src/lib/profiling/scoring.ts`** assigns profiles: weighted questionnaire answers → normalized scores per profile → confidence-based assignment.

### User flow

```
Landing (/) → Onboarding (/onboarding) → Profile reveal (/onboarding/result) → Dashboard (/dashboard)
```

Onboarding is a 12-question client-side state machine (`start → questions → completing → result`). Questions and weights live in `prisma/seed.ts`.

### Authentication

Cookie-based MVP: `claria_uid` cookie (90-day max-age) set at onboarding start. All session reads go through `src/lib/session.ts`. There is no NextAuth or JWT — replace before production.

### Dashboard

`src/app/dashboard/page.tsx` is a **server component** that fetches all user data (balance, goals, transactions, bias alerts, tasks) and passes it to 11 adaptive client widgets in `src/app/dashboard/_components/`. Widgets adapt tone, color, and behavior based on the user's profile via `toneEngine.ts`.

Task gating: users see a simplified onboarding-tasks view until they complete 3 practical steps (first income entry, first goal, first expense). Logic in `src/lib/onboardingTasks.ts`.

### API routes (`src/app/api/`)

| Group | Routes |
|---|---|
| Onboarding | `start`, `questions`, `answer`, `complete` |
| Transactions | `GET/POST /transactions`, `bulk` |
| Goals | `GET/POST /goals` |
| Dashboard | `proceed-spend`, `dismiss-alert`, `put-away` |
| Admin/dev | `user/reset`, `user/seed-mock` |

### Key libraries

- `src/lib/db.ts` — Prisma singleton (import this, never instantiate `PrismaClient` directly)
- `src/lib/balance.ts` — available balance = income − expenses − saved-to-goals
- `src/lib/profiling/spendingAnalytics.ts` — 30-day impulsivity %, top categories

### Styling

TailwindCSS with brand tokens in `tailwind.config.ts`: cream `#FFF7CE`, indigo `#1E15C2`, and 4 profile accent colors. Use `clsx` + `tailwind-merge` (`src/lib/utils.ts`) for conditional classes.

### Database schema

`prisma/schema.prisma` models include: `User`, `Partner` (B2B2C multi-tenancy), `OnboardingSession`, `Question`/`Answer`, `Transaction`, `Goal`/`Contribution`, `BiasAlert`, `BehavioralEvent`, `EducationContent`/`UserContentProgress`, `AIInteractionLog`.

B2B2C white-labeling (Partner model with slug, brand overrides, module toggles) is schema-ready but not yet surfaced in the UI.

### AI integration

OpenAI SDK is wired up (`openai` package). All AI calls should log to `AIInteractionLog` (useCase, model, tokens, latency, profile snapshot). Default model: `gpt-4o-mini`.

### Copy philosophy

Never judgmental. Money belongs to the user and deserves respect even when it was mismanaged. Impulsive purchases are called "decisioni veloci che hai riconosciuto", never "errori". This applies to all copy: widget labels, alert messages, LLM prompts, empty states.

### Development phase

Fase 4 of 6. `IMPULSIVO_CONSAPEVOLE` dashboard is fully implemented. Fase 5 extends the adaptive dashboard to the other 3 profiles and completes the education + bias detection modules.

### Testing the full MVP flow

1. `npm run db:push && npm run db:seed` — prepare the database
2. `npm run dev` → open http://localhost:3000 in DevTools mobile view
3. Click "Scopri il tuo profilo", enter any email, complete the 12 questions
4. After the profile reveal, the dashboard auto-seeds mock data (~2s) on first load

To force the `IMPULSIVO_CONSAPEVOLE` profile, answer the profiling questions as follows: Q05 "La apro, ma poi mi distraggo…", Q06 "Sì, e di solito succede perché nel frattempo ho speso…", Q07 "Sì, e subito dopo mi sento in colpa…", Q09 "Vivo abbastanza alla giornata…", Q10 "Li uso per qualcosa che mi va…", Q12 "Smettere di comprare cose che poi non uso". Question weights are in `prisma/seed.ts`.

To test a different profile, delete the `claria_uid` cookie in DevTools and repeat with a different email.
