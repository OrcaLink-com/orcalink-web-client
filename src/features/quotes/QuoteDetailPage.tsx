import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuote, useQuoteConversations, useVisits } from '../../lib/queries';
import { useQuoteRealtime } from '../../lib/realtime';
import { formatBRL, formatDateTime } from '../../lib/format';
import {
  Card,
  EmptyState,
  SectionHeader,
  Spinner,
  StatusChip,
  Timeline,
} from '../../components/ui';
import {
  IconBack,
  IconHistory,
  IconImages,
  IconNegotiations,
} from '../../components/icons';
import { ProviderCard } from './ProviderCard';
import { PaymentSection, ReviewSection } from './quoteSections';
import { NegotiationDrawer } from './NegotiationDrawer';
import { buildQuoteTimeline } from './timeline';

/**
 * Detalhe consolidado do orçamento. Estrutura:
 *   Dados do orçamento → Pagamento/Avaliação → Imagens → Negociações → Histórico.
 * Toda a negociação (propostas, visitas, valor, decisões) vive dentro da conversa de
 * cada prestador — aqui listamos as negociações como cards e a conversa abre em um
 * Drawer lateral (sem trocar de página). Datas/visitas aparecem no card e no histórico.
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

  const [openConv, setOpenConv] = useState<string | null>(null);

  // Abertura do chat pela notificação (toast) → abre o Drawer da conversa.
  const location = useLocation();
  const openChat = (location.state as { openChat?: string } | null)?.openChat;
  useEffect(() => {
    if (openChat) {
      setOpenConv(openChat);
      // Limpa o state para não reabrir ao navegar/voltar.
      window.history.replaceState({}, '');
    }
  }, [openChat]);

  const timeline = useMemo(
    () => (quote ? buildQuoteTimeline(quote, convs, visits) : []),
    [quote, convs, visits],
  );

  if (quoteQ.isLoading) return <Spinner label="Carregando…" />;
  if (quoteQ.isError) return <p className="text-danger">{(quoteQ.error as Error).message}</p>;
  if (!quote) return null;

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
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-md object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Negociações — cada card abre a conversa em um Drawer lateral */}
      <section className="space-y-3">
        <SectionHeader title="Negociações" />
        {convs.length === 0 ? (
          <EmptyState
            icon={<IconNegotiations size={24} />}
            title="Aguardando profissionais"
            hint="Quem demonstrar interesse aparece aqui. Abra cada negociação para conversar, receber propostas e decidir."
          />
        ) : (
          <ul className="space-y-2.5">
            {convs.map((c) => {
              const myVisits = visits
                .filter((v) => v.providerId === c.counterpartId)
                .sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? ''));
              return (
                <li key={c.id}>
                  <ProviderCard
                    conv={c}
                    quoteId={quoteId}
                    providerVisits={myVisits}
                    onOpenChat={setOpenConv}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Histórico (auditoria) — inclui visitas/datas agendadas */}
      <section>
        <SectionHeader title="Histórico" />
        {timeline.length === 0 ? (
          <EmptyState icon={<IconHistory size={24} />} title="Sem eventos ainda" />
        ) : (
          <Timeline items={timeline} />
        )}
      </section>

      <NegotiationDrawer
        quoteId={quoteId}
        conversationId={openConv}
        isOpen={openConv !== null}
        onClose={() => setOpenConv(null)}
      />
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
