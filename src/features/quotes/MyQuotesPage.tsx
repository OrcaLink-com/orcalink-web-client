import { useMemo, useState } from 'react';
import { useMyQuotes } from '../../lib/queries';
import {
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  SegmentedTabs,
  Spinner,
  StatCard,
  StatusChip,
} from '../../components/ui';
import type { Segment } from '../../components/ui';
import {
  IconQuotes,
  IconChevronRight,
  IconClock,
  IconSuccess,
  IconPlus,
} from '../../components/icons';
import type { Quote } from '../../lib/types';

type Filter = 'all' | 'negotiating' | 'proposals' | 'done';

/** Status considerados "em negociação" (aberto, ainda não concluído/cancelado). */
const NEGOTIATING: Quote['status'][] = [
  'CREATED',
  'WAITING_PROPOSALS',
  'IN_NEGOTIATION',
  'PROVIDER_SELECTED',
  'WAITING_PAYMENT',
];

function matchesFilter(q: Quote, filter: Filter): boolean {
  if (filter === 'negotiating') return NEGOTIATING.includes(q.status);
  if (filter === 'proposals') return q.proposalsCount > 0;
  if (filter === 'done') return q.status === 'FINISHED';
  return true;
}

export function MyQuotesPage() {
  const { data: quotes, isLoading, isError, error } = useMyQuotes();
  // Abre já em "Em negociação" — onde estão os orçamentos que pedem atenção.
  const [filter, setFilter] = useState<Filter>('negotiating');

  const stats = useMemo(() => {
    const list = quotes ?? [];
    return {
      total: list.length,
      negotiating: list.filter((q) => NEGOTIATING.includes(q.status)).length,
      withProposals: list.filter((q) => q.proposalsCount > 0).length,
      done: list.filter((q) => q.status === 'FINISHED').length,
    };
  }, [quotes]);

  if (isLoading) return <Spinner label="Carregando seus orçamentos…" />;
  if (isError) return <p className="text-danger">Não foi possível carregar: {(error as Error).message}</p>;

  const list = quotes ?? [];
  const filtered = list.filter((q) => matchesFilter(q, filter));

  const segments: Segment<Filter>[] = [
    { value: 'all', label: 'Todos', count: stats.total },
    { value: 'negotiating', label: 'Em negociação', count: stats.negotiating },
    { value: 'proposals', label: 'Com proposta', count: stats.withProposals },
    { value: 'done', label: 'Concluídos', count: stats.done },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Meus orçamentos"
        subtitle="Acompanhe suas solicitações e o status."
        action={
          <ButtonLink to="/app/novo" size="sm" startContent={<IconPlus size={16} />}>
            Novo
          </ButtonLink>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<IconQuotes size={26} />}
          title="Você ainda não tem orçamentos"
          hint="Crie sua primeira solicitação e receba propostas de profissionais."
          action={<ButtonLink to="/app/novo" startContent={<IconPlus size={16} />}>Criar meu primeiro orçamento</ButtonLink>}
        />
      ) : (
        <>
          <div className="flex gap-2.5">
            <StatCard value={stats.total} label="Total" icon={<IconQuotes size={16} />} />
            <StatCard value={stats.negotiating} label="Em negociação" icon={<IconClock size={16} />} accent />
            <StatCard value={stats.done} label="Concluídos" icon={<IconSuccess size={16} />} />
          </div>

          <SegmentedTabs segments={segments} value={filter} onChange={setFilter} />

          <ul className="space-y-3">
            {filtered.map((q) => (
              <li key={q.id}>
                <QuoteRow quote={q} />
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

function QuoteRow({ quote: q }: { quote: Quote }) {
  return (
    <Card to={`/app/orcamento/${q.id}`} className="p-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="block truncate font-semibold">{q.title ?? q.category.name}</span>
          {q.title && <span className="text-xs text-text-muted">{q.category.name}</span>}
        </div>
        <StatusChip status={q.status} size="sm" />
      </div>
      <p className="line-clamp-2 text-sm text-text-muted">{q.description}</p>
      {q.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {q.images.slice(0, 4).map((img) => (
            <img key={img.id} src={img.url} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-medium object-cover" />
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
        <span>{new Date(q.createdAt).toLocaleDateString('pt-BR')}</span>
        <span
          className={`inline-flex items-center gap-0.5 ${q.proposalsCount > 0 ? 'font-medium text-primary' : ''}`}
        >
          {q.proposalsCount === 0
            ? 'Sem propostas'
            : `${q.proposalsCount} ${q.proposalsCount === 1 ? 'proposta' : 'propostas'}`}
          {q.proposalsCount > 0 && <IconChevronRight size={14} />}
        </span>
      </div>
    </Card>
  );
}
