import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  useAcceptProposal,
  useConfirmVisit,
  useMessages,
  usePay,
  usePricing,
  useQuote,
  useQuoteConversations,
  useRejectProposal,
  useRescheduleVisit,
  useSendMessage,
  useVisits,
} from '../../lib/queries';
import { useQuoteRealtime } from '../../lib/realtime';
import { ChatConversationView } from '../../components/Chat';
import type { ChatActionHandlers, ChatMessage, ChatParticipant } from '../../components/Chat';
import { messagesToChat, toServiceStatus } from './chatAdapter';
import type { Visit } from '../../lib/types';

/**
 * Negociação (cliente × prestador) — agora usando o módulo de chat premium
 * (`ChatConversationView`). As mensagens reais são convertidas pelo adaptador e
 * os cards interativos (proposta/visita/pagamento/avaliação) disparam as
 * mutations existentes do app.
 */
export function NegotiationPage() {
  const { quoteId = '', conversationId = '' } = useParams();
  const navigate = useNavigate();
  useQuoteRealtime(quoteId);
  const { user } = useAuth();

  const quoteQ = useQuote(quoteId);
  const messagesQ = useMessages(conversationId);
  const convsQ = useQuoteConversations(quoteId);
  const visitsQ = useVisits(quoteId, true);
  const sendMessage = useSendMessage(conversationId);
  const acceptProposal = useAcceptProposal(quoteId);
  const rejectProposal = useRejectProposal(quoteId);
  const confirmVisit = useConfirmVisit(quoteId);
  const reschedule = useRescheduleVisit(quoteId);
  const pay = usePay(quoteId);

  const conversation = convsQ.data?.find((c) => c.id === conversationId);
  const proposal = conversation?.latestProposal;
  const quoteStatus = quoteQ.data?.status;
  const isContracted = proposal?.type === 'FINAL' && proposal.status === 'APPROVED';

  const pricingQ = usePricing(quoteId, isContracted || quoteStatus === 'WAITING_PAYMENT');

  const providerVisits = useMemo<Visit[]>(() => {
    if (!conversation) return [];
    return (visitsQ.data ?? [])
      .filter((v) => v.providerId === conversation.counterpartId)
      .sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt));
  }, [visitsQ.data, conversation]);
  const awaitingVisit = providerVisits.find((v) => v.status === 'SUGGESTED' || v.status === 'RESCHEDULED');

  const otherFinalsPending = (convsQ.data ?? []).filter(
    (c) =>
      c.id !== conversationId &&
      c.status === 'ACTIVE' &&
      c.latestProposal?.type === 'FINAL' &&
      c.latestProposal.status === 'PENDING',
  ).length;

  const peer: ChatParticipant | null = conversation
    ? { id: conversation.counterpartId, name: conversation.counterpartName, role: 'provider', online: true }
    : null;

  const messages = useMemo<ChatMessage[]>(() => {
    if (!messagesQ.data || !conversation || !peer) return [];
    const me: ChatParticipant = { id: user?.id ?? 'me', name: 'Você', role: 'client' };
    const list = messagesToChat(messagesQ.data, { me, peer, compareCount: otherFinalsPending });

    // Visita aguardando confirmação do cliente → card interativo no fim.
    if (awaitingVisit) {
      list.push({
        id: `visit-${awaitingVisit.id}`,
        type: 'visit_request',
        sender: peer,
        createdAt: awaitingVisit.scheduledAt ?? awaitingVisit.createdAt,
        payload: {
          visitId: awaitingVisit.id,
          suggestedDate: awaitingVisit.scheduledAt ?? awaitingVisit.createdAt,
          suggestedTime: timeOf(awaitingVisit.scheduledAt),
          providerName: peer.name,
          status: 'pending',
        },
      });
    }
    // Contratado e aguardando pagamento → card de pagamento.
    if (isContracted && quoteStatus === 'WAITING_PAYMENT') {
      list.push({
        id: 'payment-card',
        type: 'payment_request',
        sender: peer,
        createdAt: new Date().toISOString(),
        payload: {
          paymentId: 'quote-payment',
          amountCents: pricingQ.data?.clientTotalCents ?? 0,
          description: 'Pagamento do serviço (fica em custódia até a conclusão).',
          method: 'undefined',
          status: 'pending',
        },
      });
    }
    // Serviço concluído → card de avaliação.
    if (quoteStatus === 'FINISHED') {
      list.push({
        id: 'finished-card',
        type: 'service_finished',
        sender: peer,
        createdAt: new Date().toISOString(),
        payload: { finishedAt: new Date().toISOString() },
      });
    }
    return list;
  }, [messagesQ.data, conversation, peer, user?.id, otherFinalsPending, awaitingVisit, isContracted, quoteStatus, pricingQ.data]);

  const handlers: ChatActionHandlers = {
    onSendMessage: async (t) => {
      await sendMessage.mutateAsync(t);
    },
    onAcceptProposal: async (id) => {
      await acceptProposal.mutateAsync(id);
    },
    onRejectProposal: async (id) => {
      await rejectProposal.mutateAsync(id);
    },
    onCompareProposals: () => navigate(`/orcamento/${quoteId}/propostas`),
    onAcceptVisit: async (visitId) => {
      await confirmVisit.mutateAsync(visitId);
    },
    onSuggestNewDate: async (visitId, date, time) => {
      await reschedule.mutateAsync({ visitId, scheduledAt: `${date}T${time}:00` });
    },
    onPay: async () => {
      const res = await pay.mutateAsync();
      if (res.invoiceUrl) window.open(res.invoiceUrl, '_blank', 'noopener');
    },
    onLeaveReview: () => navigate(`/orcamento/${quoteId}`),
  };

  if (!peer) {
    return <p className="p-6 text-center text-sm text-text-muted">Carregando conversa…</p>;
  }

  return (
    <div className="h-[calc(100dvh-8.5rem)] overflow-hidden rounded-2xl border border-border lg:h-[calc(100dvh-7rem)]">
      <ChatConversationView
        peer={peer}
        serviceStatus={toServiceStatus(quoteStatus)}
        viewer={{ id: user?.id ?? 'me', role: 'client' }}
        messages={messages}
        handlers={handlers}
        loading={messagesQ.isLoading}
        disabled={conversation?.status !== 'ACTIVE'}
        onBack={() => navigate(`/orcamento/${quoteId}`)}
      />
    </div>
  );
}

/** "HH:mm" de um ISO (ou "--:--"). */
function timeOf(iso: string | null): string {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
