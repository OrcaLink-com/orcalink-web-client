/**
 * Consentimento LGPD (armazenamento local + notificações).
 *
 * O app usa armazenamento ESSENCIAL (token de login/sessão) — necessário para
 * funcionar. As NOTIFICAÇÕES (push) são opcionais; se o usuário recusar aqui, o
 * `initPush` nem tenta registrar. A escolha fica só no navegador do usuário.
 */
export const CONSENT_KEY = 'orcalink:consent:v1';

export interface ConsentChoice {
  essential: true; // sempre ligado (login/sessão) — sem isso o app não funciona
  notifications: boolean; // push/notificações (opcional)
  ts: string;
}

export function getConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentChoice) : null;
  } catch {
    return null;
  }
}

export function setConsent(notifications: boolean): ConsentChoice {
  const choice: ConsentChoice = { essential: true, notifications, ts: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
  } catch {
    /* localStorage indisponível → segue sem persistir */
  }
  return choice;
}

/** Já houve uma decisão (esconde o banner). */
export function hasConsentDecision(): boolean {
  return getConsent() !== null;
}

/** O usuário recusou explicitamente notificações → não inicializar o push. */
export function notificationsDenied(): boolean {
  return getConsent()?.notifications === false;
}
