import { dayLabel } from './utils';

/** Separador de dia centralizado ("Hoje" / "Ontem" / data). */
export function ChatDateDivider({ iso }: { iso: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full border border-border bg-content1/80 px-3 py-1 text-[11px] font-medium text-text-muted shadow-sm backdrop-blur">
        {dayLabel(iso)}
      </span>
    </div>
  );
}
