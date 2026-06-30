import { ReactNode } from 'react';

/**
 * Tab horizontal scrollable, mobile-first. Cada tab pode exibir um badge numérico
 * (visivelmente destacado quando há ação pendente).
 */
export interface TabItem<T extends string> {
  id: T;
  label: string;
  badge?: number; // 0/undefined = sem badge
  hidden?: boolean; // ex: aba "Propostas" só visível quando há finais pendentes
}

export function Tabs<T extends string>({
  items,
  active,
  onChange,
}: {
  items: ReadonlyArray<TabItem<T>>;
  active: T;
  onChange: (id: T) => void;
}): ReactNode {
  return (
    <div className="-mx-4 mb-3 border-b border-border">
      <div className="flex gap-1 overflow-x-auto px-4">
        {items
          .filter((t) => !t.hidden)
          .map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                className={`flex shrink-0 items-center gap-1 border-b-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-brand font-medium text-brand'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                <span>{t.label}</span>
                {t.badge != null && t.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold leading-tight ${
                      isActive ? 'bg-brand text-white' : 'bg-card text-text-muted'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
