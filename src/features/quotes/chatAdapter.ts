import type { ChatMessage, ChatParticipant, ProposalPayload, ServiceStatus } from '../../components/Chat';
import type { Message, Proposal, QuoteStatus } from '../../lib/types';

/** QuoteStatus (backend) → status de serviço do módulo de chat. */
const STATUS_MAP: Record<QuoteStatus, ServiceStatus> = {
  CREATED: 'negotiating',
  WAITING_PROPOSALS: 'negotiating',
  IN_NEGOTIATION: 'negotiating',
  PROVIDER_SELECTED: 'awaiting_payment',
  WAITING_PAYMENT: 'awaiting_payment',
  PAID: 'hired',
  EXECUTION_SCHEDULED: 'hired',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CANCELED: 'canceled',
};

export function toServiceStatus(q?: QuoteStatus): ServiceStatus {
  return q ? STATUS_MAP[q] : 'negotiating';
}

/** Proposal (backend) → payload do ProposalCard. */
export function toProposalPayload(p: Proposal, compareCount?: number): ProposalPayload {
  return {
    proposalId: p.id,
    kind: p.type === 'PRE' ? 'estimate' : 'final',
    amountCents: p.amountCents,
    amountMinCents: p.amountMinCents ?? undefined,
    amountMaxCents: p.amountMaxCents ?? undefined,
    description: p.description,
    leadTimeDays: p.leadTimeDays ?? undefined,
    warrantyDays: p.warrantyDays ?? undefined,
    paymentMethods: p.paymentMethods,
    notes: p.notes ?? undefined,
    requestsVisit: p.requestsVisit,
    status: p.status === 'PENDING' ? 'pending' : p.status === 'REJECTED' ? 'rejected' : 'accepted',
    compareCount,
  };
}

/**
 * Converte as mensagens reais do app (`Message[]`) para `ChatMessage[]` do
 * módulo. Cards interativos de visita/pagamento/avaliação são injetados pela
 * própria tela (dependem de estado do orçamento), não das mensagens.
 */
export function messagesToChat(
  messages: Message[],
  ctx: { me: ChatParticipant; peer: ChatParticipant; compareCount?: number },
): ChatMessage[] {
  const senderOf = (senderId: string | null): ChatParticipant =>
    senderId == null
      ? { id: 'system', name: 'Sistema', role: 'system' }
      : senderId === ctx.me.id
        ? ctx.me
        : ctx.peer;

  const out: ChatMessage[] = [];
  for (const m of messages) {
    const sender = senderOf(m.senderId);
    const base = { id: m.id, sender, createdAt: m.createdAt };
    const mine = sender.id === ctx.me.id;

    switch (m.type) {
      case 'TEXT':
        out.push({ ...base, type: 'text', payload: { text: m.body ?? '' }, deliveryStatus: mine ? 'read' : undefined });
        break;
      case 'IMAGE':
        out.push({ ...base, type: 'image', payload: { url: m.body ?? '' } });
        break;
      case 'PROPOSAL':
        if (m.proposal) out.push({ ...base, type: 'proposal', payload: toProposalPayload(m.proposal, ctx.compareCount) });
        break;
      case 'PROPOSAL_ACCEPTED':
        out.push({ ...base, type: 'system', payload: { text: m.body ?? 'Proposta aceita', icon: 'check' } });
        break;
      case 'PROPOSAL_REJECTED':
        out.push({ ...base, type: 'system', payload: { text: m.body ?? 'Proposta recusada', icon: 'info' } });
        break;
      case 'VISIT_CONFIRMED':
        out.push({ ...base, type: 'system', payload: { text: m.body ?? 'Visita confirmada', icon: 'calendar' } });
        break;
      case 'VISIT_REQUEST':
      case 'VISIT_RESCHEDULED':
      case 'SYSTEM':
        if (m.body) out.push({ ...base, type: 'system', payload: { text: m.body, icon: 'info' } });
        break;
    }
  }
  return out;
}
