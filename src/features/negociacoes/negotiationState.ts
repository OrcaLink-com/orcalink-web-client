import type { ConversationSummary } from '../../lib/types';

export interface NegotiationChip {
  label: string;
  varName: string;
  /** Há ação esperada do cliente (ex.: proposta pendente para aceitar). */
  pending: boolean;
}

/**
 * Deriva um chip compacto de estado da negociação a partir do summary
 * (latestProposal + status). Usado na lista global de Negociações, que não
 * carrega as visitas — o detalhe da visita aparece na tela de acompanhamento.
 */
export function deriveNegotiationChip(conv: ConversationSummary): NegotiationChip {
  const p = conv.latestProposal;
  const ended = conv.status !== 'ACTIVE';

  if (p?.type === 'FINAL' && p.status === 'APPROVED') {
    return { label: 'Contratado', varName: '--color-status-finished', pending: false };
  }
  if (ended) {
    return { label: 'Encerrada', varName: '--color-status-canceled', pending: false };
  }
  if (p?.type === 'FINAL' && p.status === 'PENDING') {
    return { label: 'Proposta final', varName: '--color-status-negotiation', pending: true };
  }
  if (p?.type === 'PRE' && p.status === 'PENDING') {
    return { label: 'Estimativa recebida', varName: '--color-status-waiting', pending: true };
  }
  if (p?.type === 'PRE' && p.status === 'ACCEPTED') {
    return { label: 'Aguardando visita', varName: '--color-status-scheduled', pending: false };
  }
  if (p?.type === 'PRE' && p.status === 'REJECTED') {
    return { label: 'Estimativa recusada', varName: '--color-status-canceled', pending: false };
  }
  return { label: 'Conversando', varName: '--color-status-negotiation', pending: false };
}
