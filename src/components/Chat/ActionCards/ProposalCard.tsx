import { useState } from 'react';
import { LuFileText, LuClock, LuShieldCheck, LuCreditCard, LuStickyNote, LuCheck, LuX, LuLayers } from 'react-icons/lu';
import type { ProposalPayload } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatCents } from '../utils';

export interface ProposalCardProps {
  payload: ProposalPayload;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onCompare?: () => void;
  mine?: boolean;
}

const METHOD_LABEL: Record<string, string> = { PIX: 'PIX', CARD: 'Cartão', BOLETO: 'Boleto' };

export function ProposalCard({ payload, onAccept, onReject, onCompare, mine }: ProposalCardProps) {
  const isEstimate = payload.kind === 'estimate';
  const pending = payload.status === 'pending';
  // Enquanto uma ação (aceitar/recusar) roda, travamos o card inteiro para
  // impedir cliques duplicados ou aceitar+recusar em paralelo.
  const [busy, setBusy] = useState(false);
  const guard = (fn?: () => Promise<void>) =>
    fn
      ? async () => {
          if (busy) return;
          setBusy(true);
          try {
            await fn();
          } finally {
            setBusy(false);
          }
        }
      : undefined;
  const accept = guard(onAccept);
  const reject = guard(onReject);

  // Título na perspectiva de quem vê: quem enviou vê "enviada", quem recebe "recebida".
  const title = isEstimate
    ? mine
      ? 'Estimativa enviada'
      : 'Estimativa recebida'
    : mine
      ? 'Proposta final enviada'
      : 'Proposta final recebida';
  const hasRange =
    isEstimate &&
    payload.amountMinCents != null &&
    payload.amountMaxCents != null &&
    payload.amountMinCents !== payload.amountMaxCents;

  const value = hasRange
    ? `${formatCents(payload.amountMinCents!)} – ${formatCents(payload.amountMaxCents!)}`
    : formatCents(payload.amountCents);

  const meta: MetaItem[] = [{ icon: <LuFileText size={15} />, label: 'Valor', value, emphasize: true }];
  if (payload.leadTimeDays != null)
    meta.push({ icon: <LuClock size={15} />, label: 'Prazo', value: `${payload.leadTimeDays} dia(s)` });
  if (!isEstimate && payload.warrantyDays != null)
    meta.push({ icon: <LuShieldCheck size={15} />, label: 'Garantia', value: `${payload.warrantyDays} dia(s)` });
  if (!isEstimate && payload.paymentMethods && payload.paymentMethods.length > 0)
    meta.push({
      icon: <LuCreditCard size={15} />,
      label: 'Pagamento',
      value: payload.paymentMethods.map((m) => METHOD_LABEL[m] ?? m).join(', '),
    });
  if (payload.notes)
    meta.push({ icon: <LuStickyNote size={15} />, label: 'Obs.', value: payload.notes });

  const badge =
    payload.status === 'accepted'
      ? { label: 'Aceita', tone: 'success' as const }
      : payload.status === 'rejected'
        ? { label: 'Recusada', tone: 'danger' as const }
        : { label: isEstimate ? 'Estimativa' : 'Vinculante', tone: 'accent' as const };

  return (
    <BaseActionCard
      accent={isEstimate ? 'blue' : 'neutral'}
      icon={<LuFileText size={22} />}
      title={title}
      subtitle={payload.providerName}
      description={payload.description}
      badge={badge}
      meta={meta}
      mine={mine}
      actions={
        pending && !mine ? (
          <>
            <CardButton
              accent={isEstimate ? 'blue' : 'green'}
              icon={<LuCheck size={17} />}
              onPress={accept}
              disabled={busy}
              successLabel="Aceita!"
            >
              {isEstimate ? 'Aceitar estimativa' : 'Aceitar e contratar'}
            </CardButton>
            <div className={payload.compareCount ? 'grid grid-cols-2 gap-2' : ''}>
              <CardButton variant="secondary" icon={<LuX size={16} />} onPress={reject} disabled={busy}>
                Recusar
              </CardButton>
              {payload.compareCount ? (
                <CardButton variant="secondary" icon={<LuLayers size={16} />} onPress={onCompare} disabled={busy}>
                  Comparar ({payload.compareCount})
                </CardButton>
              ) : null}
            </div>
          </>
        ) : undefined
      }
    />
  );
}
