import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LuBuilding2 } from 'react-icons/lu';
import { useAcceptProposal, useConfirmVisit, useRejectProposal } from '../../lib/queries';
import { formatBRL, formatDateTime } from '../../lib/format';
import { Avatar, Button, Card, RatingStars } from '../../components/ui';
import {
  IconAgenda,
  IconCelebrate,
  IconChat,
  IconChevronRight,
  IconClose,
  IconConfirmed,
  IconProposal,
  IconWaiting,
} from '../../components/icons';
import type { ConversationSummary, Visit } from '../../lib/types';

/**
 * Card de uma negociação (prestador × orçamento) — autocontido: estado + ação inline.
 * O cliente decide sem precisar abrir a conversa. Estado derivado de proposta + visitas.
 */
export function ProviderCard({
  conv,
  quoteId,
  providerVisits,
  onOpenChat,
}: {
  conv: ConversationSummary;
  quoteId: string;
  providerVisits: Visit[];
  /** Abre a conversa (drawer lateral). Recebe o id da conversa. */
  onOpenChat: (conversationId: string) => void;
}) {
  const accept = useAcceptProposal(quoteId);
  const reject = useRejectProposal(quoteId);
  const confirmVisit = useConfirmVisit(quoteId);

  const proposal = conv.latestProposal;
  const visit = providerVisits[0];
  const isPreApproved = proposal?.type === 'PRE' && proposal.status === 'ACCEPTED';
  const visitAwaitingClient = visit && (visit.status === 'SUGGESTED' || visit.status === 'RESCHEDULED');
  const visitConfirmed = visit?.status === 'CONFIRMED' && visit.type === 'IN_LOCO';
  const visitDone = visit?.status === 'COMPLETED' && visit.type === 'IN_LOCO';
  const conversationEnded = conv.status !== 'ACTIVE';
  const wasNotPicked =
    conversationEnded && (proposal?.status === 'REJECTED' || proposal?.status === 'PENDING');
  const wasContracted = proposal?.type === 'FINAL' && proposal.status === 'APPROVED';

  const sz = 15;
  let icon: ReactNode = <IconChat size={sz} />;
  let text = 'Conversando';
  let color = 'text-text-muted';
  let primary: { label: string; onClick: () => void; disabled?: boolean } | null = null;
  let secondary: { label: string; onClick: () => void } | null = null;

  if (wasContracted) {
    icon = <IconCelebrate size={sz} />;
    text = 'Você contratou este profissional';
    color = 'text-success';
  } else if (wasNotPicked) {
    icon = <IconClose size={sz} />;
    text = 'Encerrado — você contratou outro profissional';
  } else if (proposal?.type === 'FINAL' && proposal.status === 'PENDING') {
    icon = <IconProposal size={sz} />;
    text = `Proposta final · ${formatBRL(proposal.amountCents)}`;
    color = 'text-primary';
    primary = { label: 'Aceitar', onClick: () => accept.mutate(proposal.id), disabled: accept.isPending };
    secondary = { label: 'Rejeitar', onClick: () => reject.mutate(proposal.id) };
  } else if (visitDone && !proposal) {
    icon = <IconWaiting size={sz} />;
    text = 'Visita realizada · aguardando proposta final';
  } else if (visitConfirmed) {
    icon = <IconConfirmed size={sz} />;
    text = `Visita confirmada para ${formatDateTime(visit!.scheduledAt!)}`;
    color = 'text-success';
  } else if (visitAwaitingClient) {
    icon = <IconAgenda size={sz} />;
    text = `Visita ${visit!.status === 'SUGGESTED' ? 'agendada' : 'reagendada'} para ${formatDateTime(visit!.scheduledAt!)}`;
    color = 'text-warning';
    primary = { label: 'Confirmar', onClick: () => confirmVisit.mutate(visit!.id), disabled: confirmVisit.isPending };
    secondary = {
      label: 'Sugerir outra',
      onClick: () => onOpenChat(conv.id),
    };
  } else if (isPreApproved) {
    icon = <IconWaiting size={sz} />;
    text = 'Estimativa aceita · aguardando agendamento da visita';
  } else if (proposal?.type === 'PRE' && proposal.status === 'PENDING') {
    const range =
      proposal.amountMinCents != null &&
      proposal.amountMaxCents != null &&
      proposal.amountMinCents !== proposal.amountMaxCents
        ? `${formatBRL(proposal.amountMinCents)} – ${formatBRL(proposal.amountMaxCents)}`
        : formatBRL(proposal.amountCents);
    icon = <IconChat size={sz} />;
    text = `Estimativa · ${range}`;
    color = 'text-primary';
    primary = { label: 'Aceitar', onClick: () => accept.mutate(proposal.id), disabled: accept.isPending };
    secondary = { label: 'Rejeitar', onClick: () => reject.mutate(proposal.id) };
  } else if (proposal?.type === 'PRE' && proposal.status === 'REJECTED') {
    icon = <IconClose size={sz} />;
    text = 'Estimativa recusada';
  }

  return (
    <Card variant={primary ? 'highlight' : 'default'} className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={conv.counterpartName} src={conv.counterpartAvatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold">{conv.counterpartName}</span>
            <RatingStars value={conv.counterpartRating} count={conv.counterpartRatingCount} />
          </div>
          <p className={`mt-1 flex items-center gap-1.5 text-sm ${color}`}>
            {icon}
            <span className="truncate">{text}</span>
          </p>

          {(primary || secondary) && (
            <div className="mt-3 flex gap-2">
              {primary && (
                <Button size="sm" onClick={primary.onClick} disabled={primary.disabled}>
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button size="sm" variant="secondary" onClick={secondary.onClick}>
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => onOpenChat(conv.id)}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-text-muted hover:text-foreground"
            >
              Abrir conversa <IconChevronRight size={13} />
            </button>
            <Link
              to={`/prestador/${conv.counterpartId}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <LuBuilding2 size={13} /> Ver perfil da empresa
            </Link>
          </div>

          {(accept.isError || reject.isError || confirmVisit.isError) && (
            <p className="mt-1 text-xs text-danger">
              {((accept.error || reject.error || confirmVisit.error) as Error)?.message}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
