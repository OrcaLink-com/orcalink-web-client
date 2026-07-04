import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCalendarClock, LuLoaderCircle, LuPencil, LuX } from 'react-icons/lu';
import { formatDateTime } from '../lib/format';

interface VisitManageCardProps {
  /** Tipo do agendamento (define o rótulo). */
  type: 'IN_LOCO' | 'EXECUTION';
  scheduledAt: string | null;
  onReschedule: (scheduledAtISO: string, reason: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
}

/** "datetime-local" a partir de um ISO (fuso local do navegador). */
function toLocalInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Card no chat para GERENCIAR um agendamento confirmado (visita técnica ou
 * execução): reagendar (nova data/hora + motivo) ou cancelar (motivo). Fixado
 * acima do input; ambos os lados podem usar.
 */
export function VisitManageCard({ type, scheduledAt, onReschedule, onCancel }: VisitManageCardProps) {
  const [mode, setMode] = useState<'none' | 'reschedule' | 'cancel'>('none');
  const [when, setWhen] = useState(() => toLocalInput(scheduledAt));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kind = type === 'EXECUTION' ? 'Execução' : 'Visita técnica';

  function reset() {
    setMode('none');
    setReason('');
    setError(null);
  }

  async function submit() {
    setError(null);
    if (!reason.trim()) {
      setError('Informe o motivo.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'reschedule') {
        if (!when) {
          setError('Escolha a nova data e horário.');
          return;
        }
        await onReschedule(new Date(when).toISOString(), reason.trim());
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
              onClick={() => {
                setMode('reschedule');
                setWhen(toLocalInput(scheduledAt));
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-content2"
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

      {mode !== 'none' && (
        <div className="mt-3 space-y-2">
          {mode === 'reschedule' && (
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
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
