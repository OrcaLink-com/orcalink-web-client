import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronRight } from '../icons';

/**
 * Linha de lista reutilizável (ex.: itens do "Eu", navegação simples).
 * Ícone à esquerda + título/subtítulo + chevron (ou ação custom) à direita.
 */
export function ListRow({
  icon,
  title,
  subtitle,
  to,
  onClick,
  trailing,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  to?: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {icon && <span className="text-text-muted">{icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {subtitle && <div className="truncate text-xs text-text-muted">{subtitle}</div>}
      </div>
      {trailing ?? <IconChevronRight className="text-text-muted" size={18} />}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block hover:bg-content2">
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left hover:bg-content2">
        {inner}
      </button>
    );
  }
  return inner;
}
