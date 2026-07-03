import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { LuArrowLeft, LuEllipsisVertical } from 'react-icons/lu';
import type { ChatParticipant, ServiceStatus } from './types';
import { MessageAvatar } from './MessageAvatar';

export interface ChatHeaderProps {
  peer: ChatParticipant;
  serviceStatus: ServiceStatus;
  /** Contraparte digitando agora (sobrepõe online/visto por último). */
  peerTyping?: boolean;
  onBack?: () => void;
  onOpenMenu?: (action: 'details' | 'archive' | 'block') => void;
  className?: string;
}

/** "visto por último" humanizado a partir de um ISO. */
function lastSeenLabel(iso?: string): string {
  if (!iso) return 'offline';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'visto por último agora mesmo';
  if (min < 60) return `visto por último há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `visto por último há ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'visto por último ontem';
  return `visto por último em ${new Date(iso).toLocaleDateString('pt-BR')}`;
}

/** Rótulo + accent (classe de cor) de cada status de serviço. */
const STATUS_META: Record<ServiceStatus, { label: string; className: string }> = {
  negotiating: { label: 'Em negociação', className: 'bg-primary/15 text-primary' },
  visit_scheduled: { label: 'Visita agendada', className: 'bg-sky-500/15 text-sky-300' },
  awaiting_payment: { label: 'Aguardando pagamento', className: 'bg-amber-500/15 text-amber-300' },
  hired: { label: 'Contratado', className: 'bg-emerald-500/15 text-emerald-300' },
  in_progress: { label: 'Em execução', className: 'bg-sky-500/15 text-sky-300' },
  finished: { label: 'Concluído', className: 'bg-emerald-500/15 text-emerald-300' },
  canceled: { label: 'Cancelado', className: 'bg-danger/15 text-danger' },
};

export function ChatHeader({ peer, serviceStatus, peerTyping, onBack, onOpenMenu, className = '' }: ChatHeaderProps) {
  const status = STATUS_META[serviceStatus];
  return (
    <header
      className={`flex items-center gap-3 border-b border-border bg-content1/80 px-3 py-2.5 backdrop-blur-xl ${className}`}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-content2 hover:text-foreground lg:hidden"
        >
          <LuArrowLeft size={22} />
        </button>
      )}

      <MessageAvatar participant={peer} size={44} showPresence />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-semibold leading-tight">{peer.name}</h2>
          {peer.headline && (
            <span className="hidden truncate text-xs text-text-muted sm:inline">· {peer.headline}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {peerTyping ? (
            <span className="font-medium text-primary">digitando…</span>
          ) : peer.online ? (
            <>
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-text-muted">online</span>
            </>
          ) : (
            <span className="text-text-muted">{lastSeenLabel(peer.lastSeenAt)}</span>
          )}
        </div>
      </div>

      <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${status.className}`}>
        {status.label}
      </span>

      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            aria-label="Mais opções"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-content2 hover:text-foreground"
          >
            <LuEllipsisVertical size={20} />
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Ações da conversa"
          onAction={(key) => onOpenMenu?.(key as 'details' | 'archive' | 'block')}
        >
          <DropdownItem key="details">Detalhes do serviço</DropdownItem>
          <DropdownItem key="archive">Arquivar conversa</DropdownItem>
          <DropdownItem key="block" className="text-danger" color="danger">
            Bloquear
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </header>
  );
}
