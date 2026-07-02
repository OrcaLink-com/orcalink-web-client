import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatLayout } from '../../components/Chat';
import type { ChatActionHandlers, ChatMessage } from '../../components/Chat';
import {
  mockConversations,
  mockMessagesByConversation,
  mockViewer,
} from '../../components/Chat/mockData';
import { IconBack } from '../../components/icons';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Demo isolada do módulo de Chat premium — usa mock data e handlers simulados
 * (aceitar visita, pagar, sugerir data…) que fazem os cards transitarem de
 * estado. NÃO toca no fluxo real do app; serve para revisar o design/UX.
 */
export function ChatDemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>('c1');
  const [byConv, setByConv] = useState<Record<string, ChatMessage[]>>(() =>
    structuredClone(mockMessagesByConversation),
  );

  const messages = useMemo(() => (selectedId ? byConv[selectedId] ?? [] : []), [byConv, selectedId]);

  /** Atualiza mensagens da conversa selecionada (imutável). */
  function patch(update: (msgs: ChatMessage[]) => ChatMessage[]) {
    if (!selectedId) return;
    setByConv((prev) => ({ ...prev, [selectedId]: update(prev[selectedId] ?? []) }));
  }

  /** Ajusta o payload de uma mensagem que casa com o predicado. */
  function patchPayload(match: (m: ChatMessage) => boolean, apply: (m: ChatMessage) => ChatMessage) {
    patch((msgs) => msgs.map((m) => (match(m) ? apply(m) : m)));
  }

  const handlers: ChatActionHandlers = {
    onSendMessage: (text) => {
      patch((msgs) => [
        ...msgs,
        {
          id: `me-${Date.now()}`,
          type: 'text',
          sender: { id: 'me', name: 'Você', role: 'client' },
          createdAt: new Date().toISOString(),
          deliveryStatus: 'read',
          payload: { text },
        },
      ]);
    },

    onAcceptProposal: async (proposalId) => {
      await delay(800);
      patchPayload(
        (m) => m.type === 'proposal' && m.payload.proposalId === proposalId,
        (m) => ({ ...m, payload: { ...m.payload, status: 'accepted' } }) as ChatMessage,
      );
    },
    onRejectProposal: async (proposalId) => {
      await delay(500);
      patchPayload(
        (m) => m.type === 'proposal' && m.payload.proposalId === proposalId,
        (m) => ({ ...m, payload: { ...m.payload, status: 'rejected' } }) as ChatMessage,
      );
    },
    onCompareProposals: () => alert('Abriria a tela de comparar propostas.'),

    onAcceptVisit: async (visitId) => {
      await delay(700);
      patchPayload(
        (m) => (m.type === 'visit_request' || m.type === 'schedule_change') && m.payload.visitId === visitId,
        (m) => ({ ...m, payload: { ...m.payload, status: 'accepted' } }) as ChatMessage,
      );
    },
    onDeclineVisit: async (visitId) => {
      await delay(500);
      patchPayload(
        (m) => (m.type === 'visit_request' || m.type === 'schedule_change') && m.payload.visitId === visitId,
        (m) => ({ ...m, payload: { ...m.payload, status: 'declined' } }) as ChatMessage,
      );
    },
    onSuggestNewDate: async (visitId) => {
      await delay(700);
      patchPayload(
        (m) => m.type === 'visit_request' && m.payload.visitId === visitId,
        (m) => ({ ...m, payload: { ...m.payload, status: 'rescheduled' } }) as ChatMessage,
      );
    },

    onPay: async (paymentId) => {
      await delay(900);
      patchPayload(
        (m) => m.type === 'payment_request' && m.payload.paymentId === paymentId,
        (m) =>
          ({
            ...m,
            payload: { ...m.payload, status: 'paid', paidAt: new Date().toISOString(), receiptUrl: '#' },
          }) as ChatMessage,
      );
    },
    onViewPaymentDetails: () => alert('Abriria os detalhes do pagamento.'),
    onDownloadReceipt: () => alert('Baixaria o recibo.'),

    onStartService: async () => {
      await delay(700);
    },
    onViewService: () => alert('Abriria a tela do serviço.'),
    onLeaveReview: () => alert('Abriria a avaliação do profissional.'),
  };

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 bg-background p-3 text-foreground">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-1 text-sm text-text-muted hover:text-foreground">
          <IconBack size={18} /> Voltar
        </Link>
        <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
          Demo · Chat premium
        </span>
      </div>

      <div className="min-h-0 flex-1">
        <ChatLayout
          conversations={mockConversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onBack={() => setSelectedId(null)}
          viewer={mockViewer}
          messages={messages}
          handlers={handlers}
        />
      </div>
    </div>
  );
}
