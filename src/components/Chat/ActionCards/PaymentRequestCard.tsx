import { LuWallet, LuCreditCard, LuCalendar, LuLayers, LuReceipt, LuInfo } from 'react-icons/lu';
import type { PaymentMethod, PaymentRequestPayload } from '../types';
import { BaseActionCard, CardButton, type MetaItem } from './BaseActionCard';
import { formatCents, formatDate } from '../utils';

export interface PaymentRequestCardProps {
  payload: PaymentRequestPayload;
  onPay?: () => Promise<void>;
  onViewDetails?: () => void;
  onDownloadReceipt?: (url: string) => void;
  mine?: boolean;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão',
  boleto: 'Boleto',
  undefined: 'Escolher na hora',
};

export function PaymentRequestCard({ payload, onPay, onViewDetails, onDownloadReceipt, mine }: PaymentRequestCardProps) {
  const paid = payload.status === 'paid';

  const meta: MetaItem[] = [
    { icon: <LuWallet size={15} />, label: 'Valor', value: formatCents(payload.amountCents), emphasize: true },
    { icon: <LuCreditCard size={15} />, label: 'Pagamento', value: METHOD_LABEL[payload.method] },
  ];
  if (payload.installments && payload.installments > 1)
    meta.push({ icon: <LuLayers size={15} />, label: 'Parcelas', value: `${payload.installments}x` });
  if (payload.dueDate)
    meta.push({ icon: <LuCalendar size={15} />, label: 'Vencimento', value: formatDate(payload.dueDate) });
  if (paid && payload.paidAt)
    meta.push({ icon: <LuCalendar size={15} />, label: 'Pago em', value: formatDate(payload.paidAt) });

  return (
    <BaseActionCard
      accent="purple"
      icon={<LuWallet size={22} />}
      title="Solicitação de pagamento"
      subtitle={payload.description}
      description={paid ? undefined : 'O prestador enviou uma cobrança referente ao serviço acordado.'}
      badge={paid ? { label: 'Pago', tone: 'success' } : undefined}
      meta={meta}
      mine={mine}
      actions={
        paid ? (
          payload.receiptUrl ? (
            <CardButton
              variant="secondary"
              icon={<LuReceipt size={16} />}
              onPress={() => onDownloadReceipt?.(payload.receiptUrl!)}
            >
              Ver recibo
            </CardButton>
          ) : undefined
        ) : (
          <>
            <CardButton accent="purple" icon={<LuCreditCard size={17} />} onPress={onPay} successLabel="Pagamento iniciado">
              Pagar agora
            </CardButton>
            <CardButton variant="secondary" icon={<LuInfo size={16} />} onPress={onViewDetails}>
              Ver detalhes
            </CardButton>
          </>
        )
      }
    />
  );
}
