import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCalendarClock, LuLoaderCircle, LuPencil, LuX } from 'react-icons/lu';
import { formatDateTime } from '../lib/format';
import { useVisitProviderSlots } from '../lib/queries';

interface VisitManageCardProps {
  /** Id do agendamento (para buscar os horários livres do profissional). */
  visitId: string;
  /** Tipo do agendamento (define o rótulo). */
  type: 'IN_LOCO' | 'EXECUTION';
  scheduledAt: string | null;
  onReschedule: (scheduledAtISO: string, reason: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
}

/** "YYYY-MM-DD" (data local) a partir de um ISO. */
function toDateInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Card no chat para GERENCIAR um agendamento confirmado (visita técnica ou
 * execução): reagendar (nova data → horário livre do profissional) ou cancelar.
 * O horário vem dos **slots disponíveis** do profissional (não é digitado livre),
 * garantindo que a nova data respeita a agenda — e evitando o seletor nativo de
 * hora, que no iOS causava scroll e horários inválidos (ex.: 10:13).
 */
export function VisitManageCard({ visitId, type, scheduledAt, onReschedule, onCancel }: VisitManageCardProps) {
  const [mode, setMode] = useState<'none' | 'reschedule' | 'cancel'>('none');
  const [date, setDate] = useState(() => toDateInput(scheduledAt));
  const [slotISO, setSlotISO] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotsQ = useVisitProviderSlots(visitId, mode === 'reschedule' ? date : undefined);

  const kind = type === 'EXECUTION' ? 'Execução' : 'Visita técnica';
  // Regra: o cliente só reagenda com no mínimo 2 dias de antecedência (o backend também valida).
  const canReschedule =
    !scheduledAt || new Date(scheduledAt).getTime() - Date.now() >= 2 * 24 * 60 * 60 * 1000;

  function reset() {
    setMode('none');
    setReason('');
    setSlotISO('');
    setError(null);
  }

  async function submit() {
    setError(null);
    if (!reason.trim()) {
      setError('Informe o motivo.');
      return;
    }
    if (mode === 'reschedule' && !slotISO) {
      setError('Escolha um horário disponível.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'reschedule') {
        await onReschedule(slotISO, reason.trim());
      } else {
        await onCancel(reason.trim());
      }
      reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border bg-content1/70 px-3 py-3"
    >
      <div className="flex items-center gap-2 text-sm">
        <LuCalendarClock size={18} className="shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{kind} agendada</p>
          <p className="truncate text-xs text-text-muted">{scheduledAt ? formatDateTime(scheduledAt) : '—'}</p>
        </div>
        {mode === 'none' && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={!canReschedule}
              title={canReschedule ? undefined : 'Só é possível reagendar com pelo menos 2 dias de antecedência.'}
              onClick={() => {
                setMode('reschedule');
                setDate(toDateInput(scheduledAt));
                setSlotISO('');
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-content2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LuPencil size={13} /> Reagendar
            </button>
            <button
              type="button"
              onClick={() => setMode('cancel')}
              className="inline-flex items-center gap-1 rounded-lg border border-danger/40 px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
            >
              <LuX size={13} /> Cancelar
            </button>
          </div>
        )}
      </div>

      {mode === 'none' && !canReschedule && (
        <p className="mt-2 text-[11px] text-text-muted">
          Reagendamento pelo app só com 2+ dias de antecedência. Para mudanças de última hora, fale com o profissional no chat.
        </p>
      )}

      {mode !== 'none' && (
        <div className="mt-3 space-y-2">
          {mode === 'reschedule' && (
            <>
              <label className="block text-xs font-medium text-text-muted">Nova data</label>
              <input
                type="date"
                value={date}
                min={toDateInput(new Date().toISOString())}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlotISO('');
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <p className="text-xs font-medium text-text-muted">Horários disponíveis do profissional</p>
              {slotsQ.isLoading && <p className="text-xs text-text-muted">Carregando horários…</p>}
              {slotsQ.data?.reason === 'OFF_DAY' && (
                <p className="rounded-md bg-card px-2 py-1 text-xs text-warning">
                  O profissional não atende nesse dia. Escolha outra data.
                </p>
              )}
              {slotsQ.data?.reason === 'DAY_LIMIT_REACHED' && (
                <p className="rounded-md bg-card px-2 py-1 text-xs text-warning">
                  Sem horários livres nesse dia. Escolha outra data.
                </p>
              )}
              {slotsQ.data && slotsQ.data.slots.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {slotsQ.data.slots.map((s) => (
                    <button
                      type="button"
                      key={s.startISO}
                      onClick={() => s.available && setSlotISO(s.startISO)}
                      disabled={!s.available}
                      className={`rounded-md border px-2.5 py-1 text-xs ${
                        slotISO === s.startISO
                          ? 'border-primary bg-primary/10 font-medium text-primary'
                          : s.available
                            ? 'border-border hover:bg-content2'
                            : 'border-border text-text-muted opacity-50 line-through'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              {slotsQ.data && slotsQ.data.slots.length === 0 && !slotsQ.data.reason && (
                <p className="text-xs text-text-muted">Nenhum horário livre nesse dia.</p>
              )}
            </>
          )}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={mode === 'reschedule' ? 'Motivo do reagendamento (obrigatório)' : 'Motivo do cancelamento (obrigatório)'}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={loading}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-content2 disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                mode === 'cancel' ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-brand-secondary'
              }`}
            >
              {loading && <LuLoaderCircle size={15} className="animate-spin" />}
              {mode === 'reschedule' ? 'Reagendar' : 'Confirmar cancelamento'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
