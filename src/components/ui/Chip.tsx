import type { CSSProperties, ReactNode } from 'react';
import { Chip as HChip } from '@heroui/react';
import type { QuoteStatus } from '../../lib/types';
import { QUOTE_STATUS_META } from '../../lib/status';

/**
 * Pílula de status tintada (fundo translúcido + texto na cor do status + ponto).
 * Aceita um status de orçamento OU um par {label, varName} (estados de negociação).
 */
export function StatusChip({
  status,
  label,
  varName,
  size = 'md',
  icon,
}: {
  status?: QuoteStatus;
  label?: string;
  varName?: string;
  size?: 'sm' | 'md';
  icon?: ReactNode;
}) {
  const meta = status ? QUOTE_STATUS_META[status] : undefined;
  const text = label ?? meta?.label ?? '';
  const cssVar = varName ?? meta?.varName ?? '--color-text-muted';
  const style: CSSProperties = {
    color: `var(${cssVar})`,
    backgroundColor: `color-mix(in srgb, var(${cssVar}) 16%, transparent)`,
  };
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${pad}`}
      style={style}
    >
      {icon ?? <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(${cssVar})` }} />}
      {text}
    </span>
  );
}

/** Chip genérico do design system (encapsula HeroUI Chip). */
export function Chip({
  children,
  color = 'default',
  variant = 'flat',
  size = 'sm',
}: {
  children: ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  variant?: 'flat' | 'solid' | 'bordered' | 'dot';
  size?: 'sm' | 'md';
}) {
  return (
    <HChip color={color} variant={variant} size={size} radius="full">
      {children}
    </HChip>
  );
}
