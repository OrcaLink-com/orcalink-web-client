import { formatBRL } from '../../lib/format';

/** Valor monetário formatado em BRL a partir de centavos. */
export function Money({
  cents,
  className = '',
}: {
  cents: number;
  className?: string;
}) {
  return <span className={className}>{formatBRL(cents)}</span>;
}
