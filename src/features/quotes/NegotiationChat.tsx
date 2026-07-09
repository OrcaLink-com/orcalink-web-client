import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { setActiveConversation } from '../../lib/activeChat';
import {
  useAcceptProposal,
  useCancelVisit,
  useComplete,
  useCompleteVisit,
  useConfirmVisit,
  useMessages,
  usePay,
  usePricing,
  useProfile,
  useCreateReview,
  useQuote,
  useQuoteConversations,
  useRejectProposal,
  useReopenConversation,
  useRescheduleVisit,
  useReview,
  useSendMessage,
  useVisits,
} from '../../lib/queries';
import { usePeerTyping, usePresence, useQuoteRealtime, useTypingSignal } from '../../lib/realtime';
import { ChatConversationView } from '../../components/Chat';
import type { ChatActionHandlers, ChatMessage, ChatParticipant, ProposalPayload } from '../../components/Chat';
import { ProposalDocument } from '../../components/ProposalDocument';
import { APP_TZ } from '../../lib/format';
import { messagesToChat, toServiceStatus } from './chatAdapter';
import { computeNextStep } from './nextStep';
import { NextStepBanner } from '../../components/NextStepBanner';
import { NextActionCard } from '../../components/NextActionCard';
import { ReviewComposer } from '../../components/ReviewComposer';
import { VisitManageCard } from '../../components/VisitManageCard';
import { LuCalendarCheck, LuCircleCheck, LuRotateCcw } from 'react-icons/lu';
import type { Visit } from '../../lib/types';

interface NegotiationChatProps {
  quoteId: string;
  conversationId: string;
  /** Chamado pelo botão "voltar" do cabeçalho (fecha o drawer ou volta de página). */
  onBack: () => void;
}

/**
 * Conteúdo da negociação (cliente × prestador) usando o módulo de chat premium.
 * É **embutível**: não define altura própria — quem monta (página ou Drawer)
 * fornece o container com altura. Converte as mensagens reais pelo adaptador e
 * injeta os cards interativos (proposta/visita/pagamento/avaliação).
 */
export function NegotiationChat({ quoteId, conversationId, onBack }: NegotiationChatProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const highlightMessageId = (location.state as { highlightMessageId?: string } | null)?.highlightMessageId;
  useQuoteRealtime(quoteId);
  const { user } = useAuth();

  // Marca esta conversa como "aberta" → o toaster não notifica mensagens dela.
  useEffect(() => {
    setActiveConversation(conversationId);
    return () => setActiveConversation(null);
  }, [conversationId]);

  const quoteQ = useQuote(quoteId);
  const messagesQ = useMessages(conversationId);
  const convsQ = useQuoteConversations(quoteId);
  const visitsQ = useVisits(quoteId, true);
  const sendMessage = useSendMessage(conversationId);
  const acceptProposal = useAcceptProposal(quoteId);
  const rejectProposal = useRejectProposal(quoteId);
  const confirmVisit = useConfirmVisit(quoteId);
  const completeVisit = useCompleteVisit(quoteId);
  const complete = useComplete(quoteId);
  const reopen = useReopenConversation(quoteId);
  const reschedule = useRescheduleVisit(quoteId);
  const cancelVisit = useCancelVisit(quoteId);
  const pay = usePay(quoteId);
  const reviewQ = useReview(quoteId, quoteQ.data?.status === 'FINISHED');
  const createReview = useCreateReview(quoteId);
  const hasReview = Boolean(reviewQ.data);
  const [reviewOpen, setReviewOpen] = useState(false);

  const conversation = convsQ.data?.find((c) => c.id === conversationId);
  const proposal = conversation?.latestProposal;
  const quoteStatus = quoteQ.data?.status;
  const isContracted = proposal?.type === 'FINAL' && proposal.status === 'APPROVED';

  const awaitingPayment = quoteStatus === 'WAITING_PAYMENT' || quoteStatus === 'PROVIDER_SELECTED';
  const pricingQ = usePricing(quoteId, isContracted || awaitingPayment);

  const providerVisits = useMemo<Visit[]>(() => {
    if (!conversation) return [];
    return (visitsQ.data ?? [])
      .filter((v) => v.providerId === conversation.counterpartId)
      .sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt));
  }, [visitsQ.data, conversation]);
  const awaitingVisit = providerVisits.find((v) => v.status === 'SUGGESTED' || v.status === 'RESCHEDULED');
  const hasCompletedVisit = providerVisits.some((v) => v.type === 'IN_LOCO' && v.status === 'COMPLETED');
  const hasConfirmedVisit = providerVisits.some((v) => v.type === 'IN_LOCO' && v.status === 'CONFIRMED');

  const nextStep = quoteStatus
    ? computeNextStep({
        quoteStatus,
        viewerRole: 'client',
        requiresVisit: conversation?.requiresVisit ?? false,
        latestProposalType: proposal?.type,
        latestProposalStatus: proposal?.status,
        hasCompletedVisit,
        hasPendingVisit: Boolean(awaitingVisit),
        hasConfirmedVisit,
      })
    : null;

  const otherFinalsPending = (convsQ.data ?? []).filter(
    (c) =>
      c.id !== conversationId &&
      c.status === 'ACTIVE' &&
      c.latestProposal?.type === 'FINAL' &&
      c.latestProposal.status === 'PENDING',
  ).length;

  const presence = usePresence(conversation?.counterpartId);
  const peerTyping = usePeerTyping(quoteId, conversation?.counterpartId);
  const notifyTyping = useTypingSignal(quoteId);
  const myProfile = useProfile();

  const peer: ChatParticipant | null = conversation
    ? {
        id: conversation.counterpartId,
        name: conversation.counterpartName,
        avatarUrl: conversation.counterpartAvatarUrl,
        headline: conversation.quoteTitle,
        role: 'provider',
        online: presence.online,
        lastSeenAt: presence.lastSeenAt,
      }
    : null;

  const messages = useMemo<ChatMessage[]>(() => {
    if (!messagesQ.data || !conversation || !peer) return [];
    const me: ChatParticipant = { id: user?.id ?? 'me', name: 'Você', role: 'client', avatarUrl: myProfile.data?.avatarUrl ?? undefined };
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
    // Contratado e aguardando pagamento → card de pagamento com CTA "Pagar agora".
    if (isContracted && awaitingPayment) {
      list.push({
        id: 'payment-card',
        type: 'payment_request',
        sender: peer,
        createdAt: new Date().toISOString(),
        payload: {
          paymentId: 'quote-payment',
          amountCents: pricingQ.data?.clientTotalCents ?? proposal?.amountCents ?? 0,
          description: 'Proposta aprovada! Conclua o pagamento para contratar. O valor fica em custódia até a conclusão do serviço.',
          method: 'undefined',
          status: 'pending',
        },
      });
    }
    // Serviço concluído → card "Serviço concluído" com ação de avaliar (ou a nota já dada).
    if (quoteStatus === 'FINISHED') {
      const finishedAt = reviewQ.data?.createdAt ?? new Date().toISOString();
      list.push({
        id: 'finished-card',
        type: 'service_finished',
        sender: peer,
        createdAt: finishedAt,
        payload: { finishedAt, rating: reviewQ.data?.rating },
      });
    }
    return list;
  }, [messagesQ.data, conversation, peer, user?.id, otherFinalsPending, awaitingVisit, isContracted, quoteStatus, pricingQ.data, reviewQ.data?.rating, reviewQ.data?.createdAt]);

  const [docPayload, setDocPayload] = useState<ProposalPayload | null>(null);

  const handlers: ChatActionHandlers = {
    onSendMessage: async (t) => {
      await sendMessage.mutateAsync(t);
    },
    onTyping: notifyTyping,
    onViewProposalDocument: (p) => setDocPayload(p),
    onAcceptProposal: async (id) => {
      await acceptProposal.mutateAsync(id);
    },
    onRejectProposal: async (id) => {
      await rejectProposal.mutateAsync(id);
    },
    onCompareProposals: () => navigate(`/app/orcamento/${quoteId}/propostas`),
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
    onLeaveReview: () => setReviewOpen(true),
  };

  if (!peer) {
    return <p className="p-6 text-center text-sm text-text-muted">Carregando conversa…</p>;
  }

  // Card de ação premium fixado acima do input (bottom sheet) — próxima ação do cliente.
  const confirmableVisit = providerVisits.find((v) => v.type === 'IN_LOCO' && v.status === 'CONFIRMED');
  let aboveComposer: ReactNode;
  if (reviewOpen && !hasReview && quoteStatus === 'FINISHED') {
    aboveComposer = (
      <ReviewComposer
        onSubmit={async (rating, comment) => {
          await createReview.mutateAsync({ rating, comment });
          setReviewOpen(false);
        }}
      />
    );
  } else if (conversation?.status === 'CLOSED') {
    aboveComposer = (
      <NextActionCard
        tone="primary"
        icon={<LuRotateCcw size={20} />}
        title="Atendimento encerrado"
        description="Precisa falar de novo sobre este serviço? Você pode reabrir a conversa."
        ctaLabel="Reabrir conversa"
        onCta={async () => {
          await reopen.mutateAsync(conversationId);
        }}
      />
    );
  } else if (confirmableVisit && !hasCompletedVisit) {
    aboveComposer = (
      <NextActionCard
        tone="sky"
        icon={<LuCalendarCheck size={20} />}
        title="Confirme que a visita foi realizada"
        description="O profissional só poderá enviar a proposta final após a sua confirmação."
        ctaLabel="Confirmar visita realizada"
        onCta={async () => {
          await completeVisit.mutateAsync(confirmableVisit.id);
        }}
        confirm={{
          description: 'Confirme que o profissional compareceu e realizou a visita técnica.',
          confirmLabel: 'Sim, a visita foi realizada',
        }}
      />
    );
  } else if (quoteStatus === 'IN_PROGRESS') {
    aboveComposer = (
      <NextActionCard
        tone="green"
        icon={<LuCircleCheck size={20} />}
        title="Confirme a conclusão do serviço"
        description="Ao confirmar, liberamos o repasse ao profissional e você poderá avaliar."
        ctaLabel="Confirmar conclusão"
        onCta={async () => {
          await complete.mutateAsync();
        }}
        confirm={{
          description: 'Confirme que o serviço foi concluído a contento. O pagamento será liberado ao profissional.',
          confirmLabel: 'Sim, serviço concluído',
        }}
      />
    );
  }

  // Gerenciar (reagendar/cancelar) um agendamento confirmado — visita técnica
  // ainda não realizada ou execução ainda não iniciada.
  const manageableVisit = providerVisits.find(
    (v) =>
      v.status === 'CONFIRMED' &&
      ((v.type === 'IN_LOCO' && !hasCompletedVisit) ||
        (v.type === 'EXECUTION' && quoteStatus === 'EXECUTION_SCHEDULED')),
  );
  const manageCard =
    manageableVisit && conversation?.status === 'ACTIVE' ? (
      <VisitManageCard
        type={manageableVisit.type}
        scheduledAt={manageableVisit.scheduledAt}
        onReschedule={async (iso, reason) => {
          await reschedule.mutateAsync({ visitId: manageableVisit.id, scheduledAt: iso, reason });
        }}
        onCancel={async (reason) => {
          await cancelVisit.mutateAsync({ visitId: manageableVisit.id, reason });
        }}
      />
    ) : null;

  return (
    <>
      <ChatConversationView
        peer={peer}
        serviceStatus={toServiceStatus(quoteStatus)}
        viewer={{ id: user?.id ?? 'me', role: 'client' }}
        messages={messages}
        handlers={handlers}
        loading={messagesQ.isLoading}
        peerTyping={peerTyping}
        highlightMessageId={highlightMessageId}
        headerBanner={nextStep ? <NextStepBanner step={nextStep} /> : undefined}
        aboveComposer={
          manageCard || aboveComposer ? (
            <>
              {manageCard}
              {aboveComposer}
            </>
          ) : undefined
        }
        disabled={conversation?.status !== 'ACTIVE'}
        autoFocusComposer
        onBack={onBack}
        onOpenMenu={(action) => {
          if (action === 'details' && conversation) navigate(`/app/prestador/${conversation.counterpartId}`);
        }}
      />
      {docPayload && (
        <ProposalDocument open onClose={() => setDocPayload(null)} payload={docPayload} />
      )}
    </>
  );
}

/** "HH:mm" de um ISO (ou "--:--"), no fuso da plataforma. */
function timeOf(iso: string | null): string {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: APP_TZ });
}
