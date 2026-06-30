import type { QuoteStatus } from './types';

/** Rótulo legível, classe de fundo sólido (token) e variável CSS de cor por status. */
export const QUOTE_STATUS_META: Record<
  QuoteStatus,
  { label: string; className: string; varName: string }
> = {
  CREATED: { label: 'Criado', className: 'bg-status-canceled', varName: '--color-status-canceled' },
  WAITING_PROPOSALS: { label: 'Aguardando propostas', className: 'bg-status-waiting', varName: '--color-status-waiting' },
  IN_NEGOTIATION: { label: 'Em negociação', className: 'bg-status-negotiation', varName: '--color-status-negotiation' },
  PROVIDER_SELECTED: { label: 'Profissional selecionado', className: 'bg-status-negotiation', varName: '--color-status-negotiation' },
  WAITING_PAYMENT: { label: 'Aguardando pagamento', className: 'bg-status-waiting', varName: '--color-status-waiting' },
  PAID: { label: 'Pago', className: 'bg-status-paid', varName: '--color-status-paid' },
  EXECUTION_SCHEDULED: { label: 'Agendado', className: 'bg-status-scheduled', varName: '--color-status-scheduled' },
  IN_PROGRESS: { label: 'Em andamento', className: 'bg-status-scheduled', varName: '--color-status-scheduled' },
  FINISHED: { label: 'Concluído', className: 'bg-status-finished', varName: '--color-status-finished' },
  CANCELED: { label: 'Cancelado', className: 'bg-status-canceled', varName: '--color-status-canceled' },
};
