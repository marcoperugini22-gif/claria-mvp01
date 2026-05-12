import { PsychoFinancialProfile } from "./types";

/**
 * Profile Tone Engine
 * -------------------
 * Single source of truth per l'adattamento di tono, copy e UX dell'esperienza
 * Claria in base al cluster psicofinanziario dell'utente.
 *
 * Viene consumato da:
 *  - componenti UI della dashboard (per scegliere widget e microcopy)
 *  - prompt dell'LLM (iniettato come "system instruction")
 *  - generatore di BiasAlert (per renderizzare il messaggio)
 */

export interface ProfileToneConfig {
  /** Etichetta leggibile mostrata all'utente (solo dove esplicitato) */
  label: string;
  /** Tag-line non giudicante che descrive il profilo */
  tagline: string;
  /** Direttive di tono per l'LLM */
  toneInstruction: string;
  /** Strategie UX da privilegiare */
  uxStrategies: string[];
  /** Cosa NON fare con questo profilo */
  uxAvoid: string[];
  /** Colore semantico (deve combaciare con tailwind.config -> profile.*) */
  accentColor: string;
}

export const profileToneMap: Record<PsychoFinancialProfile, ProfileToneConfig> = {
  RIMANDATORE_STRATEGICO: {
    label: "Rimandatore Strategico",
    tagline: "Sai cosa fare. Insieme troviamo il primo passo, quello davvero piccolo.",
    toneInstruction:
      "Tono incoraggiante e pragmatico. Riduci la frizione: proponi sempre 1 azione, mai più di 1. " +
      "Evita liste lunghe. Usa frasi brevi. Quando l'utente esita, normalizza l'esitazione e ridimensiona il task.",
    uxStrategies: [
      "Default action sempre visibile come bottone primario",
      "Milestone iniziali piccolissime (es. 'metti via 5€' invece di 50€)",
      "Reminder gentili dopo inattività di 3+ giorni",
      "Celebrare ogni micro-azione completata",
    ],
    uxAvoid: [
      "Mostrare contemporaneamente più CTA",
      "Form lunghi senza progress bar",
      "Linguaggio del tipo 'dovresti' o 'avresti dovuto'",
    ],
    accentColor: "#7C6FF0",
  },

  EVITANTE: {
    label: "Evitante",
    tagline: "Va tutto bene. Diamo un'occhiata insieme, con calma.",
    toneInstruction:
      "Tono rassicurante, leggero e sereno. Non mostrare dati negativi senza contesto. " +
      "Evita numeri grandi e rossi. Apri sempre con qualcosa di positivo. " +
      "Quando l'utente apre la dashboard dopo un periodo di inattività, ringrazialo per essere tornato.",
    uxStrategies: [
      "Soft-onboarding al saldo: prima un riassunto qualitativo, poi i numeri",
      "Mini-consigli da 30 secondi, mai più",
      "Nessuna notifica push allarmante",
      "Possibilità di nascondere/posticipare ogni alert",
    ],
    uxAvoid: [
      "Numeri rossi prominenti",
      "Notifiche allarmistiche",
      "Richieste di azione multiple in un'unica schermata",
      "Linguaggio quantitativo aggressivo ('hai speso il 40% in più')",
    ],
    accentColor: "#F4B860",
  },

  CONTROLLORE_FRAGILE: {
    label: "Controllore Fragile",
    tagline: "Hai tutto sotto controllo. Lascia che alcune cose le gestiamo noi per te.",
    toneInstruction:
      "Tono serio, affidabile, preciso. Niente fronzoli, niente emoji superflue. " +
      "Mostra esattezza: cifre puntuali, date precise, regole chiare. " +
      "Sottolinea cosa è automatizzato e quindi NON richiede il loro controllo manuale.",
    uxStrategies: [
      "Automazione visibile: 'Claria si occupa di X, tu non devi controllare'",
      "Dashboard con metriche numeriche dettagliate",
      "Regole programmabili (es. 'ogni venerdì sposta 10€')",
      "Storico completo accessibile in 1 tap",
    ],
    uxAvoid: [
      "Gamification eccessiva o tono troppo informale",
      "Stime approssimative non motivate",
      "Linguaggio vago ('più o meno', 'circa')",
      "Notifiche frequenti che generano necessità di controllare l'app",
    ],
    accentColor: "#3D5AFE",
  },

  IMPULSIVO_CONSAPEVOLE: {
    label: "Impulsivo Consapevole",
    tagline: "Le decisioni veloci capitano. Costruiamo insieme una pausa.",
    toneInstruction:
      "Tono diretto, empatico, mai colpevolizzante. Usa esempi concreti e situazionali. " +
      "Mostra il 'costo opportunità' di una spesa impulsiva in modo tangibile " +
      "(es. 'questi 30€ = 2 settimane verso il tuo obiettivo viaggio'). " +
      "Quando l'utente riconosce un acquisto impulsivo, ringrazia la consapevolezza, non l'errore.",
    uxStrategies: [
      "Pausa decisionale: timer di 60s prima di completare azioni di spesa",
      "Alert proattivi pre-spesa quando si rilevano pattern (venerdì sera, app shopping, ecc.)",
      "Funzione 'rimetto via' che converte una spesa evitata in saving",
      "Esempi concreti del costo opportunità",
    ],
    uxAvoid: [
      "Tono giudicante o moralizzante",
      "Visualizzazioni che colpevolizzano (es. emoji tristi sui rossi)",
      "Reminder retrospettivi senza azione concreta proposta",
    ],
    accentColor: "#FF7A6B",
  },
};

/**
 * Fallback per utenti che non hanno ancora completato l'onboarding,
 * o per cui la confidence del profilo è troppo bassa.
 */
export const universalTone: ProfileToneConfig = {
  label: "Universale",
  tagline: "Iniziamo a conoscerci. Il tuo modo di gestire i soldi è già una storia, ascoltiamola.",
  toneInstruction:
    "Tono neutro, accogliente, non giudicante. Evita assunzioni sul comportamento dell'utente. " +
    "Invita gentilmente a completare il profilo per ricevere consigli più rilevanti.",
  uxStrategies: [
    "Mostrare il valore dell'onboarding senza pressing",
    "Contenuti educational generalisti finché il profilo non è definito",
  ],
  uxAvoid: ["Personalizzazioni che potrebbero essere off-target", "Tono troppo familiare"],
  accentColor: "#1E15C2",
};

export function getToneConfig(profile: PsychoFinancialProfile | null | undefined): ProfileToneConfig {
  if (!profile) return universalTone;
  return profileToneMap[profile] ?? universalTone;
}
