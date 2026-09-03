import { formatBRL, formatDateTime } from '../../lib/format';
import type { ConversationSummary, Quote, Visit } from '../../lib/types';
import type { TimelineItem } from '../../components/ui';
import { IconChat } from '../../components/icons';

const visitStatusPt: Record<string, string> = {
  PENDING: 'pendente',
  SUGGESTED: 'solicitada',
  CONFIRMED: 'confirmada',
  RESCHEDULED: 'reagendada',
  CANCELED: 'cancelada',
  COMPLETED: 'concluída',
};

const proposalOutcomePt: Record<string, string> = {
  PENDING: 'aguardando decisão',
  ACCEPTED: 'aceita',
  APPROVED: 'aceita (contratado)',
  REJECTED: 'recusada',
  FINISHED: 'concluída',
};

/** Marco do estágio atual do orçamento (só os pós-contratação; os demais já saem das visitas/propostas). */
const STAGE_TITLE: Partial<Record<Quote['status'], string>> = {
  WAITING_PAYMENT: 'Proposta aceita · aguardando pagamento',
  PAID: 'Pagamento realizado',
  EXECUTION_SCHEDULED: 'Execução agendada',
  IN_PROGRESS: 'Serviço em execução',
  FINISHED: 'Serviço concluído',
  CANCELED: 'Orçamento cancelado',
};

/**
 * Histórico de auditoria do orçamento, montado do que já temos (criação + visitas +
 * propostas), com atribuição de prestador (pode haver vários). Sem endpoint dedicado.
 * Retorna do mais recente para o mais antigo (topo = atual).
 *
 * `by` identifica o autor do evento ("Você" ou o nome do prestador). Quando o evento
 * é de um prestador com conversa, ganha um botão "Chat" (via `onOpenChat`) para abrir
 * a negociação daquele prestador — ex.: a solicitação de visita leva direto ao chat.
 */
export function buildQuoteTimeline(
  quote: Pick<Quote, 'createdAt' | 'status'>,
  convs: ConversationSummary[],
  visits: Visit[],
  onOpenChat?: (conversationId: string) => void,
): TimelineItem[] {
  // Conversa por prestador (para linkar visita/proposta → chat).
  const convByProvider = new Map<string, string>();
  for (const c of convs) convByProvider.set(c.counterpartId, c.id);

  const raw: Array<{ at: string; title: string; by: string; body?: string; conversationId?: string }> = [];

  raw.push({ at: quote.createdAt, title: 'Orçamento criado', by: 'Você' });

  // Marco do estágio atual (pagamento/execução/conclusão) — antes só aparecia no chat.
  const stageTitle = STAGE_TITLE[quote.status];
  if (stageTitle) raw.push({ at: new Date().toISOString(), title: stageTitle, by: 'Você' });

  for (const v of visits) {
    const at = v.scheduledAt ?? v.createdAt;
    raw.push({
      at,
      title: `${v.type === 'IN_LOCO' ? 'Visita técnica' : 'Execução'} ${visitStatusPt[v.status] ?? ''}`.trim(),
      by: v.providerName,
      body: v.scheduledAt ? formatDateTime(v.scheduledAt) : undefined,
      conversationId: convByProvider.get(v.providerId),
    });
  }

  for (const c of convs) {
    const p = c.latestProposal;
    if (!p) continue;
    const tipo = p.type === 'PRE' ? 'estimativa' : 'proposta final';
    raw.push({
      at: p.createdAt,
      title: `Enviou ${tipo} · ${formatBRL(p.amountCents)}`,
      by: c.counterpartName,
      body: proposalOutcomePt[p.status],
      conversationId: c.id,
    });
  }

  raw.sort((a, b) => b.at.localeCompare(a.at));

  return raw.map((e, i) => ({
    id: `${i}-${e.at}`,
    meta: `${formatDateTime(e.at)} · ${e.by}`,
    title: e.title,
    body: e.body,
    tone: 'done' as const,
    current: i === 0,
    action:
      e.conversationId && onOpenChat ? (
        <button
          type="button"
          onClick={() => onOpenChat(e.conversationId as string)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <IconChat size={13} /> Chat
        </button>
      ) : undefined,
  }));
}
