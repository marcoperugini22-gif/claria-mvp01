# Claria – MVP

Piattaforma web B2B2C Hybrid-AI-based per il financial engagement delle nuove generazioni.

## 📁 Cosa c'è dentro

```
claria-mvp/
├── prisma/
│   └── schema.prisma          ← ⭐ Modello dati completo (Fase 2)
├── src/
│   ├── app/
│   │   ├── globals.css        ← Design tokens del brand (cream + indigo)
│   │   ├── layout.tsx         ← Container mobile-first
│   │   └── page.tsx           ← Landing placeholder
│   └── lib/
│       ├── db.ts              ← Prisma client singleton
│       └── profiling/
│           └── toneEngine.ts  ← Single source of truth per il tono adattivo
├── tailwind.config.ts         ← Colori brand + colori per i 4 profili
├── package.json
└── .env.example
```

## 🚀 Setup (Fase 1)

Da terminale, nella cartella del progetto:

```bash
# 1. Installa le dipendenze
npm install

# 2. Configura le variabili d'ambiente
cp .env.example .env
#    → poi apri .env e inserisci DATABASE_URL e OPENAI_API_KEY

# 3. Crea il database e genera il client Prisma
npm run db:push

# 4. (Opzionale) apri Prisma Studio per ispezionare lo schema
npm run db:studio

# 5. Avvia il dev server
npm run dev
```

Apri http://localhost:3000 sul browser. Per testare la versione mobile vera, apri DevTools → Toggle device toolbar → iPhone/Android.

### Database: opzioni rapide

L'app richiede PostgreSQL. Tre opzioni in ordine di velocità:

1. **Neon** (cloud, gratis, raccomandato per MVP): https://neon.tech → crea un progetto → copia la connection string in `DATABASE_URL`
2. **Supabase**: https://supabase.com → progetto gratis → settings → database → connection string
3. **Locale via Docker**:
   ```bash
   docker run --name claria-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
   # → DATABASE_URL="postgresql://postgres:postgres@localhost:5432/claria?schema=public"
   ```

### OpenAI

Serve solo quando arriveremo al modulo "consigli personalizzati" (Fase 4+). Per ora puoi lasciare la chiave vuota.

## 🧠 I 4 profili psicofinanziari

Sono modellati come `enum` Prisma e guidano l'intera personalizzazione (UI, tono, contenuti, alert).

| Codice                  | Sintesi                              | Strategia UX chiave         |
| ----------------------- | ------------------------------------ | --------------------------- |
| `RIMANDATORE_STRATEGICO` | Sa cosa fare, rimanda                | Step piccolissimi, 1 CTA   |
| `EVITANTE`               | Ansia, evita di guardare             | Tono leggero, mini-consigli |
| `CONTROLLORE_FRAGILE`    | Pianifica troppo, si stressa         | Automazione, precisione     |
| `IMPULSIVO_CONSAPEVOLE`  | Spende d'impulso, poi se ne pente    | Pausa decisionale, alert    |

La logica di tono per ognuno è in `src/lib/profiling/toneEngine.ts`. Questo modulo verrà consumato sia dai componenti React sia dai prompt LLM, per garantire coerenza end-to-end.

## 🗺️ Roadmap fasi

- [x] **Fase 1** — Scaffolding Next.js + TailwindCSS + Prisma
- [x] **Fase 2** — Schema dati (`schema.prisma`)
- [x] **Fase 3** — Onboarding interattivo + motore di scoring profili
- [x] **Fase 4** — Dashboard adattiva (IMPULSIVO_CONSAPEVOLE completo) ← **siamo qui**
- [ ] **Fase 5** — Estendere dashboard agli altri 3 profili + modulo educativo + bias-alert engine
- [ ] **Fase 6** — White-label theming per i partner B2B

## 🧪 Come testare l'MVP completo

1. Setup db come sopra (`npm install` + `.env` + `npm run db:push`)
2. **Seed delle domande:** `npm run db:seed`
3. `npm run dev` → apri http://localhost:3000 (DevTools → modalità mobile)
4. Click "Scopri il tuo profilo"
5. Inserisci email (es. `test1@claria.it`) e completa le 12 domande **rispondendo come un Impulsivo Consapevole** (vedi sotto)
6. Pagina di rivelazione del profilo → click sulla CTA
7. **Dashboard:** prima volta vedrai un loading di ~2s mentre vengono seedati i dati mock (saving goal + 20 transazioni + 1 bias alert), poi appare la dashboard completa

### Per generare il profilo IMPULSIVO_CONSAPEVOLE

Rispondi così alle 8 domande di profilazione:
- Q05: "La apro, ma poi mi distraggo e finisco a guardare altro"
- Q06: "Sì, e di solito succede perché nel frattempo ho speso quei soldi per altro"
- Q07: "Sì, e subito dopo mi sento in colpa o ci ripenso"
- Q08: "Mi mette ansia, preferisco non pensarci troppo" *(oppure neutro per non sporcare con Evitante)*
- Q09: "Vivo abbastanza alla giornata, vediamo come va"
- Q10: "Li uso per qualcosa che mi va, in fondo sono extra"
- Q11: "Cerco la soluzione più veloce per chiudere il problema"
- Q12: "Smettere di comprare cose che poi non uso"

### Per testare altri profili

Cancella il cookie `claria_uid` dal browser e ripeti con email diversa. I pesi sono in `prisma/seed.ts`. La dashboard per ora è ottimizzata per IMPULSIVO_CONSAPEVOLE; per gli altri profili mostra correttamente i widget ma usando il tono/colore del loro profilo (Fase 5 li svilupperà a fondo).

## 🎯 Le 3 funzionalità signature della dashboard

1. **BalanceCard** (saldo adattivo) — niente numeri rossi prominenti, le spese impulsive sono chiamate "decisioni veloci che hai riconosciuto", c'è un toggle per nascondere gli importi (ostrich-friendly)

2. **DecisionPause** (pausa decisionale) — l'utente inserisce una spesa che sta pensando di fare, parte un timer di 60s con il framing del costo opportunità. Alla fine può "rimettere via" i soldi sul goal o procedere con la spesa. Nessun giudizio in entrambi i casi.

3. **GoalProgress** (obiettivo con costo opportunità retrospettivo) — milestone piccole e ravvicinate, e in fondo il "what-if" framing: "se le decisioni veloci di questo mese fossero finite qui, saresti al X%".

Tutti e 3 i widget consumano `tone.accentColor` e `tone.tagline` da `toneEngine.ts`, quindi si adattano automaticamente quando in Fase 5 estenderemo agli altri profili.

## 📐 Note di design

- **Mobile-first**: il container ha `max-w-md` perché l'esperienza target è il telefono. Su desktop la UI rimane centrata e leggibile.
- **Filosofia copy**: mai giudicante. Il denaro è frutto del lavoro dell'utente e merita rispetto, anche quando è stato gestito male in passato.
- **B2B2C ready**: il modello `Partner` abilita white-labeling già nell'MVP. Il routing tenant-aware arriva in Fase 6.
