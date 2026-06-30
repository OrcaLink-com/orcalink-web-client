import type { ReactNode } from 'react';

/** Bloco compacto com número grande + rótulo (ex.: Total / Com propostas / Concluídos). */
export function StatCard({
  value,
  label,
  icon,
  accent = false,
}: {
  value: number | string;
  label: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 rounded-large border border-border bg-content1 px-3 py-3.5 text-center shadow-card">
      {icon && (
        <div className={`mb-1 flex justify-center text-base ${accent ? 'text-primary' : 'text-text-muted'}`}>
          {icon}
        </div>
      )}
      <p className={`text-2xl font-bold leading-none ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  );
}
