import { useEffect, useRef } from 'react';
import { LuLock } from 'react-icons/lu';
import type { ChatActionHandlers, ChatMessage, ChatViewer } from './types';
import { ChatBubble } from './ChatBubble';
import { ChatDateDivider } from './ChatDateDivider';
import { ChatTyping } from './ChatTyping';
import { useAutoScrollToBottom } from './hooks';
import { sameDay } from './utils';
import { SystemCard } from './ActionCards/SystemCard';
import { EventCard } from './ActionCards/EventCard';
import { ProposalCard } from './ActionCards/ProposalCard';
import { VisitRequestCard } from './ActionCards/VisitRequestCard';
import { PaymentRequestCard } from './ActionCards/PaymentRequestCard';
import { QuoteApprovedCard } from './ActionCards/QuoteApprovedCard';
import { ServiceStartedCard } from './ActionCards/ServiceStartedCard';
import { ServiceFinishedCard } from './ActionCards/ServiceFinishedCard';
import { ScheduleChangeCard } from './ActionCards/ScheduleChangeCard';

export interface ChatMessagesProps {
  messages: ChatMessage[];
  viewer: ChatViewer;
  handlers: ChatActionHandlers;
  loading?: boolean;
  peerTyping?: boolean;
  /** id da mensagem a destacar (ex.: aberta a partir de um toast). */
  highlightMessageId?: string;
  className?: string;
}

/**
 * Área rolável de mensagens: fundo premium com gradiente suave, aviso de
 * segurança, separadores de dia, indicador de digitação e roteamento por tipo
 * (bolhas de texto/imagem/arquivo aqui; Action Cards entram no Step 5).
 */
export function ChatMessages({ messages, viewer, handlers, loading, peerTyping, highlightMessageId, className = '' }: ChatMessagesProps) {
  const { ref, onScroll } = useAutoScrollToBottom<HTMLDivElement>(`${messages.length}:${peerTyping ? 1 : 0}`);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Ao abrir via toast, rola até a mensagem destacada.
  useEffect(() => {
    if (highlightMessageId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightMessageId, messages.length]);

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Mensagens da conversa"
      className={`overflow-y-auto ${className}`}
      style={{
        background:
          'radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--color-brand-primary) 8%, transparent), transparent 60%), var(--color-bg)',
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-1 px-3 py-4 sm:px-5">
        <p className="mx-auto mb-2 flex max-w-sm items-center gap-1.5 rounded-full bg-content1/70 px-3 py-1.5 text-center text-[11px] text-text-muted backdrop-blur">
          <LuLock size={12} className="shrink-0" />
          Mensagens e ações desta conversa ficam registradas com segurança.
        </p>

        {loading && <p className="py-6 text-center text-sm text-text-muted">Carregando…</p>}
        {!loading && messages.length === 0 && (
          <p className="py-6 text-center text-sm text-text-muted">
            Sem mensagens ainda. Escreva algo abaixo para começar.
          </p>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showDay = !prev || !sameDay(prev.createdAt, m.createdAt);
          const mine = m.sender.id === viewer.id;
          const highlighted = highlightMessageId === m.id;
          return (
            <div key={m.id} ref={highlighted ? highlightRef : undefined}>
              {showDay && <ChatDateDivider iso={m.createdAt} />}
              <div
                className={
                  highlighted
                    ? 'animate-pulse rounded-2xl ring-2 ring-primary/60 ring-offset-2 ring-offset-background'
                    : undefined
                }
              >
                <MessageRenderer message={m} mine={mine} handlers={handlers} viewer={viewer} />
              </div>
            </div>
          );
        })}

        {peerTyping && <ChatTyping />}
      </div>
    </div>
  );
}

/**
 * Roteia cada mensagem para o renderizador certo — bolhas (texto/imagem/arquivo)
 * ou Action Card por tipo. Como `message` é união discriminada, cada `case` já
 * recebe o `payload` tipado; os handlers são "curados" com os ids do payload.
 */
function MessageRenderer({
  message,
  mine,
  handlers: h,
}: {
  message: ChatMessage;
  mine: boolean;
  handlers: ChatActionHandlers;
  viewer: ChatViewer;
}) {
  switch (message.type) {
    case 'text':
    case 'image':
    case 'file':
      return <ChatBubble message={message} mine={mine} />;

    case 'system':
      return <SystemCard payload={message.payload} />;

    case 'event':
      return (
        <EventCard
          payload={message.payload}
          mine={mine}
          time={new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        />
      );

    case 'proposal': {
      const p = message.payload;
      return (
        <ProposalCard
          payload={p}
          mine={mine}
          onAccept={h.onAcceptProposal ? () => h.onAcceptProposal!(p.proposalId) : undefined}
          onReject={h.onRejectProposal ? () => h.onRejectProposal!(p.proposalId) : undefined}
          onCompare={h.onCompareProposals}
        />
      );
    }

    case 'visit_request': {
      const p = message.payload;
      return (
        <VisitRequestCard
          payload={p}
          mine={mine}
          onAccept={h.onAcceptVisit ? () => h.onAcceptVisit!(p.visitId) : undefined}
          onDecline={h.onDeclineVisit ? () => h.onDeclineVisit!(p.visitId) : undefined}
          onSuggest={h.onSuggestNewDate ? (d, t) => h.onSuggestNewDate!(p.visitId, d, t) : undefined}
        />
      );
    }

    case 'payment_request': {
      const p = message.payload;
      return (
        <PaymentRequestCard
          payload={p}
          mine={mine}
          onPay={h.onPay ? () => h.onPay!(p.paymentId) : undefined}
          onViewDetails={h.onViewPaymentDetails ? () => h.onViewPaymentDetails!(p.paymentId) : undefined}
          onDownloadReceipt={h.onDownloadReceipt}
        />
      );
    }

    case 'quote_approved': {
      const p = message.payload;
      return (
        <QuoteApprovedCard
          payload={p}
          mine={mine}
          onStartService={h.onStartService ? () => h.onStartService!(p.proposalId) : undefined}
        />
      );
    }

    case 'service_started':
      return <ServiceStartedCard payload={message.payload} mine={mine} onViewService={h.onViewService} />;

    case 'service_finished':
      return (
        <ServiceFinishedCard
          payload={message.payload}
          mine={mine}
          onLeaveReview={h.onLeaveReview}
          onDownloadReceipt={h.onDownloadReceipt}
        />
      );

    case 'schedule_change': {
      const p = message.payload;
      return (
        <ScheduleChangeCard
          payload={p}
          mine={mine}
          onAccept={h.onAcceptVisit ? () => h.onAcceptVisit!(p.visitId) : undefined}
          onDecline={h.onDeclineVisit ? () => h.onDeclineVisit!(p.visitId) : undefined}
        />
      );
    }

    default:
      return null;
  }
}
