import { useState } from 'react';
import {
  useComplete,
  useCompleteMilestone,
  useConfirmVisit,
  useCreateReview,
  useMilestones,
  usePay,
  usePayMilestone,
  usePricing,
  useRescheduleVisit,
  useReview,
  useVisitProviderSlots,
  useVisits,
} from '../../lib/queries';
import { formatBRL, formatDateTime } from '../../lib/format';
import { paymentsEnabled } from '../../lib/flags';
import { IconConfirmed, IconStar, IconWaiting } from '../../components/icons';
import type { PaymentStatus, QuoteStatus, VisitStatus } from '../../lib/types';

const PAYMENT_STAGES: QuoteStatus[] = [
  'WAITING_PAYMENT',
  'PAID',
  'EXECUTION_SCHEDULED',
  'IN_PROGRESS',
  'FINISHED',
];

export function PaymentSection({ quoteId, status }: { quoteId: string; status: QuoteStatus }) {
  const enabled = PAYMENT_STAGES.includes(status);
  const pricingQ = usePricing(quoteId, enabled);
  const pay = usePay(quoteId);
  const complete = useComplete(quoteId);

  if (!enabled) return null;

  // MODO INDICAÇÃO: a plataforma não processa pagamento. Nada de "Valor total",
  // custódia ou "Pagar" — só o passo de conclusão (que só aparece em execução).
  if (!paymentsEnabled) {
    if (status === 'FINISHED') {
      return (
        <p className="rounded-md bg-status-finished px-3 py-2 text-center text-sm text-white">
          Serviço concluído. Obrigado!
        </p>
      );
    }
    if (status === 'IN_PROGRESS') {
      return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          {complete.isError && (
            <p className="mb-2 text-sm text-danger">{(complete.error as Error).message}</p>
          )}
          <button
            onClick={() => complete.mutate()}
            disabled={complete.isPending}
            className="w-full rounded-md bg-status-finished px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {complete.isPending ? 'Confirmando…' : 'Confirmar conclusão'}
          </button>
        </div>
      );
    }
    // PAID / EXECUTION_SCHEDULED → aguardando o profissional agendar/iniciar.
    return (
      <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-text-muted shadow-card">
        {status === 'PAID'
          ? 'Contratado! Aguardando o profissional agendar a execução.'
          : 'Execução agendada. Aguardando o profissional iniciar o serviço.'}
      </p>
    );
  }

  if (pricingQ.isLoading) return <p className="text-text-muted">Carregando pagamento…</p>;
  if (!pricingQ.data) return null;
  const total = pricingQ.data.clientTotalCents ?? 0;

  // Pagamento faseado (milestones): painel próprio, uma custódia por fase.
  if (pricingQ.data.isPhased) {
    return <PhasedPaymentSection quoteId={quoteId} totalCents={total} enabled={enabled} />;
  }

  return (
    <div className="rounded-lg border border-brand/50 bg-card p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-text-muted">Valor total</span>
        <span className="text-xl font-bold text-brand">{formatBRL(total)}</span>
      </div>

      {status === 'WAITING_PAYMENT' && (
        <>
          <p className="mb-3 text-xs text-text-muted">
            Pague com segurança — o valor fica retido até você confirmar a conclusão do serviço.
          </p>
          {pay.isError && <p className="mb-2 text-sm text-danger">{(pay.error as Error).message}</p>}

          {/* PIX copia e cola (quando o Asaas devolve o payload PIX direto). */}
          {pay.data?.pixCopyPaste ? (
            <div className="space-y-2">
              <p className="flex items-start gap-2 rounded-md bg-card-2 px-3 py-2 text-sm text-text-muted">
                <IconWaiting size={16} className="mt-0.5 shrink-0" />
                Copie o código PIX, pague no seu banco e a confirmação aparece aqui automaticamente.
              </p>
              <p className="text-xs font-medium text-text-muted">PIX copia e cola</p>
              <textarea
                readOnly
                value={pay.data.pixCopyPaste}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full break-all rounded-md border border-border bg-bg px-2 py-1.5 text-xs"
                rows={3}
              />
              {pay.data.invoiceUrl && (
                <a
                  href={pay.data.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md bg-brand px-4 py-2.5 text-center font-medium text-white"
                >
                  Abrir fatura e pagar
                </a>
              )}
            </div>
          ) : pay.data?.invoiceUrl ? (
            /* Fatura criada (PIX/cartão escolhidos na página do Asaas). */
            <a
              href={pay.data.invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md bg-brand px-4 py-2.5 text-center font-medium text-white"
            >
              Ir para o pagamento →
            </a>
          ) : (
            /* Ainda não criou a cobrança: cria e já abre a fatura. */
            <button
              onClick={() =>
                pay.mutate(undefined, {
                  onSuccess: (data) => {
                    if (data.invoiceUrl) window.open(data.invoiceUrl, '_blank', 'noopener');
                  },
                })
              }
              disabled={pay.isPending}
              className="w-full rounded-md bg-brand px-4 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {pay.isPending ? 'Processando…' : 'Pagar agora'}
            </button>
          )}
        </>
      )}

      {(status === 'PAID' || status === 'EXECUTION_SCHEDULED' || status === 'IN_PROGRESS') && (
        <>
          <p className="mb-3 flex items-start gap-2 rounded-md bg-card-2 px-3 py-2 text-sm text-text-muted">
            <IconConfirmed size={16} className="mt-0.5 shrink-0" />
            {paymentsEnabled
              ? 'Pagamento em custódia. Confirme quando o serviço for concluído para liberar o repasse.'
              : 'Combine o pagamento diretamente com o profissional. Confirme aqui quando o serviço for concluído.'}
          </p>
          {complete.isError && (
            <p className="mb-2 text-sm text-danger">{(complete.error as Error).message}</p>
          )}
          <button
            onClick={() => complete.mutate()}
            disabled={complete.isPending}
            className="w-full rounded-md bg-status-finished px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {complete.isPending ? 'Confirmando…' : 'Confirmar conclusão'}
          </button>
        </>
      )}

      {status === 'FINISHED' && (
        <p className="rounded-md bg-status-finished px-3 py-2 text-center text-sm text-white">
          Serviço concluído e pago. Obrigado!
        </p>
      )}
    </div>
  );
}

/* ───────── Pagamento faseado (milestones) ───────── */
const MILESTONE_STATUS: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING: { label: 'A pagar', cls: 'bg-card-2 text-text-muted' },
  AUTHORIZED: { label: 'Processando', cls: 'bg-card-2 text-text-muted' },
  PAID: { label: 'Em custódia', cls: 'bg-brand/15 text-brand' },
  RELEASED: { label: 'Concluída', cls: 'bg-status-finished/15 text-status-finished' },
  REFUNDED: { label: 'Estornada', cls: 'bg-danger/15 text-danger' },
  FAILED: { label: 'Falhou', cls: 'bg-danger/15 text-danger' },
  CANCELED: { label: 'Cancelada', cls: 'bg-danger/15 text-danger' },
};

function PhasedPaymentSection({
  quoteId,
  totalCents,
  enabled,
}: {
  quoteId: string;
  totalCents: number;
  enabled: boolean;
}) {
  const milestonesQ = useMilestones(quoteId, enabled);
  const payM = usePayMilestone(quoteId);
  const completeM = useCompleteMilestone(quoteId);

  if (milestonesQ.isLoading) return <p className="text-text-muted">Carregando fases…</p>;
  const milestones = milestonesQ.data ?? [];
  if (milestones.length === 0) return null;

  const doneCount = milestones.filter((m) => m.status === 'RELEASED').length;

  return (
    <div className="rounded-lg border border-brand/50 bg-card p-4 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold">Pagamento em fases</span>
        <span className="text-xs text-text-muted">
          {doneCount} de {milestones.length} concluídas
        </span>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-text-muted">Valor total</span>
        <span className="text-lg font-bold text-brand">{formatBRL(totalCents)}</span>
      </div>
      <p className="mb-3 text-xs text-text-muted">
        Você paga cada fase quando ela começa. O valor fica retido e é liberado ao profissional
        quando você confirma a entrega daquela fase.
      </p>

      {(payM.isError || completeM.isError) && (
        <p className="mb-2 text-sm text-danger">
          {((payM.error || completeM.error) as Error)?.message}
        </p>
      )}

      <ol className="space-y-2">
        {milestones.map((m) => {
          const st = MILESTONE_STATUS[m.status];
          const busy = payM.isPending || completeM.isPending;
          return (
            <li key={m.id} className="rounded-md border border-border bg-bg p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {m.order + 1}. {m.title}
                  </p>
                  <p className="text-xs text-text-muted">{formatBRL(m.amountCents)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>
                  {st.label}
                </span>
              </div>

              {/* Fase a pagar (entrada ou solicitada pelo profissional) — mostra PIX após iniciar */}
              {m.status === 'PENDING' && m.isPayable && (
                <div className="mt-2">
                  {m.pixCopyPaste ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-text-muted">PIX copia e cola</p>
                      <textarea
                        readOnly
                        value={m.pixCopyPaste}
                        onFocus={(e) => e.currentTarget.select()}
                        className="w-full break-all rounded-md border border-border bg-card-2 px-2 py-1.5 text-xs"
                        rows={3}
                      />
                      {m.invoiceUrl && (
                        <a
                          href={m.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-md bg-brand px-4 py-2 text-center text-sm font-medium text-white"
                        >
                          Abrir fatura e pagar
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        payM.mutate(m.id, {
                          onSuccess: (data) => {
                            if (data.invoiceUrl) window.open(data.invoiceUrl, '_blank', 'noopener');
                          },
                        })
                      }
                      disabled={busy}
                      className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy ? 'Processando…' : `Pagar esta fase · ${formatBRL(m.amountCents)}`}
                    </button>
                  )}
                </div>
              )}

              {/* Fase paga (em custódia) — confirmar entrega libera o repasse */}
              {m.status === 'PAID' && (
                <button
                  onClick={() => completeM.mutate(m.id)}
                  disabled={busy}
                  className="mt-2 w-full rounded-md bg-status-finished px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {busy ? 'Confirmando…' : 'Confirmar entrega desta fase'}
                </button>
              )}

              {/* Fase pendente: a vez chegou mas o profissional ainda não solicitou */}
              {m.status === 'PENDING' && !m.isPayable && m.isNext && (
                <p className="mt-2 text-xs text-text-muted">
                  Aguardando o profissional solicitar o pagamento desta fase.
                </p>
              )}

              {/* Fase pendente mas ainda não é a vez */}
              {m.status === 'PENDING' && !m.isPayable && !m.isNext && (
                <p className="mt-2 text-xs text-text-muted">Disponível após a fase anterior.</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const visitStatusLabel: Record<VisitStatus, string> = {
  PENDING: 'Pendente',
  SUGGESTED: 'Sugerida',
  CONFIRMED: 'Confirmada',
  RESCHEDULED: 'Reagendada',
  CANCELED: 'Cancelada',
  COMPLETED: 'Concluída',
};

export function VisitItem({
  visit,
  quoteId,
}: {
  visit: {
    id: string;
    type: 'IN_LOCO' | 'EXECUTION';
    status: VisitStatus;
    scheduledAt: string | null;
    endsAt: string | null;
    providerName: string;
  };
  quoteId: string;
}) {
  const confirm = useConfirmVisit(quoteId);
  const reschedule = useRescheduleVisit(quoteId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const slotsQ = useVisitProviderSlots(pickerOpen ? visit.id : undefined, date);

  function close() {
    setPickerOpen(false);
  }

  async function pickSlot(startISO: string) {
    try {
      await reschedule.mutateAsync({ visitId: visit.id, scheduledAt: startISO });
      close();
    } catch {
      /* erro fica no mutation state */
    }
  }

  const canRespond = visit.status === 'SUGGESTED' || visit.status === 'RESCHEDULED';

  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {visit.type === 'IN_LOCO' ? 'Visita técnica' : 'Execução do serviço'}
        </span>
        <span className="text-xs text-text-muted">{visitStatusLabel[visit.status]}</span>
      </div>
      <p className="text-sm text-text-muted">
        {visit.scheduledAt ? formatDateTime(visit.scheduledAt) : '—'}
        {visit.endsAt ? ` → ${formatDateTime(visit.endsAt)}` : ''} · {visit.providerName}
      </p>

      {canRespond && !pickerOpen && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => confirm.mutate(visit.id)}
            disabled={confirm.isPending}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Confirmar
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Sugerir nova data
          </button>
        </div>
      )}

      {canRespond && pickerOpen && (
        <div className="mt-2 space-y-2 rounded-md border border-border p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Escolha um horário livre do profissional
            </span>
            <button type="button" onClick={close} className="text-xs text-text-muted underline">
              cancelar
            </button>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-border bg-bg px-2 py-1.5 text-sm"
          />
          {slotsQ.isLoading && <p className="text-xs text-text-muted">Carregando…</p>}
          {slotsQ.data?.reason === 'OFF_DAY' && (
            <p className="text-xs text-text-muted">
              O profissional não atende nesse dia. Escolha outra data.
            </p>
          )}
          {slotsQ.data?.reason === 'BLOCKED' && (
            <p className="text-xs text-text-muted">
              O profissional não tem disponibilidade nessa data.
            </p>
          )}
          {slotsQ.data?.reason === 'DAY_LIMIT_REACHED' && (
            <p className="text-xs text-text-muted">
              O profissional já está com a agenda cheia nessa data.
            </p>
          )}
          {slotsQ.data && slotsQ.data.slots.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {slotsQ.data.slots.map((s) => (
                <button
                  key={s.startISO}
                  type="button"
                  disabled={!s.available || reschedule.isPending}
                  onClick={() => void pickSlot(s.startISO)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    s.available
                      ? 'border-brand text-brand'
                      : 'border-border text-text-muted opacity-50 line-through'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          {reschedule.isError && (
            <p className="text-xs text-danger">{(reschedule.error as Error).message}</p>
          )}
        </div>
      )}
    </li>
  );
}

export function VisitsSection({ quoteId, status }: { quoteId: string; status: QuoteStatus }) {
  const enabled = !['CREATED', 'WAITING_PROPOSALS'].includes(status);
  const visitsQ = useVisits(quoteId, enabled);

  if (!enabled || !visitsQ.data || visitsQ.data.length === 0) return null;

  return (
    <ul className="space-y-2">
      {visitsQ.data.map((v) => (
        <VisitItem key={v.id} visit={v} quoteId={quoteId} />
      ))}
    </ul>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={n <= value ? 'text-warning' : 'text-border'}
          aria-label={`${n} estrelas`}
        >
          <IconStar size={26} className={n <= value ? 'fill-current' : ''} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ quoteId, status }: { quoteId: string; status: QuoteStatus }) {
  const enabled = status === 'FINISHED';
  const reviewQ = useReview(quoteId, enabled);
  const create = useCreateReview(quoteId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!enabled) return null;

  if (reviewQ.data) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-1 text-lg font-semibold">Sua avaliação</h2>
        <Stars value={reviewQ.data.rating} />
        {reviewQ.data.comment && (
          <p className="mt-1 text-sm text-text-muted">{reviewQ.data.comment}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brand/50 bg-card p-4 shadow-card">
      <h2 className="mb-2 text-lg font-semibold">Avalie o profissional</h2>
      <Stars value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Conte como foi o serviço (opcional)"
        className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2"
      />
      {create.isError && <p className="mt-1 text-sm text-danger">{(create.error as Error).message}</p>}
      <button
        onClick={() => create.mutate({ rating, comment: comment.trim() || undefined })}
        disabled={create.isPending}
        className="mt-2 w-full rounded-md bg-brand px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {create.isPending ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </div>
  );
}
