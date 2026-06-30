import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconBack } from '../icons';

/** Título de seção com ação opcional à direita. */
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      {action}
    </div>
  );
}

/** Cabeçalho de tela: título grande + subtítulo + ação/voltar opcional. */
export function PageHeader({
  title,
  subtitle,
  backTo,
  action,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="mb-1 inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground"
          >
            <IconBack size={15} /> Voltar
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
