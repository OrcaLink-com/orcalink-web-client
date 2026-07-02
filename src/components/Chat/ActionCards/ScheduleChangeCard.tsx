import { LuCalendarSync, LuCalendar, LuClock, LuCheck, LuX } from 'react-icons/lu';
import type { ScheduleChangePayload, VisitStatus } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatDate } from '../utils';

export interface ScheduleChangeCardProps {
  payload: ScheduleChangePayload;
  onAccept?: () => Promise<void>;
  onDecline?: () => Promise<void>;
  mine?: boolean;
}

const BADGE: Partial<Record<VisitStatus, { label: string; tone: 'success' | 'danger' | 'muted' }>> = {
  accepted: { label: 'Aceita', tone: 'success' },
  declined: { label: 'Recusada', tone: 'danger' },
};

export function ScheduleChangeCard({ payload, onAccept, onDecline, mine }: ScheduleChangeCardProps) {
  const pending = payload.status === 'pending' || payload.status === 'rescheduled';
  const who = payload.proposedBy === 'client' ? 'O cliente' : 'O prestador';

  const meta: MetaItem[] = [
    { icon: <LuCalendar size={15} />, label: 'Nova data', value: formatDate(payload.newDate), emphasize: true },
    { icon: <LuClock size={15} />, label: 'Novo horário', value: payload.newTime },
  ];

  return (
    <BaseActionCard
      accent="blue"
      icon={<LuCalendarSync size={22} />}
      title="Sugestão de nova data"
      description={`${who} sugeriu remarcar a visita.`}
      badge={BADGE[payload.status]}
      meta={meta}
      mine={mine}
      actions={
        pending ? (
          <>
            <CardButton accent="blue" icon={<LuCheck size={17} />} onPress={onAccept} successLabel="Aceita!">
              Aceitar nova data
            </CardButton>
            <CardButton variant="secondary" icon={<LuX size={16} />} onPress={onDecline}>
              Recusar
            </CardButton>
          </>
        ) : undefined
      }
    />
  );
}
