import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Message, Visit } from '../../lib/types';
import { formatBRL, formatDateTime } from '../../lib/format';
import {
  IconAgenda,
  IconCompare,
  IconConfirmed,
  IconClose,
  IconEstimate,
  IconInfo,
  IconProposal,
  IconReschedule,
  IconSuccess,
} from '../../components/icons';

const ICON_SZ = 15;

/**
 * Contexto de ação para a proposta acionável (doc 12 §12.3.1: ações inline no card).
 * Só a proposta cujo id === actionableProposalId mostra os botões.
 */
export interface ProposalActionCtx {
  actionableProposalId?: string;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  accepting?: boolean;
  rejecting?: boolean;
  /** Para FINAL pendente com outras finais: link e contagem da comparação. */
  compareHref?: string;
  compareCount?: number;
}

/**
 * Esqueleto visual unificado de "Evento" (doc 12 §12.3.1).
 *
 * Toda interação acontece na timeline como um Card padronizado com a mesma estrutura:
 *   [ÍCONE]  RÓTULO                               [hora]
 *   Linha principal (valor / título)
 *   • detalhes em lista
 *
 * Tipos cobertos:
 *   - PROPOSAL · PRE                → 💬 Estimativa
 *   - PROPOSAL · FINAL              → 📄 Proposta final
 *   - PROPOSAL_ACCEPTED             → ✅ Aceita
 *   - PROPOSAL_REJECTED             → 🚫 Recusada
 *   - VISIT_REQUEST                 → 🗓 Visita agendada
 *   - VISIT_CONFIRMED               → ✅ Visita confirmada
 *   - VISIT_RESCHEDULED             → 🔁 Visita reagendada
 *   - SYSTEM (texto)                → ℹ Sistema
 *
 * Mensagens TEXT ficam fora do EventCard (bolhas comuns no chat).
 */
export function EventCard({
  message,
  visits,
  actions,
}: {
  message: Message;
  /**
   * Lista de visitas do orçamento (de qualquer prestador). Usada para enriquecer
   * cards de visita com horário e tipo (IN_LOCO/EXECUTION) — o backend hoje
   * envia o detalhe no `body`, mas a fonte canônica é a entidade Visit.
   */
  visits?: Visit[];
  /** Contexto para ações inline na proposta acionável (Aceitar/Rejeitar/Comparar). */
  actions?: ProposalActionCtx;
}) {
  switch (message.type) {
    case 'PROPOSAL':
      return message.proposal ? <ProposalCard message={message} actions={actions} /> : null;
    case 'PROPOSAL_ACCEPTED':
      return (
        <Shell
          icon={<IconSuccess size={ICON_SZ} />}
          label="Proposta aceita"
          tone="success"
          time={message.createdAt}
          body={message.body ?? 'Cliente aceitou a proposta.'}
        />
      );
    case 'PROPOSAL_REJECTED':
      return (
        <Shell
          icon={<IconClose size={ICON_SZ} />}
          label="Proposta recusada"
          tone="muted"
          time={message.createdAt}
          body={message.body ?? 'Cliente recusou a proposta.'}
        />
      );
    case 'VISIT_REQUEST':
      return <VisitCard message={message} visits={visits} variant="request" />;
    case 'VISIT_CONFIRMED':
      return <VisitCard message={message} visits={visits} variant="confirmed" />;
    case 'VISIT_RESCHEDULED':
      return <VisitCard message={message} visits={visits} variant="rescheduled" />;
    case 'SYSTEM':
      return (
        <Shell
          icon={<IconInfo size={ICON_SZ} />}
          label="Sistema"
          tone="muted"
          time={message.createdAt}
          body={message.body ?? ''}
        />
      );
    default:
      return null;
  }
}

// ────────────────── Shell padronizado ──────────────────
function Shell({
  icon,
  label,
  tone = 'info',
  time,
  amount,
  body,
  details,
  footer,
}: {
  icon: ReactNode;
  label: string;
  tone?: 'info' | 'success' | 'attention' | 'muted' | 'danger';
  time?: string;
  amount?: string;
  body?: string;
  details?: string[];
  footer?: ReactNode;
}) {
  const palette: Record<NonNullable<typeof tone>, string> = {
    info: 'border-primary/40 bg-content1 text-foreground',
    success: 'border-success/40 bg-success/10 text-foreground',
    attention: 'border-warning/40 bg-content1 text-foreground',
    muted: 'border-border bg-content1 text-text-muted',
    danger: 'border-danger/40 bg-content1 text-foreground',
  };
  return (
    <div className={`my-2 rounded-large border p-3.5 shadow-card ${palette[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          {icon}
          {label}
        </p>
        {time && <span className="text-[10px] text-text-muted">{shortTime(time)}</span>}
      </div>
      {amount && <p className="mt-1 text-lg font-bold">{amount}</p>}
      {body && <p className="mt-1 text-sm text-text-muted">{body}</p>}
      {details && details.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-text-muted">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}

function shortTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

// ────────────────── PROPOSAL (PRE/FINAL) ──────────────────
function ProposalCard({ message, actions }: { message: Message; actions?: ProposalActionCtx }) {
  const p = message.proposal!;
  const isPre = p.type === 'PRE';
  const hasRange =
    isPre &&
    p.amountMinCents != null &&
    p.amountMaxCents != null &&
    p.amountMinCents !== p.amountMaxCents;
  const amount = hasRange
    ? `${formatBRL(p.amountMinCents!)} – ${formatBRL(p.amountMaxCents!)}`
    : formatBRL(p.amountCents);

  const details: string[] = [];
  if (p.leadTimeDays != null) details.push(`Prazo: ${p.leadTimeDays} dia(s)`);
  if (!isPre && p.warrantyDays != null) details.push(`Garantia: ${p.warrantyDays} dia(s)`);
  if (!isPre && p.paymentMethods && p.paymentMethods.length > 0)
    details.push(`Pagamento: ${p.paymentMethods.join(', ')}`);
  if (isPre && p.requestsVisit) details.push('Solicita visita técnica');
  if (p.notes) details.push(p.notes);
  if (isPre) details.push('Valor estimado · valor final virá após a visita.');

  // Só a proposta acionável (última pendente, conversa ativa) ganha botões inline.
  const isActionable = !!actions && actions.actionableProposalId === p.id;
  const footer = isActionable ? (
    <div className="space-y-2">
      {isPre && (
        <p className="text-xs text-text-muted">
          Aceitar combina a visita técnica — você só paga após a proposta final.
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => actions!.onAccept(p.id)}
          disabled={actions!.accepting}
          className="flex-1 rounded-md bg-status-finished px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPre ? 'Aceitar estimativa' : `Aceitar ${formatBRL(p.amountCents)}`}
        </button>
        <button
          type="button"
          onClick={() => actions!.onReject(p.id)}
          disabled={actions!.rejecting}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          Rejeitar
        </button>
      </div>
      {!isPre && actions!.compareHref && (actions!.compareCount ?? 0) > 0 && (
        <Link
          to={actions!.compareHref}
          className="flex items-center justify-center gap-1.5 rounded-medium border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
        >
          <IconCompare size={15} /> Comparar com {actions!.compareCount} outra
          {actions!.compareCount! > 1 ? 's' : ''}
        </Link>
      )}
    </div>
  ) : undefined;

  return (
    <Shell
      icon={isPre ? <IconEstimate size={ICON_SZ} /> : <IconProposal size={ICON_SZ} />}
      label={isPre ? 'Estimativa' : 'Proposta final'}
      tone={isActionable ? 'attention' : 'info'}
      time={message.createdAt}
      amount={amount}
      body={p.description}
      details={details}
      footer={footer}
    />
  );
}

// ────────────────── VISIT_* ──────────────────
function VisitCard({
  message,
  visits,
  variant,
}: {
  message: Message;
  visits?: Visit[];
  variant: 'request' | 'confirmed' | 'rescheduled';
}) {
  // Tenta achar a visita mais próxima temporalmente para enriquecer (horário/tipo).
  const visit = findClosestVisit(visits, message.createdAt);

  const cfg = {
    request: { icon: <IconAgenda size={ICON_SZ} />, label: 'Visita agendada', tone: 'attention' as const },
    confirmed: { icon: <IconConfirmed size={ICON_SZ} />, label: 'Visita confirmada', tone: 'success' as const },
    rescheduled: { icon: <IconReschedule size={ICON_SZ} />, label: 'Visita reagendada', tone: 'attention' as const },
  }[variant];

  const details: string[] = [];
  if (visit) {
    details.push(
      `${visit.type === 'IN_LOCO' ? 'Visita técnica' : 'Execução'}${
        visit.scheduledAt ? ` · ${formatDateTime(visit.scheduledAt)}` : ''
      }${visit.endsAt ? ` → ${formatDateTime(visit.endsAt)}` : ''}`,
    );
    if (visit.providerName) details.push(visit.providerName);
  }

  return (
    <Shell
      icon={cfg.icon}
      label={cfg.label}
      tone={cfg.tone}
      time={message.createdAt}
      body={message.body ?? undefined}
      details={details.length ? details : undefined}
    />
  );
}

/**
 * Heurística simples: pega a visita com `scheduledAt` mais próximo do `createdAt` da
 * mensagem. Suficiente porque o sistema cria uma mensagem por mudança de visita.
 */
function findClosestVisit(visits: Visit[] | undefined, refIso: string): Visit | undefined {
  if (!visits || visits.length === 0) return undefined;
  const ref = new Date(refIso).getTime();
  let best: Visit | undefined;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const v of visits) {
    const ts = v.scheduledAt ? new Date(v.scheduledAt).getTime() : new Date(v.createdAt).getTime();
    const d = Math.abs(ts - ref);
    if (d < bestDelta) {
      bestDelta = d;
      best = v;
    }
  }
  return best;
}
