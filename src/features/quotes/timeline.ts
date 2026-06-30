import { formatBRL, formatDateTime } from '../../lib/format';
import type { ConversationSummary, Quote, Visit } from '../../lib/types';
import type { TimelineItem } from '../../components/ui';

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

/**
 * Histórico de auditoria do orçamento, montado do que já temos (criação + visitas +
 * propostas), com atribuição de prestador (pode haver vários). Sem endpoint dedicado.
 * Retorna do mais recente para o mais antigo (topo = atual).
 *
 * `by` identifica o autor do evento ("Você" ou o nome do prestador) para que, com
 * vários prestadores, dê para saber de quem é cada ação.
 */
export function buildQuoteTimeline(
  quote: Pick<Quote, 'createdAt'>,
  convs: ConversationSummary[],
  visits: Visit[],
): TimelineItem[] {
  const raw: Array<{ at: string; title: string; by: string; body?: string }> = [];

  raw.push({ at: quote.createdAt, title: 'Orçamento criado', by: 'Você' });

  for (const v of visits) {
    const at = v.scheduledAt ?? v.createdAt;
    raw.push({
      at,
      title: `${v.type === 'IN_LOCO' ? 'Visita técnica' : 'Execução'} ${visitStatusPt[v.status] ?? ''}`.trim(),
      by: v.providerName,
      body: v.scheduledAt ? formatDateTime(v.scheduledAt) : undefined,
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
  }));
}
