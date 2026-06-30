import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  useAcceptProposal,
  useMessages,
  useQuote,
  useQuoteConversations,
  useRejectProposal,
  useSendMessage,
  useVisits,
} from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import { useQuoteRealtime } from '../../lib/realtime';
import { StateLineHeader, type StateLine } from '../../components/StateLineHeader';
import { Avatar, Button, RatingStars, StatusChip } from '../../components/ui';
import {
  IconAgenda,
  IconBack,
  IconCelebrate,
  IconChat,
  IconClose,
  IconExecution,
  IconPayment,
  IconProposal,
  IconScheduled,
  IconStar,
  IconWaiting,
} from '../../components/icons';
import { EventCard, type ProposalActionCtx } from './EventCard';
import { PaymentSection, ReviewSection, VisitItem } from './quoteSections';
import { deriveNegotiationChip } from '../negociacoes/negotiationState';
import type { ConversationSummary, Message, Proposal, Visit } from '../../lib/types';

/**
 * Tela de acompanhamento de uma Negociação (prestador × orçamento) — redesign.
 *
 * Uma única tela com tudo da relação, em ordem cronológica:
 *  - Cabeçalho: avatar + nome + nota + chip do estado da negociação
 *  - State Line (próxima ação em fala humana)
 *  - Card de visita ativa com ações inline (Confirmar / Sugerir nova data)
 *  - Histórico de eventos (mensagens + propostas + visitas) com ações inline
 *  - Composer de mensagens
 */
export function NegotiationPage() {
  const { quoteId = '', conversationId = '' } = useParams();
  useQuoteRealtime(quoteId);
  const { user } = useAuth();
  const quoteQ = useQuote(quoteId);
  const messagesQ = useMessages(conversationId);
  const convsQ = useQuoteConversations(quoteId);
  const visitsQ = useVisits(quoteId, true);
  const sendMessage = useSendMessage(conversationId);
  const acceptProposal = useAcceptProposal(quoteId);
  const rejectProposal = useRejectProposal(quoteId);
  const [text, setText] = useState('');

  const conversation = convsQ.data?.find((c) => c.id === conversationId);
  const proposal = conversation?.latestProposal;

  const providerVisits = useMemo<Visit[]>(() => {
    if (!conversation) return [];
    return (visitsQ.data ?? [])
      .filter((v) => v.providerId === conversation.counterpartId)
      .sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt));
  }, [visitsQ.data, conversation]);

  // Visita aguardando o cliente (a única que precisa de ação inline na timeline).
  const awaitingVisit = providerVisits.find(
    (v) => v.status === 'SUGGESTED' || v.status === 'RESCHEDULED',
  );
  // Id da última mensagem de visita — é onde renderizamos o card interativo (ações no fluxo).
  const awaitingVisitMsgId = useMemo(() => {
    if (!awaitingVisit || !messagesQ.data) return null;
    const visitMsgs = messagesQ.data.filter(
      (m) => m.type === 'VISIT_REQUEST' || m.type === 'VISIT_RESCHEDULED',
    );
    return visitMsgs.length ? visitMsgs[visitMsgs.length - 1].id : null;
  }, [awaitingVisit, messagesQ.data]);

  const isActive = conversation?.status === 'ACTIVE';
  const isBlocked = conversation?.status === 'BLOCKED';
  const canAct = proposal?.status === 'PENDING' && isActive;
  // Este prestador foi contratado? (proposta final aprovada) → pagamento/avaliação no fluxo.
  const isContracted = proposal?.type === 'FINAL' && proposal.status === 'APPROVED';

  const otherFinalsPending = (convsQ.data ?? []).filter(
    (c) =>
      c.id !== conversationId &&
      c.status === 'ACTIVE' &&
      c.latestProposal?.type === 'FINAL' &&
      c.latestProposal.status === 'PENDING',
  ).length;

  const proposalActions: ProposalActionCtx = {
    actionableProposalId: canAct ? proposal?.id : undefined,
    onAccept: (id) => acceptProposal.mutate(id),
    onReject: (id) => rejectProposal.mutate(id),
    accepting: acceptProposal.isPending,
    rejecting: rejectProposal.isPending,
    compareHref: `/orcamento/${quoteId}/propostas`,
    compareCount: otherFinalsPending,
  };
  const actionableProposalId = proposalActions.actionableProposalId;

  const stateLine = useMemo<StateLine>(
    () => deriveStateLine(conversation, proposal, providerVisits, quoteQ.data?.status),
    [conversation, proposal, providerVisits, quoteQ.data?.status],
  );

  // Auto-scroll: leva o card acionável ao topo; senão, vai ao fim. Uma vez por conversa.
  const scrollRef = useRef<HTMLDivElement>(null);
  const actionableRef = useRef<HTMLDivElement | null>(null);
  const didScrollRef = useRef<string | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !messagesQ.data || !conversation) return;
    if (didScrollRef.current === conversationId) return;

    requestAnimationFrame(() => {
      const target = actionableRef.current;
      if (actionableProposalId && target) {
        const cRect = container.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        container.scrollTop += tRect.top - cRect.top - 16;
        didScrollRef.current = conversationId;
      } else if (!actionableProposalId) {
        container.scrollTop = container.scrollHeight;
        didScrollRef.current = conversationId;
      }
    });
  }, [conversationId, messagesQ.data, conversation, actionableProposalId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage.mutateAsync(text.trim());
    setText('');
  }

  const chip = conversation ? deriveNegotiationChip(conversation) : null;

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-border pb-3">
        <Link to={`/orcamento/${quoteId}`} className="text-text-muted hover:text-foreground">
          <IconBack size={20} />
        </Link>
        <Avatar name={conversation?.counterpartName ?? '?'} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold leading-tight">
            {conversation?.counterpartName ?? 'Negociação'}
          </h2>
          {conversation && (
            <RatingStars value={conversation.counterpartRating} count={conversation.counterpartRatingCount} />
          )}
        </div>
        {chip && <StatusChip label={chip.label} varName={chip.varName} size="sm" />}
      </header>

      <div className="my-2.5">
        <StateLineHeader state={stateLine} />
      </div>

      {isBlocked && (
        <div className="mb-2 rounded-md bg-card px-3 py-2 text-center text-xs text-text-muted">
          Esta negociação foi encerrada porque você escolheu outro profissional.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-lg border border-border bg-card/40 p-3">
        {messagesQ.isLoading && <p className="text-text-muted">Carregando…</p>}
        {messagesQ.data?.length === 0 && (
          <p className="text-center text-xs text-text-muted">
            Sem mensagens ainda. Escreva algo abaixo para começar.
          </p>
        )}
        {messagesQ.data?.map((m) => {
          const isActionableCard =
            m.type === 'PROPOSAL' && !!actionableProposalId && m.proposal?.id === actionableProposalId;
          // A visita que aguarda o cliente vira um card interativo no próprio fluxo (sem card fixo no topo).
          if (m.id === awaitingVisitMsgId && awaitingVisit) {
            return (
              <ul key={m.id} className="my-2">
                <VisitItem visit={awaitingVisit} quoteId={quoteId} />
              </ul>
            );
          }
          return (
            <div key={m.id} ref={isActionableCard ? actionableRef : undefined}>
              <MessageBubble
                message={m}
                mine={m.senderId === user?.id}
                visits={providerVisits}
                actions={proposalActions}
              />
            </div>
          );
        })}

        {/* Contratado: valor/pagamento e avaliação acontecem dentro da negociação, no fim do fluxo. */}
        {isContracted && (
          <div className="my-2 space-y-2">
            <PaymentSection quoteId={quoteId} status={quoteQ.data?.status ?? 'WAITING_PAYMENT'} />
            <ReviewSection quoteId={quoteId} status={quoteQ.data?.status ?? 'WAITING_PAYMENT'} />
          </div>
        )}

        {(acceptProposal.isError || rejectProposal.isError) && (
          <p className="mt-2 text-center text-xs text-danger">
            {((acceptProposal.error || rejectProposal.error) as Error)?.message}
          </p>
        )}
      </div>

      <form onSubmit={onSend} className="mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!isActive}
          placeholder={isActive ? 'Escreva uma mensagem…' : 'Conversa encerrada'}
          className="h-11 flex-1 rounded-full border border-border bg-content1 px-4 text-sm outline-none transition-colors focus:border-primary disabled:opacity-60"
        />
        <Button type="submit" disabled={!isActive || sendMessage.isPending}>
          Enviar
        </Button>
      </form>
    </div>
  );
}

function deriveStateLine(
  conv: ConversationSummary | undefined,
  proposal: Proposal | undefined,
  visits: Visit[],
  quoteStatus: string | undefined,
): StateLine {
  const sz = 18;
  if (!conv) return { icon: <IconWaiting size={sz} />, text: 'Carregando…' };
  if (conv.status === 'BLOCKED')
    return { icon: <IconClose size={sz} />, text: 'Negociação encerrada — você contratou outro profissional.' };

  const visitAwaiting = visits.find((v) => v.status === 'SUGGESTED' || v.status === 'RESCHEDULED');
  const visitDone = visits.find((v) => v.status === 'COMPLETED' && v.type === 'IN_LOCO');

  if (proposal?.type === 'FINAL' && proposal.status === 'APPROVED') {
    if (quoteStatus === 'WAITING_PAYMENT')
      return { icon: <IconPayment size={sz} />, text: 'Contratado · falta pagar para destravar a execução.', tone: 'attention' };
    if (quoteStatus === 'PAID')
      return { icon: <IconScheduled size={sz} />, text: 'Pago. Combine a data da execução com este profissional.', tone: 'attention' };
    if (quoteStatus === 'EXECUTION_SCHEDULED')
      return { icon: <IconScheduled size={sz} />, text: 'Execução agendada.', tone: 'success' };
    if (quoteStatus === 'IN_PROGRESS')
      return { icon: <IconExecution size={sz} />, text: 'Em execução — confirme quando estiver pronto.', tone: 'attention' };
    if (quoteStatus === 'FINISHED')
      return { icon: <IconStar size={sz} />, text: 'Serviço concluído — avalie o profissional.', tone: 'attention' };
    return { icon: <IconCelebrate size={sz} />, text: 'Você contratou este profissional.', tone: 'success' };
  }

  if (proposal?.type === 'FINAL' && proposal.status === 'PENDING')
    return { icon: <IconProposal size={sz} />, text: `Proposta final · ${formatBRL(proposal.amountCents)} — decida.`, tone: 'attention' };

  if (visitAwaiting)
    return {
      icon: <IconAgenda size={sz} />,
      text: `Visita ${visitAwaiting.status === 'SUGGESTED' ? 'agendada' : 'reagendada'} — confirme abaixo.`,
      tone: 'attention',
    };

  if (proposal?.type === 'PRE' && proposal.status === 'PENDING')
    return { icon: <IconChat size={sz} />, text: 'Estimativa recebida — decida.', tone: 'attention' };

  if (proposal?.type === 'PRE' && proposal.status === 'ACCEPTED' && !visitAwaiting)
    return { icon: <IconWaiting size={sz} />, text: 'Estimativa aceita · aguardando o profissional agendar a visita.' };

  if (visitDone && !proposal)
    return { icon: <IconWaiting size={sz} />, text: 'Visita realizada · aguardando proposta final.' };

  return { icon: <IconChat size={sz} />, text: 'Conversando.' };
}

function MessageBubble({
  message,
  mine,
  visits,
  actions,
}: {
  message: Message;
  mine: boolean;
  visits: Visit[];
  actions?: ProposalActionCtx;
}) {
  if (message.type === 'TEXT' || message.type === 'IMAGE') {
    return (
      <div className={`my-1 flex ${mine ? 'justify-end' : 'justify-start'}`}>
        <span
          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
            mine ? 'bg-brand text-white' : 'bg-card-2 text-text'
          }`}
        >
          {message.body}
        </span>
      </div>
    );
  }
  return <EventCard message={message} visits={visits} actions={actions} />;
}
