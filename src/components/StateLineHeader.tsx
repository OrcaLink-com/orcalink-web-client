import type { ReactNode } from 'react';

/**
 * Banner "o que está acontecendo agora / próximo passo". Ícone Lucide + frase.
 */
export interface StateLine {
  icon: ReactNode;
  text: string;
  /** 'info' (neutro), 'attention' (espera você), 'success'. */
  tone?: 'info' | 'attention' | 'success';
}

const toneClass: Record<NonNullable<StateLine['tone']>, string> = {
  info: 'border-border bg-content1 text-foreground',
  attention: 'border-warning/40 bg-warning/10 text-foreground',
  success: 'border-success/40 bg-success/10 text-foreground',
};
const iconTone: Record<NonNullable<StateLine['tone']>, string> = {
  info: 'bg-content2 text-text-muted',
  attention: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
};

export function StateLineHeader({ state, extra }: { state: StateLine; extra?: ReactNode }) {
  const tone = state.tone ?? 'info';
  return (
    <div className={`flex items-center gap-3 rounded-large border px-3.5 py-3 ${toneClass[tone]}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconTone[tone]}`}>
        {state.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{state.text}</p>
        {extra && <div className="mt-1 text-xs text-text-muted">{extra}</div>}
      </div>
    </div>
  );
}
