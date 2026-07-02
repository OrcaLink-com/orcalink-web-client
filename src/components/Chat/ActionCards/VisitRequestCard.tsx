import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuCalendarClock, LuCalendar, LuClock, LuCheck, LuX, LuMessageCircle } from 'react-icons/lu';
import type { VisitRequestPayload, VisitStatus } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatDate } from '../utils';
import { collapse } from '../animations';

export interface VisitRequestCardProps {
  payload: VisitRequestPayload;
  onAccept?: () => Promise<void>;
  onDecline?: () => Promise<void>;
  onSuggest?: (date: string, time: string) => Promise<void>;
  mine?: boolean;
}

const BADGE: Partial<Record<VisitStatus, { label: string; tone: 'success' | 'danger' | 'muted' }>> = {
  accepted: { label: 'Aceita', tone: 'success' },
  declined: { label: 'Recusada', tone: 'danger' },
  rescheduled: { label: 'Nova data enviada', tone: 'muted' },
};

export function VisitRequestCard({ payload, onAccept, onDecline, onSuggest, mine }: VisitRequestCardProps) {
  const [suggesting, setSuggesting] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const pending = payload.status === 'pending';

  const meta: MetaItem[] = [
    { icon: <LuCalendar size={15} />, label: 'Data sugerida', value: formatDate(payload.suggestedDate), emphasize: true },
    { icon: <LuClock size={15} />, label: 'Horário sugerido', value: payload.suggestedTime },
  ];

  return (
    <BaseActionCard
      accent="green"
      icon={<LuCalendarClock size={22} />}
      title="Solicitação de visita"
      subtitle={[payload.providerName, payload.serviceLabel].filter(Boolean).join(' · ')}
      description="O prestador solicitou uma visita para avaliar o serviço."
      badge={BADGE[payload.status]}
      meta={meta}
      mine={mine}
      actions={
        pending ? (
          <>
            <AnimatePresence initial={false}>
              {suggesting && (
                <motion.div variants={collapse} initial="initial" animate="animate" exit="exit" className="overflow-hidden">
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs text-text-muted">
                      Data
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-primary"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-text-muted">
                      Horário
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-primary"
                      />
                    </label>
                  </div>
                  <CardButton
                    accent="green"
                    disabled={!date || !time}
                    successLabel="Sugestão enviada"
                    onPress={onSuggest ? () => onSuggest(date, time) : undefined}
                  >
                    Enviar sugestão
                  </CardButton>
                </motion.div>
              )}
            </AnimatePresence>

            {!suggesting && (
              <>
                <CardButton accent="green" icon={<LuCheck size={17} />} onPress={onAccept} successLabel="Aceita!">
                  Aceitar
                </CardButton>
                <div className="grid grid-cols-2 gap-2">
                  <CardButton variant="secondary" icon={<LuX size={16} />} onPress={onDecline}>
                    Recusar
                  </CardButton>
                  <CardButton variant="secondary" icon={<LuMessageCircle size={16} />} onPress={() => setSuggesting(true)}>
                    Sugerir outra
                  </CardButton>
                </div>
              </>
            )}
          </>
        ) : undefined
      }
    />
  );
}
