import { LuCircleCheckBig, LuWallet, LuCalendar, LuPlay } from 'react-icons/lu';
import type { QuoteApprovedPayload } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatCents, formatDate } from '../utils';

export interface QuoteApprovedCardProps {
  payload: QuoteApprovedPayload;
  onStartService?: () => Promise<void>;
  mine?: boolean;
}

export function QuoteApprovedCard({ payload, onStartService, mine }: QuoteApprovedCardProps) {
  const meta: MetaItem[] = [
    { icon: <LuWallet size={15} />, label: 'Valor aprovado', value: formatCents(payload.amountCents), emphasize: true },
    { icon: <LuCalendar size={15} />, label: 'Aprovado em', value: formatDate(payload.approvedAt) },
  ];

  return (
    <BaseActionCard
      accent="green"
      icon={<LuCircleCheckBig size={22} />}
      title="Orçamento aprovado"
      description={payload.summary ?? 'Proposta aceita — tudo certo para começar o serviço.'}
      badge={{ label: 'Aprovado', tone: 'success' }}
      meta={meta}
      mine={mine}
      actions={
        onStartService ? (
          <CardButton accent="green" icon={<LuPlay size={17} />} onPress={onStartService} successLabel="Iniciado!">
            Iniciar serviço
          </CardButton>
        ) : undefined
      }
    />
  );
}
