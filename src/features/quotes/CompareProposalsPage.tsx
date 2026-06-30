import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useAcceptProposal,
  useQuoteConversations,
  useRejectProposal,
} from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import { useQuoteRealtime } from '../../lib/realtime';
import type { ConversationSummary, Proposal } from '../../lib/types';

/** Linha de uma característica para comparar entre as propostas (doc 07 C13). */
function Row({
  label,
  values,
  highlight,
}: {
  label: string;
  values: (string | number | null | undefined)[];
  highlight?: boolean[];
}) {
  return (
    <tr>
      <th className="sticky left-0 z-10 bg-bg px-2 py-2 text-left text-xs font-medium text-text-muted">
        {label}
      </th>
      {values.map((v, i) => (
        <td
          key={i}
          className={`px-2 py-2 text-sm ${
            highlight?.[i] ? 'font-semibold text-status-finished' : ''
          }`}
        >
          {v ?? <span className="text-text-muted">—</span>}
        </td>
      ))}
    </tr>
  );
}

interface FinalCard {
  conv: ConversationSummary;
  proposal: Proposal;
}

export function CompareProposalsPage() {
  const { quoteId = '' } = useParams();
  const navigate = useNavigate();
  useQuoteRealtime(quoteId);
  const convsQ = useQuoteConversations(quoteId);
  const accept = useAcceptProposal(quoteId);
  const reject = useRejectProposal(quoteId);

  // Apenas FINAIS PENDING ativas (máx. 3, alinhado ao limite de visitas — doc 03 §3.6).
  const finals: FinalCard[] = useMemo(() => {
    return (convsQ.data ?? [])
      .filter(
        (c): c is ConversationSummary & { latestProposal: Proposal } =>
          !!c.latestProposal &&
          c.latestProposal.type === 'FINAL' &&
          c.latestProposal.status === 'PENDING' &&
          c.status === 'ACTIVE',
      )
      .slice(0, 3)
      .map((c) => ({ conv: c, proposal: c.latestProposal }));
  }, [convsQ.data]);

  if (convsQ.isLoading) return <p className="text-text-muted">Carregando…</p>;
  if (convsQ.isError) return <p className="text-danger">{(convsQ.error as Error).message}</p>;

  if (finals.length === 0) {
    return (
      <p className="rounded-md bg-card px-3 py-2 text-sm text-text-muted">
        Você ainda não recebeu propostas finais para comparar. Quando os profissionais
        enviarem, elas aparecerão aqui lado a lado.
      </p>
    );
  }

  // Destaque do menor preço e maior garantia (sinalização, sem decidir por ninguém).
  const prices = finals.map((f) => f.proposal.amountCents);
  const minPrice = Math.min(...prices);
  const warranties = finals.map((f) => f.proposal.warrantyDays ?? 0);
  const maxWarranty = Math.max(...warranties);

  async function onAccept(proposalId: string) {
    try {
      await accept.mutateAsync(proposalId);
      navigate(`/orcamento/${quoteId}`);
    } catch {
      /* erro exibido via state global do react-query (não fluxo crítico aqui) */
    }
  }

  async function onReject(proposalId: string) {
    await reject.mutateAsync(proposalId);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        Compare lado a lado. Aceitar contrata o profissional e bloqueia os demais.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-bg" />
              {finals.map((f) => (
                <th key={f.conv.id} className="px-2 py-2 text-left text-sm font-semibold">
                  {f.conv.counterpartName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row
              label="Valor"
              values={finals.map((f) => formatBRL(f.proposal.amountCents))}
              highlight={prices.map((p) => p === minPrice && finals.length > 1)}
            />
            <Row
              label="Prazo"
              values={finals.map((f) =>
                f.proposal.leadTimeDays != null ? `${f.proposal.leadTimeDays} dia(s)` : null,
              )}
            />
            <Row
              label="Garantia"
              values={finals.map((f) =>
                f.proposal.warrantyDays != null ? `${f.proposal.warrantyDays} dia(s)` : null,
              )}
              highlight={warranties.map(
                (w) => w > 0 && w === maxWarranty && finals.length > 1,
              )}
            />
            <Row
              label="Pagamento"
              values={finals.map((f) =>
                f.proposal.paymentMethods && f.proposal.paymentMethods.length
                  ? f.proposal.paymentMethods.join(', ')
                  : null,
              )}
            />
            <Row
              label="Descrição"
              values={finals.map((f) => f.proposal.description)}
            />
            <Row
              label="Observações"
              values={finals.map((f) => f.proposal.notes ?? null)}
            />
          </tbody>
        </table>
      </div>

      {(accept.isError || reject.isError) && (
        <p className="text-sm text-danger">
          {((accept.error || reject.error) as Error)?.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {finals.map((f) => (
          <div key={f.conv.id} className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-medium">{f.conv.counterpartName}</p>
            <p className="mb-3 text-lg font-bold text-brand">
              {formatBRL(f.proposal.amountCents)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => void onAccept(f.proposal.id)}
                disabled={accept.isPending}
                className="flex-1 rounded-md bg-status-finished px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Aceitar
              </button>
              <button
                onClick={() => void onReject(f.proposal.id)}
                disabled={reject.isPending}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Rejeitar
              </button>
            </div>
            <Link
              to={`/orcamento/${quoteId}/conversa/${f.conv.id}`}
              className="mt-2 block text-center text-xs text-text-muted underline"
            >
              Abrir conversa
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
