import { useMemo, useState } from 'react';
import { useMyConversations } from '../../lib/queries';
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  RatingStars,
  SegmentedTabs,
  Spinner,
  StatusChip,
} from '../../components/ui';
import type { Segment } from '../../components/ui';
import { IconNegotiations } from '../../components/icons';
import { deriveNegotiationChip } from './negotiationState';
import type { ClientConversation } from '../../lib/types';

type Filter = 'all' | 'pending' | 'ended';

/**
 * Lista global de Negociações (CRM): toda relação prestador × orçamento num só lugar.
 * Cada item agrupa o estado da negociação e leva à tela de acompanhamento.
 */
export function NegociacoesPage() {
  const { data, isLoading, isError, error } = useMyConversations();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    const list = data ?? [];
    return list.map((c) => ({ conv: c, chip: deriveNegotiationChip(c) }));
  }, [data]);

  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((i) => i.chip.pending).length,
      ended: items.filter((i) => i.conv.status !== 'ACTIVE').length,
    }),
    [items],
  );

  const segments: Segment<Filter>[] = [
    { value: 'all', label: 'Todas', count: counts.all },
    { value: 'pending', label: 'Aguardando você', count: counts.pending },
    { value: 'ended', label: 'Encerradas', count: counts.ended },
  ];

  const filtered = items.filter(({ conv, chip }) => {
    if (filter === 'pending') return chip.pending;
    if (filter === 'ended') return conv.status !== 'ACTIVE';
    return true;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Negociações"
        subtitle="Tudo de cada profissional interessado nos seus orçamentos, num lugar só."
      />

      {isLoading && <Spinner label="Carregando…" />}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={<IconNegotiations size={26} />}
          title="Nenhuma negociação ainda"
          hint="Quando um profissional demonstrar interesse num orçamento, a conversa aparece aqui."
        />
      )}

      {items.length > 0 && (
        <>
          <SegmentedTabs segments={segments} value={filter} onChange={setFilter} />
          <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(({ conv, chip }) => (
              <li key={conv.id}>
                <NegotiationRow conv={conv} chip={chip} />
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-text-muted">Nada nesta aba.</p>
          )}
        </>
      )}
    </div>
  );
}

function NegotiationRow({
  conv,
  chip,
}: {
  conv: ClientConversation;
  chip: ReturnType<typeof deriveNegotiationChip>;
}) {
  const last = conv.lastMessage?.body;
  return (
    <Card to={`/app/orcamento/${conv.quoteId}/negociacao/${conv.id}`} className="p-3">
      <div className="flex items-start gap-3">
        <Avatar name={conv.counterpartName} src={conv.counterpartAvatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold">{conv.counterpartName}</span>
            {chip.pending && <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <RatingStars value={conv.counterpartRating} count={conv.counterpartRatingCount} />
            <span className="truncate text-xs text-text-muted">· {conv.quoteCategoryName}</span>
          </div>
          <p className="mt-1 truncate text-xs text-text-muted">{conv.quoteDescription}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <StatusChip label={chip.label} varName={chip.varName} size="sm" />
            {last && <span className="truncate text-xs text-text-muted">{last}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}
