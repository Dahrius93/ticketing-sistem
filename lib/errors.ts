/**
 * Errore il cui messaggio è scritto PER L'UTENTE e può essere mostrato così com'è.
 *
 * Serve a distinguerlo da tutto il resto. Prima non c'era, e `renderError`
 * rimandava in faccia all'utente il messaggio di QUALUNQUE errore: è così che
 * un errore di Prisma gli ha mostrato il nome di una tabella, il percorso di un
 * file compilato e un pezzo di query. In produzione è anche una fuga di
 * informazioni sulla struttura del database.
 *
 * Regola: se un messaggio non è stato scritto pensando a chi lo leggerà, non è
 * un UserError e non va mostrato.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

/** Messaggio generico per tutto ciò che l'utente non deve vedere. */
export const GENERIC_ERROR =
  "Qualcosa è andato storto. Riprova, e se insiste segnalacelo.";
