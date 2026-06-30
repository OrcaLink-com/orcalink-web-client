import type { ReactNode } from 'react';
import { Card as HCard } from '@heroui/react';
import { Link } from 'react-router-dom';

type Variant = 'default' | 'interactive' | 'highlight';

const variantClass: Record<Variant, string> = {
  default: 'border border-border',
  interactive: 'border border-border',
  highlight: 'border border-primary/40 bg-primary/5',
};

/**
 * Superfície base do design system (encapsula HeroUI Card).
 * `to` → link clicável; `onClick` → botão; senão estática.
 * O `className` (incl. padding p-*) vai direto no card — sem CardBody, evita conflito.
 */
export function Card({
  children,
  variant = 'default',
  className = 'p-4',
  to,
  onClick,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  to?: string;
  onClick?: () => void;
}) {
  const pressable = Boolean(to || onClick);
  const base = `block bg-content1 text-foreground shadow-card transition-all duration-200 ${
    variantClass[pressable ? 'interactive' : variant]
  } ${pressable ? 'hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-pop' : ''} ${className}`;

  if (to) {
    return (
      <HCard as={Link} to={to} isPressable shadow="none" radius="lg" className={base}>
        {children}
      </HCard>
    );
  }
  if (onClick) {
    return (
      <HCard isPressable onPress={onClick} shadow="none" radius="lg" className={`w-full text-left ${base}`}>
        {children}
      </HCard>
    );
  }
  return (
    <HCard shadow="none" radius="lg" className={base}>
      {children}
    </HCard>
  );
}
