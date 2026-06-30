import type { ReactNode } from 'react';

export type TimelineTone = 'done' | 'current' | 'pending';

export interface TimelineItem {
  id: string;
  /** Rótulo curto à esquerda (ex.: data · autor). */
  meta?: string;
  title: ReactNode;
  body?: ReactNode;
  /** Ação inline opcional (botões) no canto direito do card. */
  action?: ReactNode;
  tone?: TimelineTone;
  /** Marca o item como "atual" — destaca a borda. */
  current?: boolean;
}

const dotByTone: Record<TimelineTone, string> = {
  done: 'bg-success/20 text-success',
  current: 'bg-primary/20 text-primary ring-2 ring-primary/30',
  pending: 'bg-content2 text-text-muted',
};

/**
 * Trilha vertical premium: ponto + linha conectora à esquerda, card de evento à direita.
 * Base do histórico do orçamento e do acompanhamento da negociação.
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-0">
      {items.map((item, i) => {
        const tone = item.tone ?? 'done';
        const last = i === items.length - 1;
        return (
          <li key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dotByTone[tone]}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
              </span>
              {!last && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={`flex-1 ${last ? 'pb-0' : 'pb-4'}`}>
              {item.meta && <p className="mb-1 text-[11px] text-text-muted">{item.meta}</p>}
              <div
                className={`rounded-large border bg-content1 px-3.5 py-3 ${
                  item.current ? 'border-primary/60 shadow-card' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 text-sm font-medium">{item.title}</div>
                  {item.action && <div className="shrink-0">{item.action}</div>}
                </div>
                {item.body && <div className="mt-1 text-xs text-text-muted">{item.body}</div>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
