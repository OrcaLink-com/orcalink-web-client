import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent } from '../lib/consent';
import { Button } from './ui';

/**
 * Banner de consentimento (LGPD). Aparece na primeira visita (enquanto não há
 * decisão salva). Privacy-first: explica o armazenamento essencial e deixa o
 * usuário aceitar ou recusar as notificações opcionais.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(() => getConsent() === null);
  if (!visible) return null;

  function decide(notifications: boolean) {
    setConsent(notifications);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4">
      <div className="mx-auto max-w-2xl rounded-large border border-border bg-content1/95 p-4 shadow-pop backdrop-blur">
        <p className="text-sm font-semibold">Sua privacidade</p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          Usamos armazenamento essencial para manter você conectado (login e sessão). Opcionalmente,
          enviamos notificações sobre seus orçamentos — você decide. Saiba mais na{' '}
          <Link to="/privacidade" className="text-primary underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button size="sm" onClick={() => decide(true)}>
            Aceitar tudo
          </Button>
          <Button size="sm" variant="secondary" onClick={() => decide(false)}>
            Apenas essenciais
          </Button>
        </div>
      </div>
    </div>
  );
}
