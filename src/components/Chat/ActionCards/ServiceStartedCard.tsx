import { motion } from 'framer-motion';
import { LuHardHat, LuUser, LuCalendarClock, LuArrowUpRight } from 'react-icons/lu';
import type { ServiceStartedPayload } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatDate } from '../utils';

export interface ServiceStartedCardProps {
  payload: ServiceStartedPayload;
  onViewService?: () => void;
  mine?: boolean;
}

export function ServiceStartedCard({ payload, onViewService, mine }: ServiceStartedCardProps) {
  const meta: MetaItem[] = [
    { icon: <LuUser size={15} />, label: 'Profissional', value: payload.professionalName, emphasize: true },
  ];
  if (payload.expectedCompletionAt)
    meta.push({ icon: <LuCalendarClock size={15} />, label: 'Previsão', value: formatDate(payload.expectedCompletionAt) });

  const progress = Math.max(0, Math.min(100, payload.progress ?? 0));

  return (
    <BaseActionCard
      accent="blue"
      icon={<LuHardHat size={22} />}
      title="Serviço em andamento"
      description="O profissional iniciou a execução do serviço."
      badge={{ label: 'Em execução', tone: 'accent' }}
      meta={meta}
      mine={mine}
      actions={
        onViewService ? (
          <CardButton variant="secondary" icon={<LuArrowUpRight size={16} />} onPress={onViewService}>
            Ver serviço
          </CardButton>
        ) : undefined
      }
    >
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
          <span>Progresso</span>
          <span className="font-semibold text-sky-300">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-content2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </BaseActionCard>
  );
}
