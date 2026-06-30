import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuote, useQuoteConversations, useVisits } from '../../lib/queries';
import { useQuoteRealtime } from '../../lib/realtime';
import { formatBRL, formatDateTime } from '../../lib/format';
import {
  Card,
  EmptyState,
  SectionHeader,
  SegmentedTabs,
  Spinner,
  StatusChip,
  Timeline,
} from '../../components/ui';
import type { Segment } from '../../components/ui';
import {
  IconAgenda,
  IconBack,
  IconHistory,
  IconImages,
  IconNegotiations,
} from '../../components/icons';
import { ProviderCard } from './ProviderCard';
import { PaymentSection, ReviewSection, VisitItem } from './quoteSections';
import { buildQuoteTimeline } from './timeline';

type Tab = 'negociacao' | 'agenda';

/**
 * Detalhe consolidado do orçamento (redesign v2). Estrutura pedida:
 *   Dados do orçamento → Imagens → Abas [Negociação | Agenda] → Histórico (auditoria).
 * Tudo da negociação (propostas, visitas, valor, decisões) vive dentro da conversa de
 * cada prestador — aqui só listamos as negociações e os compromissos.
 */
export function QuoteDetailPage() {
  const { quoteId = '' } = useParams();
  useQuoteRealtime(quoteId);

  const quoteQ = useQuote(quoteId);
  const convsQ = useQuoteConversations(quoteId);
  const visitsQ = useVisits(quoteId, true);

  const quote = quoteQ.data;
  const convs = convsQ.data ?? [];
  const visits = visitsQ.data ?? [];

  const [tab, setTab] = useState<Tab>('negociacao');

  const activeNegotiations = convs.filter((c) => c.status === 'ACTIVE').length;
  const scheduledVisits = visits.filter((v) => v.status !== 'CANCELED');

  const timeline = useMemo(
    () => (quote ? buildQuoteTimeline(quote, convs, visits) : []),
    [quote, convs, visits],
  );

  if (quoteQ.isLoading) return <Spinner label="Carregando…" />;
  if (quoteQ.isError) return <p className="text-danger">{(quoteQ.error as Error).message}</p>;
  if (!quote) return null;

  const tabs: Segment<Tab>[] = [
    { value: 'negociacao', label: 'Negociação', count: activeNegotiations },
    { value: 'agenda', label: 'Agenda', count: scheduledVisits.length },
  ];

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground">
        <IconBack size={15} /> Meus orçamentos
      </Link>

      {/* Dados completos do orçamento */}
      <Card className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight">{quote.category.name}</h1>
          <StatusChip status={quote.status} />
        </div>
        <p className="text-sm text-text-muted">{quote.description}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Field label="Categoria" value={quote.category.name} />
          <Field label="Modo" value={quote.requiresVisit ? 'Com visita técnica' : 'À distância'} />
          <Field label="Endereço / CEP" value={quote.zipCode ?? '—'} />
          {quote.budgetMaxCents != null && (
            <Field label="Orçamento máximo" value={formatBRL(quote.budgetMaxCents)} />
          )}
          <Field label="Criado em" value={formatDateTime(quote.createdAt)} />
        </dl>
      </Card>

      {/* Pagamento / avaliação — aparecem conforme o status (após contratar) */}
      <PaymentSection quoteId={quoteId} status={quote.status} />
      <ReviewSection quoteId={quoteId} status={quote.status} />

      {/* Imagens */}
      <section>
        <SectionHeader title="Imagens" />
        {quote.images.length === 0 ? (
          <EmptyState icon={<IconImages size={24} />} title="Sem imagens anexadas" />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {quote.images.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                <img
                  src={img.url}
                  alt="referência"
                  className="aspect-square w-full rounded-md object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Abas: Negociação | Agenda */}
      <section className="space-y-3">
        <SegmentedTabs segments={tabs} value={tab} onChange={setTab} />

        {tab === 'negociacao' && <NegotiationTab quoteId={quoteId} convs={convs} visits={visits} />}
        {tab === 'agenda' && <AgendaTab quoteId={quoteId} visits={scheduledVisits} />}
      </section>

      {/* Histórico (auditoria) */}
      <section>
        <SectionHeader title="Histórico" />
        {timeline.length === 0 ? (
          <EmptyState icon={<IconHistory size={24} />} title="Sem eventos ainda" />
        ) : (
          <Timeline items={timeline} />
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function NegotiationTab({
  quoteId,
  convs,
  visits,
}: {
  quoteId: string;
  convs: import('../../lib/types').ConversationSummary[];
  visits: import('../../lib/types').Visit[];
}) {
  if (convs.length === 0) {
    return (
      <EmptyState
        icon={<IconNegotiations size={24} />}
        title="Aguardando profissionais"
        hint="Quem demonstrar interesse aparece aqui. Abra cada negociação para conversar, receber propostas e decidir."
      />
    );
  }
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {convs.map((c) => {
        const myVisits = visits
          .filter((v) => v.providerId === c.counterpartId)
          .sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? ''));
        return (
          <li key={c.id}>
            <ProviderCard conv={c} quoteId={quoteId} providerVisits={myVisits} />
          </li>
        );
      })}
    </ul>
  );
}

function AgendaTab({
  quoteId,
  visits,
}: {
  quoteId: string;
  visits: import('../../lib/types').Visit[];
}) {
  if (visits.length === 0) {
    return (
      <EmptyState
        icon={<IconAgenda size={24} />}
        title="Nenhum compromisso agendado"
        hint="Visitas técnicas e datas de execução combinadas com os profissionais aparecem aqui."
      />
    );
  }
  return (
    <ul className="space-y-2">
      {visits
        .slice()
        .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))
        .map((v) => (
          <VisitItem key={v.id} visit={v} quoteId={quoteId} />
        ))}
    </ul>
  );
}
