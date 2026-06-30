import { useEffect, useState } from 'react';
import { Modal } from './ui';
import { Button } from './ui';
import { brand } from '@orcalink/design-tokens/brand.config';
import { IconClose, IconExternal, IconPlus } from './icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

/**
 * Experiência de instalação do PWA:
 *  - Android/Chrome: captura `beforeinstallprompt` → banner elegante com "Instalar".
 *  - iOS/Safari: detecta o dispositivo → modal com passo a passo (Compartilhar → Adicionar à Tela de Início).
 * Não reaparece após instalar (standalone) ou dismiss (localStorage).
 */
export function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS não dispara beforeinstallprompt — mostra instruções após um pequeno delay.
    let t: number | undefined;
    if (isIos()) t = window.setTimeout(() => setShowIos(true), 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      if (t) clearTimeout(t);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setShowAndroid(false);
    setShowIos(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (showAndroid) {
    return (
      <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-large border border-border bg-content2 p-4 shadow-pop">
        <div className="flex items-start gap-3">
          <img src="/pwa-source.svg" alt="" className="h-10 w-10 rounded-medium" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Instale o {brand.name}</p>
            <p className="text-xs text-text-muted">Acesso rápido, como um app, direto da sua tela inicial.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={install}>
                Instalar
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Agora não
              </Button>
            </div>
          </div>
          <button onClick={dismiss} aria-label="Fechar" className="text-text-muted hover:text-foreground">
            <IconClose size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={showIos} onClose={dismiss} title={`Instalar o ${brand.name}`}>
      <div className="space-y-4 pb-2">
        <p className="text-sm text-text-muted">
          No iPhone/iPad, instale em 2 passos pelo Safari:
        </p>
        <ol className="space-y-3">
          <li className="flex items-center gap-3 rounded-medium border border-border bg-content2 p-3">
            <IconExternal size={20} className="text-primary" />
            <span className="text-sm">
              Toque em <strong>Compartilhar</strong> na barra do Safari.
            </span>
          </li>
          <li className="flex items-center gap-3 rounded-medium border border-border bg-content2 p-3">
            <IconPlus size={20} className="text-primary" />
            <span className="text-sm">
              Escolha <strong>Adicionar à Tela de Início</strong>.
            </span>
          </li>
        </ol>
        <Button full variant="secondary" onClick={dismiss}>
          Entendi
        </Button>
      </div>
    </Modal>
  );
}
