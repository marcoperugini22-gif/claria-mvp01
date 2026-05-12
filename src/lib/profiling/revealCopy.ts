/**
 * Claria — Profile Reveal Copy
 * -----------------------------
 * Testi della pagina di "rivelazione del profilo" mostrata al termine
 * dell'onboarding. Ogni profilo ha un copy dedicato che segue rigorosamente
 * le linee guida del toneEngine (niente giudizio, niente colpa, valorizzazione).
 *
 * Approvato il principio §7.1: "questo è come ti relazioni con i soldi *adesso*,
 * non è chi sei". Tutti i copy lo rispettano.
 */

import { PsychoFinancialProfile } from "./types";

export interface ProfileRevealCopy {
  /** Titolo principale mostrato dopo "Il tuo profilo è…" */
  headline: string;
  /** Frase di accoglienza */
  subline: string;
  /** 3 caratteristiche, formulate al positivo */
  traits: string[];
  /** Cosa Claria farà di diverso per loro */
  whatClariaWillDo: string;
  /** Promemoria che il profilo non è un'etichetta fissa */
  disclaimer: string;
  /** Call to action verso la dashboard */
  ctaLabel: string;
}

export const profileRevealMap: Record<PsychoFinancialProfile, ProfileRevealCopy> = {
  RIMANDATORE_STRATEGICO: {
    headline: "Rimandatore Strategico",
    subline:
      "Conosci la teoria. Quello che ti manca non è la consapevolezza, è il momento giusto per partire.",
    traits: [
      "Hai già pensato a cosa dovresti fare con i tuoi soldi.",
      "Le decisioni grandi ti pesano e tendi a rimandarle.",
      "Quando finalmente parti, di solito vai più lontano di quanto pensavi.",
    ],
    whatClariaWillDo:
      "Ti proporremo passi piccoli, uno alla volta. Niente piani complessi da costruire da zero: solo la prossima cosa da fare, quella davvero piccola.",
    disclaimer:
      "Questo è il modo in cui ti rapporti ai soldi oggi. Non è chi sei, ed è qualcosa che possiamo far evolvere insieme.",
    ctaLabel: "Mostrami il primo passo",
  },

  EVITANTE: {
    headline: "Evitante",
    subline:
      "Va tutto bene. Sei qui, e questo conta più di quello che è successo prima.",
    traits: [
      "Pensare ai soldi ti mette tensione e questo è comprensibile.",
      "Hai sviluppato la capacità di gestire le cose senza farti sopraffare.",
      "Quando hai informazioni chiare e tempo, prendi decisioni buone.",
    ],
    whatClariaWillDo:
      "Useremo un tono leggero e mai allarmistico. Niente numeri rossi sparati in faccia, niente notifiche ansiogene. Mini-consigli da 30 secondi, quando ti va.",
    disclaimer:
      "Questo è il modo in cui ti rapporti ai soldi oggi. Andremo al tuo ritmo, senza pressione.",
    ctaLabel: "Vai con calma, sono pronto/a",
  },

  CONTROLLORE_FRAGILE: {
    headline: "Controllore Fragile",
    subline:
      "Hai tutto sotto controllo. La domanda interessante è: quanto di quel controllo puoi delegare a noi?",
    traits: [
      "Hai un'attenzione precisa ai dettagli finanziari.",
      "Pianifichi e questo ti dà sicurezza, ma a volte stanca.",
      "Apprezzi chiarezza, precisione e regole definite.",
    ],
    whatClariaWillDo:
      "Ti mostreremo cosa Claria può automatizzare per te, in modo che tu non debba controllare manualmente. Dati precisi, storico completo, regole programmabili.",
    disclaimer:
      "Questo è il modo in cui ti rapporti ai soldi oggi. Possiamo lasciare un po' di tutto questo a noi.",
    ctaLabel: "Vediamo la dashboard",
  },

  IMPULSIVO_CONSAPEVOLE: {
    headline: "Impulsivo Consapevole",
    subline:
      "Le decisioni veloci capitano. La parte importante è che le riconosci, e quella si chiama consapevolezza.",
    traits: [
      "Sai cosa significa una decisione presa di slancio.",
      "Te ne accorgi anche dopo, e questo è già un superpotere.",
      "Quando hai un buon motivo concreto per fermarti, lo fai.",
    ],
    whatClariaWillDo:
      "Costruiremo insieme una pausa decisionale. Esempi concreti per vedere cosa significherebbe quella spesa per i tuoi obiettivi. Nessun giudizio, solo prospettiva.",
    disclaimer:
      "Questo è il modo in cui ti rapporti ai soldi oggi. È modificabile, e il primo passo l'hai già fatto.",
    ctaLabel: "Costruiamo la mia pausa",
  },
};

/**
 * Copy speciale per quando il profilo non è stato assegnato
 * (signal_too_weak o ambiguous_top_profiles).
 */
export const unassignedProfileCopy: ProfileRevealCopy = {
  headline: "Vuoi che ti conosca un po' meglio?",
  subline:
    "Dalle tue risposte vedo sfumature interessanti, ma non abbastanza per darti un consiglio davvero su misura.",
  traits: [
    "Hai un rapporto con i soldi che non si lascia incasellare facilmente.",
    "Le tue strategie cambiano a seconda della situazione.",
    "Preferiamo dirti la verità: serve qualche risposta in più.",
  ],
  whatClariaWillDo:
    "Possiamo iniziare con la dashboard nella versione universale, oppure aggiungere 3 domande veloci per profilarti meglio. Decidi tu.",
  disclaimer:
    "Non avere un'etichetta non è un difetto. Significa solo che ci serve un attimo in più per capirti bene.",
  ctaLabel: "Continua all'universale",
};

export function getRevealCopy(
  profile: PsychoFinancialProfile | null
): ProfileRevealCopy {
  if (!profile) return unassignedProfileCopy;
  return profileRevealMap[profile];
}
