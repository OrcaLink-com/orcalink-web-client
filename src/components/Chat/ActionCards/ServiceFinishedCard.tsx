import { LuBadgeCheck, LuCalendar, LuStar, LuReceipt } from 'react-icons/lu';
import type { ServiceFinishedPayload } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatDate } from '../utils';

export interface ServiceFinishedCardProps {
  payload: ServiceFinishedPayload;
  onLeaveReview?: () => void;
  onDownloadReceipt?: (url: string) => void;
  mine?: boolean;
}

export function ServiceFinishedCard({ payload, onLeaveReview, onDownloadReceipt, mine }: ServiceFinishedCardProps) {
  const rated = typeof payload.rating === 'number';

  const meta: MetaItem[] = [
    { icon: <LuCalendar size={15} />, label: 'Concluído em', value: formatDate(payload.finishedAt), emphasize: true },
  ];

  return (
    <BaseActionCard
      accent="green"
      icon={<LuBadgeCheck size={22} />}
      title="Serviço concluído"
      description="O serviço foi finalizado. Obrigado por usar o OrcaLink!"
      badge={{ label: 'Concluído', tone: 'success' }}
      meta={meta}
      mine={mine}
      actions={
        <>
          {rated ? (
            <div className="flex items-center justify-center gap-1 rounded-xl bg-content2 py-2.5 text-sm">
              <span className="text-text-muted">Sua avaliação:</span>
              <Stars value={payload.rating ?? 0} />
            </div>
          ) : (
            onLeaveReview && (
              <CardButton accent="green" icon={<LuStar size={17} />} onPress={onLeaveReview}>
                Avaliar profissional
              </CardButton>
            )
          )}
          {payload.receiptUrl && (
            <CardButton
              variant="secondary"
              icon={<LuReceipt size={16} />}
              onPress={() => onDownloadReceipt?.(payload.receiptUrl!)}
            >
              Baixar recibo
            </CardButton>
          )}
        </>
      }
    />
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <LuStar
          key={n}
          size={16}
          className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-text-muted'}
        />
      ))}
    </span>
  );
}
