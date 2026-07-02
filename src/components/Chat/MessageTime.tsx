import { formatTime } from './utils';

/** Horário curto (HH:mm) exibido no rodapé da bolha. */
export function MessageTime({
  iso,
  className = '',
}: {
  iso: string;
  className?: string;
}) {
  return (
    <time dateTime={iso} className={`text-[10px] leading-none ${className}`}>
      {formatTime(iso)}
    </time>
  );
}
