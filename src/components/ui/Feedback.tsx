import type { ReactNode } from 'react';
import { Spinner as HSpinner } from '@heroui/react';

/** Spinner do design system. */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
      <HSpinner size="sm" color="primary" />
      {label && <span>{label}</span>}
    </div>
  );
}

/** Estado vazio premium (ícone Lucide em destaque + texto + ação opcional). */
export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-large border border-dashed border-border bg-content1/40 px-6 py-12 text-center">
      {icon && (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-content2 text-2xl text-text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
