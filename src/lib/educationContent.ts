/**
 * Library di contenuti educativi.
 * Ogni articolo è scritto in italiano, tono Claria (non-giudicante, pratico,
 * adatto a Gen Z). Nessun riferimento a contenuti di terze parti.
 */

export interface Article {
  slug: string;
  category: "basics" | "bias";
  icon: string;
  title: string;
  subtitle: string;
  readMin: number;
  /** Markdown-like content. Render con whitespace-pre-line. */
  body: string;
}

export const ARTICLES: Record<string, Article> = {
  "budget-personale": {
    slug: "budget-personale",
    category: "basics",
    icon: "📊",
    title: "Come costruire un budget personale che funziona davvero",
    subtitle: "Il metodo 50/30/20 e perché va adattato al tuo stipendio reale.",
    readMin: 3,
    body: `Il "budget" è una parola che suona seria. In realtà è solo una mappa: dove vanno i tuoi soldi ogni mese.

Il metodo più conosciuto si chiama 50/30/20:

  · 50% per i bisogni — affitto, bollette, cibo, trasporti.
  · 30% per i desideri — cene fuori, abbonamenti, vestiti, esperienze.
  · 20% per il risparmio — fondo emergenza, obiettivi, investimenti.

Funziona? In teoria sì. In pratica, se vivi in una città cara con uno stipendio entry-level, il 50% non basta per i bisogni. È normale, non è un fallimento.

La regola da portarsi a casa:
  · Inizia tracciando per UN mese cosa entra e cosa esce, senza giudicare.
  · Vedrai categorie di spesa che non sapevi di avere.
  · Solo allora decidi cosa cambiare. Non prima.

Il primo budget perfetto non esiste. Il primo budget realistico sì.`,
  },

  "fondo-emergenza": {
    slug: "fondo-emergenza",
    category: "basics",
    icon: "🛟",
    title: "Il fondo di emergenza: 3 mesi di spese, o forse meno",
    subtitle: "Quanto mettere via, dove tenerlo, come iniziare con pochi soldi.",
    readMin: 4,
    body: `Il fondo di emergenza è il primo obiettivo finanziario serio. Serve quando succede l'imprevisto: il lavoro che salta, il dentista, il computer che muore.

Quanto mettere via?

La regola classica dice "3-6 mesi di spese". Ma se hai 23 anni e vivi con i tuoi, 6 mesi possono essere un obiettivo enorme e demotivante. Inizia diverso:

  · Step 1 — €500. Copre il 90% degli imprevisti piccoli.
  · Step 2 — 1 mese di spese tue (non di stipendio: di SPESE).
  · Step 3 — 3 mesi, ma solo quando ti senti pronto.

Dove tenerlo?

Non sul conto principale (li spendi). Non in investimenti (potrebbero perdere valore proprio quando ti servono). La soluzione: un conto deposito o un salvadanaio separato dall'app bancaria.

L'errore più comune?

Non averlo, e usarlo come scusa per non iniziare. €10 a settimana per 6 mesi fanno €260. È più dei tuoi €0 attuali.`,
  },

  "interesse-composto": {
    slug: "interesse-composto",
    category: "basics",
    icon: "📈",
    title: "L'interesse composto: la matematica che cambia tutto",
    subtitle: "Perché 100€/mese a 25 anni valgono più di 300€/mese a 40.",
    readMin: 5,
    body: `Einstein lo chiamò "l'ottava meraviglia del mondo". Esagerato? Forse. Importante? Sì.

L'interesse composto è quando i tuoi soldi guadagnano interessi, e poi quegli interessi guadagnano altri interessi.

Esempio numerico (rendimento medio annuo 7%, vicino alla media storica del mercato azionario USA):

  PERSONA A — Inizia a 25 anni
  Mette via €100 al mese per 10 anni, poi smette del tutto.
  A 65 anni avrà: ~€213.000

  PERSONA B — Inizia a 35 anni
  Mette via €100 al mese per 30 anni (3 volte tanto!).
  A 65 anni avrà: ~€122.000

A ha investito €12.000 in totale. B ha investito €36.000. A ha quasi il doppio.

Perché? Il tempo. I primi 10 anni di A continuano a generare rendimenti per gli altri 30.

La lezione operativa:
  · Iniziare presto > iniziare con tanto.
  · Anche €30 al mese da 25 anni valgono moltissimo a 60.
  · Procrastinare costa più della disciplina.

Caveat onesto: il rendimento del mercato non è garantito ogni anno. Quei calcoli sono medie a lungo termine. Ma il principio resta.`,
  },

  "investimenti-base": {
    slug: "investimenti-base",
    category: "basics",
    icon: "🎯",
    title: "Investire da zero: ETF, PAC, e cosa non fare il primo anno",
    subtitle: "Le basi senza marketing.",
    readMin: 6,
    body: `Prima cosa importante: questo non è consiglio finanziario. È divulgazione. Le scelte le fai tu (eventualmente con un consulente vero).

Detto questo, le 4 cose da sapere:

1) ETF — Cosa sono
Un ETF è come un "paniere" di centinaia di azioni in un solo prodotto. Compri un ETF su "tutto il mercato mondiale" e in pratica possiedi un pezzettino di tutte le grandi aziende.
Vantaggio: diversificazione automatica, costi bassi.

2) PAC — Piano di Accumulo Capitale
Invece di investire €5.000 in un colpo, investi €100/mese per 50 mesi.
Vantaggio: spalmi il rischio sui prezzi, non devi "azzeccare il momento giusto" (che è impossibile).

3) Orizzonte temporale
Il mercato sale, scende, fa schifo per 2-3 anni e poi recupera. Investire in azioni con un orizzonte sotto i 5 anni è rischioso. Sotto i 10 anni serve consapevolezza. Sopra i 15-20 anni storicamente paga.

4) Cosa NON fare il primo anno
  · Trading di crypto su exchange sconosciuti.
  · Stock picking ("Apple sicuro vola").
  · Leva finanziaria.
  · Seguire influencer finanziari.
  · Mettere i soldi del fondo emergenza in investimenti.

L'errore più comune: aspettare di "capire bene tutto" prima di iniziare. Il modo migliore per capire è iniziare con piccole somme che puoi permetterti di perdere.`,
  },

  "inflazione-vita-vera": {
    slug: "inflazione-vita-vera",
    category: "basics",
    icon: "🔥",
    title: "L'inflazione spiegata con il prezzo del caffè",
    subtitle: "Perché tenere 10.000€ sul conto è una perdita silenziosa.",
    readMin: 3,
    body: `Il caffè al bar 10 anni fa costava 90 centesimi. Oggi 1,20€. Ecco, è l'inflazione.

Cosa succede ai tuoi soldi:

Se hai €10.000 sul conto corrente fermi per 10 anni, e l'inflazione media è del 3%/anno, dopo 10 anni quei €10.000 comprano roba che vale circa €7.400 di oggi. Hai perso €2.600 senza accorgertene.

I tuoi soldi sono ancora "10.000 numeri sul conto", ma valgono meno cose.

Cosa fare?

Non c'è una risposta sola, ma il principio è: i soldi che non ti servono a breve termine non andrebbero lasciati fermi su un conto a tasso zero.

Opzioni in ordine di rischio crescente:
  · Conto deposito (rendimento basso ma ti protegge dall'inflazione)
  · Titoli di stato a breve termine
  · ETF obbligazionari
  · ETF azionari

Cosa NON significa:
NON significa "investi tutto subito". Significa "il conto corrente non è risparmio, è parcheggio". Il fondo emergenza puoi tenerlo lì. Il resto, valuta.`,
  },

  "diversificazione": {
    slug: "diversificazione",
    category: "basics",
    icon: "🧺",
    title: "Diversificare senza farsi venire il mal di testa",
    subtitle: "Il principio del 'non mettere tutte le uova in un paniere'.",
    readMin: 4,
    body: `Il principio è semplice: se metti tutto su una sola cosa e quella cosa va male, perdi tutto. Se distribuisci, l'impatto del singolo problema si riduce.

Si applica a tre livelli:

1) Diversificare TRA tipi di asset
  · Azioni (alto rischio, alto rendimento atteso)
  · Obbligazioni (rischio medio)
  · Liquidità (rischio basso, rendimento basso)
  · Real estate, oro, ecc.

2) Diversificare DENTRO un tipo di asset
  · Non solo azioni italiane, ma USA, Europa, Asia, mercati emergenti.
  · Non solo big tech, ma anche healthcare, consumi, energia, finanza.
  · Un ETF globale fa tutto questo per te in 1 prodotto.

3) Diversificare nel TEMPO
  · Non investire €10.000 in un singolo giorno. Distribuisci su 6-12 mesi.
  · Si chiama "dollar cost averaging" o PAC.

L'errore tipico:
"Investo tutto su X perché ho una buona sensazione." Le buone sensazioni non sono diversificazione.

La regola pratica:
Se la perdita totale di una posizione ti rovinerebbe la giornata, è troppo concentrata.`,
  },

  // --- BIAS ---

  fomo: {
    slug: "fomo",
    category: "bias",
    icon: "👀",
    title: "FOMO: quando comprare per non rimanere fuori",
    subtitle: "Cripto, hype, sneaker drop. Riconoscere quando compri per paura.",
    readMin: 3,
    body: `FOMO sta per Fear Of Missing Out — la paura di perdersi qualcosa.

In finanza si manifesta così:
  · Il tuo amico fa +200% in 2 mesi sulla crypto X.
  · TikTok è pieno di gente che "ha azzeccato" un investimento.
  · Le sneakers che vuoi escono solo questo weekend.
  · "Se non compro ora, dopo costa di più."

Il pattern è sempre lo stesso: una storia di urgenza + un esempio di successo visibile + la paura di essere quello che resta fuori.

Cosa succede nel cervello:

La FOMO attiva la stessa area della paura di esclusione sociale. Non è "stupidità", è biologia. Riconoscerlo è metà del lavoro.

3 domande da farti prima di cedere alla FOMO:

1) "Lo comprerei anche se nessuno lo sapesse?"
Se l'acquisto fa senso solo come "non perdersi il treno", probabilmente è FOMO.

2) "Conosco davvero quello che sto comprando?"
Se compri perché lo fa qualcun altro, stai comprando la sua decisione, non la tua.

3) "Posso permettermi di perdere questi soldi?"
Se la risposta è no, la FOMO ti sta portando dove non vuoi essere.

La regola dei 24h:
Se senti FOMO, aspetta 24 ore. Il 90% delle "occasioni urgenti" sopravvive al giorno dopo. Il 10% che non sopravvive non era per te.`,
  },

  "loss-aversion": {
    slug: "loss-aversion",
    category: "bias",
    icon: "🛡️",
    title: "Perché perdere 100€ fa più male che vincerne 200",
    subtitle: "L'avversione alla perdita e come ti porta a scelte sbagliate.",
    readMin: 4,
    body: `Kahneman e Tversky (premio Nobel per l'economia) hanno scoperto una cosa controintuitiva: il dolore di perdere €100 è circa 2 volte più forte della gioia di guadagnarne €100.

Questo si chiama avversione alla perdita.

Come ti influenza, in pratica:

1) Vendi le azioni che salgono troppo presto, "per portare a casa il guadagno"
Tieni quelle che scendono "aspettando che torni in pari".
Il risultato: vendi i vincenti, tieni i perdenti.

2) Non investi perché "potrei perdere"
Ma il rischio di NON investire è altrettanto reale: l'inflazione mangia i soldi fermi.
Tu vedi solo il rischio visibile. Quello invisibile è uguale o peggio.

3) Eviti di guardare l'estratto conto quando temi di trovare brutte notizie
Ma il problema continua a esistere, sei tu che non lo vedi.

4) Resti in un investimento che va male per non "ammettere" la perdita
Il costo è già stato pagato. Tenere non lo recupera, lo amplifica.

Come ridimensionare l'avversione alla perdita:

· Imposta in anticipo una regola ("se scende del X%, vendo") e rispettala. Non decidere sotto pressione.
· Pensa in termini di portafoglio totale, non di singola posizione.
· Ricordati che ogni "non perdere" ha un costo opportunità da qualche parte.

Non puoi eliminare il bias. Puoi solo essere consapevole quando si attiva.`,
  },

  "present-bias": {
    slug: "present-bias",
    category: "bias",
    icon: "⏰",
    title: "Il presente vince sempre (e va bene così)",
    subtitle: "Perché è difficile risparmiare per 'te del futuro'.",
    readMin: 3,
    body: `Il "te di oggi" e il "te di tra 10 anni" sono due persone diverse, almeno secondo il tuo cervello.

Il cervello tratta il "te del futuro" un po' come uno sconosciuto. Per lui, è difficile sacrificarsi.

Esempi:
  · "Inizio la dieta lunedì."
  · "Da settembre vado in palestra."
  · "Quando guadagnerò di più, risparmierò."

Tutte queste frasi spostano il sacrificio sul "te del futuro". E lui, povero, non firma il contratto.

Cosa funziona contro il present bias:

1) Automatizza il risparmio
Se devi decidere ogni mese "metto via 100€?", il "te di oggi" troverà sempre un motivo per non farlo.
Imposta un trasferimento automatico il giorno dello stipendio. Lì non decidi più, è già fatto.

2) Rendi tangibile il futuro
Invece di "risparmio per la pensione" (astratto), pensa "metto via per il viaggio in Giappone tra 2 anni" (concreto, visualizzabile).

3) Riduci la frizione del passo piccolo
Non "devo mettere via 200€/mese". Inizia con "metto via 5€ ogni venerdì". Quando diventa abitudine, alza.

4) Premia il "te di oggi" per le scelte del "te del futuro"
Hai messo via i soldi del mese? Festeggia (con qualcosa di piccolo, non con €50 di shopping).

Il present bias non si vince con la forza di volontà. Si vince cambiando il sistema.`,
  },

  "bias-conferma": {
    slug: "bias-conferma",
    category: "bias",
    icon: "🔍",
    title: "Cercare solo quello che ci dà ragione",
    subtitle: "Il bias di conferma negli investimenti.",
    readMin: 4,
    body: `Hai deciso che X è un buon investimento.

Da quel momento, il tuo cervello fa una cosa subdola: cerca attivamente prove che lo conferminino e ignora quelle contrarie.

Si chiama bias di conferma. Lo facciamo tutti.

Si manifesta così:
  · Leggi solo gli articoli che dicono che la tua scelta è giusta.
  · Segui solo gli "esperti" che la pensano come te.
  · Quando senti un'opinione contraria, pensi "non capisce" invece di "potrebbe avere ragione".
  · Negli investimenti, ti convinci che "questa volta è diverso".

Il problema dell'era social:

Gli algoritmi peggiorano il bias di conferma. TikTok, Instagram, YouTube ti mostrano contenuti simili a quelli con cui interagisci. Se segui un finance bro pro-crypto, l'algoritmo te ne mostrerà 20.

Tu pensi di essere informato. In realtà sei in una bolla.

Come limitare il bias di conferma:

1) Cerca attivamente l'opinione opposta
Se sei convinto che X è ottimo, leggi 3 articoli scritti da chi lo critica. Non per cambiare idea, ma per capire i rischi reali.

2) Diversifica le fonti
Newsletter, libri, podcast con prospettive diverse. Anche fastidiose.

3) Chiediti "cosa mi farebbe cambiare idea?"
Se non riesci a immaginare una risposta, sei in un bias di conferma forte.

4) Aspettati di essere d'accordo con te stesso il 60% delle volte, non il 100%
Se ti trovi sempre d'accordo con ogni informazione che ricevi, stai filtrando.

Il bias di conferma non si elimina. Si gestisce con curiosità deliberata verso quello che non ti piace sentire.`,
  },

  overconfidence: {
    slug: "overconfidence",
    category: "bias",
    icon: "🎲",
    title: "L'eccesso di fiducia (e quanto costa)",
    subtitle: "Perché chi pensa di saperne di più di solito guadagna di meno.",
    readMin: 4,
    body: `Studi finanziari hanno mostrato un dato sorprendente: gli investitori che fanno più operazioni guadagnano meno di quelli che ne fanno meno.

Perché? Overconfidence — l'eccesso di fiducia nelle proprie capacità di prevedere il mercato.

Sintomi tipici:

· "Io ci capisco" (anche se hai iniziato 6 mesi fa).
· "Compro e vendo al momento giusto" (statisticamente impossibile a lungo termine).
· "Quella volta avevo previsto X" (ti ricordi quella, dimentichi le altre 10 sbagliate).
· "Gli altri non capiscono il mercato come me."

Il paradosso Dunning-Kruger:

Più sai poco, più pensi di sapere tanto. Quando inizi a sapere veramente, capisci anche quanto non sai. Gli investitori bravi sono spesso quelli più umili.

3 segnali che hai overconfidence:

1) Fai tanti trade
Più trade = più costi, più tasse, più decisioni emotive. I top performer storici (Buffett, Bogle) hanno detenuto posizioni per decenni.

2) Concentri molto su poche posizioni
"Sono sicuro che X esploderà" → la diversificazione è per chi non capisce → poi X non esplode.

3) Ignori i consigli di gente con più esperienza di te
"Quelli sono vecchi, non capiscono la nuova economia." Spoiler: spesso capiscono.

Come ridurre l'overconfidence:

· Tieni un "diario delle previsioni": scrivi cosa pensi succederà, e dopo 6 mesi verifica.
· Riconosci la fortuna quando sei stato fortunato. Non chiamarla bravura.
· La regola "Sleep on it": grandi decisioni di investimento, dormici sopra una notte. Spesso al mattino sembrano meno geniali.

L'investitore migliore è quello che sa di non sapere abbastanza per fare il furbo, e quindi non ci prova.`,
  },

  "acquisti-impulsivi": {
    slug: "acquisti-impulsivi",
    category: "bias",
    icon: "⚡",
    title: "Acquisti impulsivi: cosa succede nel cervello",
    subtitle: "Il momento esatto in cui passi da 'guardo solo' a 'l'ho comprato'.",
    readMin: 3,
    body: `Comprare d'impulso è una cosa che succede in 7-10 secondi.

Il cervello rilascia dopamina anticipata: il piacere è nell'idea di avere quella cosa, non nel possederla davvero.

Per questo, molti acquisti impulsivi sono seguiti da delusione: il piacere era nel "click", non nel prodotto.

I tre acceleratori dell'impulso:

1) Urgenza artificiale
"Solo per oggi", "ultimi 3 pezzi", countdown timer. Il cervello sotto pressione decide peggio.

2) Sconto come ancoraggio
"Da €80 a €40". Anche se €40 è caro per quel prodotto, lo confronti col prezzo "alto" e sembra un affare.

3) One-click checkout
Amazon ha vinto rendendo l'acquisto un singolo tap. Più frizione = meno acquisti d'impulso. Anche €0,30 di "amazon one-click off" basta a farti pensare.

Come allungare il momento "guardo solo" → "compro":

· Regola dei 24 ore (o 30 giorni per importi sopra i €100). Aggiungi al carrello, NON comprare. Se domani la vuoi ancora, vai. La metà delle volte la dimentichi.

· Disinstalla le app di shopping dal telefono. Se devi aprire il browser, già è un freno.

· Rimuovi le carte salvate. Reinserire i 16 numeri è una frizione utile.

· Notifiche shopping → off. Quelle email "TI MANCHIAMO" con sconti sono fatte apposta per riattivarti.

· Cerca il prezzo reale (non quello dopo lo sconto). Se ti sembra troppo caro, lo è.

Niente moralismi:

Comprare per piacere ogni tanto è sano. L'obiettivo non è eliminare le spese ludiche, è separare i "voglio davvero" dai "compro perché mi ha attivato un trigger".`,
  },

  "gestione-emotiva": {
    slug: "gestione-emotiva",
    category: "bias",
    icon: "🌊",
    title: "Quando il denaro tocca le emozioni",
    subtitle: "Ansia, controllo, evitamento. Riconoscerli senza giudizio.",
    readMin: 5,
    body: `Il denaro non è solo numeri. È sicurezza, libertà, ansia, potere, status, vergogna, sollievo.

I tuoi genitori, la tua infanzia, le esperienze che hai fatto: tutto ha formato il tuo modo di sentire i soldi. Si chiamano "money scripts" (Klontz, 2011) e tutti ne abbiamo.

I 4 schemi più comuni:

1) Money Avoidance — Evitamento
"Il denaro corrompe", "non ci penso", "i soldi non sono importanti".
In pratica: eviti di guardare il conto, ritardi le decisioni finanziarie, lavori a stipendi bassi pensando di "non meritare" di più.

2) Money Worship — Adorazione
"Più soldi = più felicità", "non ne ho mai abbastanza".
In pratica: lavori sempre, sacrifichi relazioni, pensi che il prossimo stipendio risolverà.

3) Money Status — Status
"I soldi mostrano chi sei", "devi sembrare di averli".
In pratica: spendi per mostrare, ti indebiti per status, paragoni il tuo stipendio agli altri.

4) Money Vigilance — Vigilanza
"Devi controllare ogni euro", "non si sa mai".
In pratica: ottimo per il risparmio, ma può diventare ansia costante e incapacità di godersi le cose.

Cosa NON è questo articolo:

Non è una diagnosi. Non sei "rotto/a" se ti ritrovi in uno di questi. Sono modi normali di rapportarsi al denaro.

Cosa puoi fare:

· Notare quando il denaro attiva un'emozione forte. Non agire subito, prima nota.

· Chiederti: "questa reazione è proporzionata al fatto, o sta attivando qualcosa di più vecchio?"

· Se l'ansia o l'evitamento sui soldi sta interferendo con la tua vita (relazioni, sonno, salute), parlare con un terapeuta è una decisione finanziaria sensata.

Il denaro è uno strumento. Le emozioni intorno al denaro sono dati. Riconoscerli toglie loro potere.`,
  },

  "pianificazione-acquisti": {
    slug: "pianificazione-acquisti",
    category: "bias",
    icon: "📝",
    title: "La regola dei 30 giorni",
    subtitle: "Una tecnica semplice per gestire i desideri di acquisto.",
    readMin: 3,
    body: `Una delle tecniche più efficaci e meno conosciute per ridurre acquisti inutili: la regola dei 30 giorni.

Come funziona:

Ogni volta che vuoi comprare qualcosa che NON è strettamente necessario (cibo, bollette, trasporti per lavoro) e costa più di €50:

1) Non comprare subito.
2) Scrivi su un foglio (o note app): cosa è, quanto costa, oggi.
3) Aspetta 30 giorni.
4) Se dopo 30 giorni lo vuoi ancora, comprala.

Cosa scoprirai:

· Circa il 60-70% delle cose, dopo 30 giorni, non le vuoi più.
· Quello che vuoi davvero passa il test e diventa un acquisto consapevole, non un impulso.
· Inizi a notare i pattern: "ah, ogni venerdì sera mi viene voglia di comprare X".

Varianti per importi diversi:

· Sotto €20 → regola dei 24 ore.
· €20-100 → regola dei 7 giorni.
· €100-500 → regola dei 30 giorni.
· Sopra €500 → regola dei 90 giorni.

Perché funziona:

Il bias dell'impulso vive di urgenza. Più passa il tempo, più la dopamina anticipatoria si spegne, più decidi col cervello razionale.

Caveat onesto:

Funziona meglio se scrivi davvero la cosa. Se è solo nella testa, la dimentichi e dopo un mese vedi la stessa cosa e ricomincia il ciclo.

Bonus: alla fine dell'anno guarda la lista dei "30 giorni passati e non l'ho più voluto". Quei soldi non spesi sono il tuo risparmio invisibile.`,
  },
};

export function getArticle(slug: string): Article | null {
  return ARTICLES[slug] ?? null;
}
