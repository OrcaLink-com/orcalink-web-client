import type { ReactNode } from 'react';
import { formatBRL, formatDateTime } from '../../lib/format';
import { paymentsEnabled } from '../../lib/flags';
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

/** Título do marco "contratado" — sem pagamento na plataforma (modo indicação). */
const CONTRACTED_TITLE = paymentsEnabled ? 'Pagamento realizado' : 'Proposta aceita · profissional contratado';

interface RawEvent {
  at: string;
  title: string;
  by: string;
  body?: string;
  conversationId?: string;
  /** Marco ainda em aberto (aguardando alguém agir) — destaca no histórico. */
  pending?: boolean;
  /** Rótulo da ação pendente (ex.: "Confirmar visita"). */
  actionLabel?: string;
}

/**
 * Marcos pós-contratação, derivados do status atual. No **modo indicação** não há
 * "pagamento realizado": o aceite da proposta final já contrata e o passo seguinte
 * é combinar a data de execução. Mostramos explicitamente "Proposta aceita" e
 * "Aguardando data de execução" para o cliente acompanhar sem abrir a conversa.
 * A "Execução agendada" já sai da lista de visitas, então não a repetimos aqui.
 */
function stageMarkers(
  status: Quote['status'],
  hasExecutionVisit: boolean,
): Array<Omit<RawEvent, 'at' | 'by'>> {
  switch (status) {
    case 'PROVIDER_SELECTED':
    case 'WAITING_PAYMENT':
      return [
        {
          title: paymentsEnabled ? 'Proposta aceita · aguardando pagamento' : 'Proposta aceita',
          pending: paymentsEnabled,
          body: paymentsEnabled ? 'Realize o pagamento para contratar o profissional.' : undefined,
          actionLabel: paymentsEnabled ? 'Ir para o pagamento' : undefined,
        },
      ];
    case 'PAID': {
      // Modo indicação: NÃO exibimos nada de pagamento ao cliente (é tudo por fora).
      const markers: Array<Omit<RawEvent, 'at' | 'by'>> = [{ title: CONTRACTED_TITLE }];
      if (!hasExecutionVisit) {
        markers.push({
          title: 'Aguardando data de execução do serviço',
          pending: true,
          body: 'O profissional vai propor a data de execução — você confirma por aqui.',
        });
      }
      return markers;
    }
    case 'EXECUTION_SCHEDULED':
      return [{ title: CONTRACTED_TITLE }];
    case 'IN_PROGRESS':
      return [{ title: CONTRACTED_TITLE }, { title: 'Serviço em execução', pending: true }];
    case 'FINISHED':
      return [{ title: CONTRACTED_TITLE }, { title: 'Serviço concluído' }];
    case 'CANCELED':
      return [{ title: 'Orçamento cancelado' }];
    default:
      return [];
  }
}

/**
 * Histórico de auditoria do orçamento, montado do que já temos (criação + visitas +
 * propostas + estágio atual), com atribuição de prestador (pode haver vários).
 * Retorna do mais recente para o mais antigo (topo = atual).
 *
 * Marcos "em aberto" (aguardando o cliente ou o profissional) ganham destaque
 * (tone amber/current) e, quando for a vez do cliente, um botão de ação que leva
 * direto ao ponto de decisão — assim o cliente vê a pendência sem abrir o chat.
 */
export function buildQuoteTimeline(
  quote: Pick<Quote, 'createdAt' | 'status'>,
  convs: ConversationSummary[],
  visits: Visit[],
  onOpenChat?: (conversationId: string) => void,
  meId?: string,
): TimelineItem[] {
  // Conversa por prestador (para linkar visita/proposta → ação/chat).
  const convByProvider = new Map<string, string>();
  for (const c of convs) convByProvider.set(c.counterpartId, c.id);

  // Conversa contratada (proposta final aprovada) — alvo das ações pós-contratação.
  const contractedConvId = convs.find(
    (c) => c.latestProposal?.type === 'FINAL' && c.latestProposal.status === 'APPROVED',
  )?.id;

  const raw: RawEvent[] = [];

  raw.push({ at: quote.createdAt, title: 'Orçamento criado', by: 'Você' });

  // Marcos do estágio atual (contratação/execução/conclusão).
  const hasExecutionVisit = visits.some((v) => v.type === 'EXECUTION' && v.status !== 'CANCELED');
  for (const m of stageMarkers(quote.status, hasExecutionVisit)) {
    raw.push({ at: new Date().toISOString(), by: 'Você', ...m, conversationId: m.pending ? contractedConvId : undefined });
  }

  for (const v of visits) {
    const at = v.scheduledAt ?? v.createdAt;
    const kind = v.type === 'IN_LOCO' ? 'Visita técnica' : 'Execução';
    // Aguardando a confirmação do cliente (a última sugestão foi do profissional)?
    const awaitingClient =
      (v.status === 'SUGGESTED' || v.status === 'RESCHEDULED') && (!meId || v.lastActorId !== meId);
    raw.push({
      at,
      title: `${kind} ${visitStatusPt[v.status] ?? ''}`.trim(),
      by: v.providerName,
      body: v.scheduledAt ? formatDateTime(v.scheduledAt) : undefined,
      conversationId: convByProvider.get(v.providerId),
      pending: awaitingClient,
      actionLabel: awaitingClient ? `Confirmar ${v.type === 'IN_LOCO' ? 'visita' : 'data'}` : undefined,
    });
  }

  for (const c of convs) {
    const p = c.latestProposal;
    if (!p) continue;
    const tipo = p.type === 'PRE' ? 'estimativa' : 'proposta final';
    const awaitingClient = p.status === 'PENDING';
    raw.push({
      at: p.createdAt,
      title: `Enviou ${tipo} · ${formatBRL(p.amountCents)}`,
      by: c.counterpartName,
      body: proposalOutcomePt[p.status],
      conversationId: c.id,
      pending: awaitingClient,
      actionLabel: awaitingClient ? `Analisar ${tipo}` : undefined,
    });
  }

  raw.sort((a, b) => b.at.localeCompare(a.at));

  return raw.map((e, i) => {
    const action: ReactNode =
      e.conversationId && onOpenChat ? (
        <button
          type="button"
          onClick={() => onOpenChat(e.conversationId as string)}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            e.pending
              ? 'border-warning/50 bg-warning/10 text-warning hover:bg-warning/20'
              : 'border-border text-primary hover:bg-primary/10'
          }`}
        >
          <IconChat size={13} /> {e.actionLabel ?? 'Chat'}
        </button>
      ) : undefined;

    return {
      id: `${i}-${e.at}`,
      meta: `${formatDateTime(e.at)} · ${e.by}`,
      title: e.title,
      body: e.body,
      tone: e.pending ? ('current' as const) : ('done' as const),
      current: i === 0,
      action,
    };
  });
}
