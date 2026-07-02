import { LuCheck, LuCheckCheck, LuClock, LuTriangleAlert } from 'react-icons/lu';
import type { MessageDeliveryStatus } from './types';

/** Ícone de entrega/leitura (estilo mensageiro), só para mensagens minhas. */
export function MessageStatus({
  status,
  className = '',
}: {
  status?: MessageDeliveryStatus;
  className?: string;
}) {
  if (!status) return null;

  const common = `inline-block ${className}`;
  switch (status) {
    case 'sending':
      return <LuClock size={13} className={`${common} opacity-70`} aria-label="Enviando" />;
    case 'sent':
      return <LuCheck size={13} className={common} aria-label="Enviada" />;
    case 'delivered':
      return <LuCheckCheck size={13} className={common} aria-label="Entregue" />;
    case 'read':
      return <LuCheckCheck size={13} className={`${common} text-sky-300`} aria-label="Lida" />;
    case 'failed':
      return <LuTriangleAlert size={13} className={`${common} text-danger`} aria-label="Falhou" />;
    default:
      return null;
  }
}
