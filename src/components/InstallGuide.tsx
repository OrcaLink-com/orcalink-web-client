import type { ReactNode } from 'react';
import { Modal } from './ui';
import { Button } from './ui';
import { brand } from '@orcalink/design-tokens/brand.config';
import { IconExternal, IconPlus, IconSuccess } from './icons';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function Step({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-medium border border-border bg-content2 p-3">
      <span className="text-primary">{icon}</span>
      <span className="text-sm">{children}</span>
    </li>
  );
}

/**
 * Guia de instalação do PWA sob demanda (aberto pelo "Eu"). Mostra o passo a
 * passo para Android (menu do navegador) e iPhone/iPad (Safari → Compartilhar).
 * Destaca a plataforma detectada, mas deixa as duas visíveis.
 */
export function InstallGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ios = isIos();
  const installed = isStandalone();

  return (
    <Modal isOpen={open} onClose={onClose} title={`Instalar o ${brand.name}`}>
      <div className="space-y-5 pb-2">
        {installed ? (
          <div className="flex items-center gap-3 rounded-medium border border-success/30 bg-success/10 p-3">
            <IconSuccess size={20} className="text-success" />
            <span className="text-sm">O app já está instalado neste dispositivo. 🎉</span>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Instale o {brand.name} na tela inicial para abrir como um app, receber notificações e ter acesso rápido.
          </p>
        )}

        <section className={ios ? 'opacity-60' : ''}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Android (Chrome)</p>
          <ol className="space-y-2">
            <Step icon={<IconExternal size={18} />}>
              Abra o menu do Chrome (três pontinhos no canto).
            </Step>
            <Step icon={<IconPlus size={18} />}>
              Escolha <strong>Instalar app</strong> (ou “Adicionar à tela inicial”).
            </Step>
          </ol>
        </section>

        <section className={ios ? '' : 'opacity-60'}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">iPhone / iPad (Safari)</p>
          <ol className="space-y-2">
            <Step icon={<IconExternal size={18} />}>
              Toque em <strong>Compartilhar</strong> na barra do Safari.
            </Step>
            <Step icon={<IconPlus size={18} />}>
              Escolha <strong>Adicionar à Tela de Início</strong>.
            </Step>
          </ol>
          <p className="mt-2 text-xs text-text-muted">
            No iPhone, as notificações só funcionam com o app instalado por aqui (não pelo Safari comum).
          </p>
        </section>

        <Button full variant="secondary" onClick={onClose}>
          Entendi
        </Button>
      </div>
    </Modal>
  );
}
