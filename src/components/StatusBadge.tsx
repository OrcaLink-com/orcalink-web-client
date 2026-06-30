import type { QuoteStatus } from '../lib/types';
import { QUOTE_STATUS_META } from '../lib/status';

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const meta = QUOTE_STATUS_META[status];
  return (
    <span
      className={`inline-block rounded-md px-2 py-1 text-xs font-medium text-white ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
