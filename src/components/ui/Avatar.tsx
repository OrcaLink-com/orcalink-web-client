import { Avatar as HAvatar } from '@heroui/react';
import { IconStar } from '../icons';

const PALETTE = ['#3b82f6', '#8b7cf6', '#22c55e', '#f5a623', '#2dd4a7', '#f0616d'];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const sizeMap = { sm: 'sm', md: 'md', lg: 'lg' } as const;

/** Avatar do design system (HeroUI Avatar): foto (src) ou iniciais com cor determinística. */
export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  return (
    <HAvatar
      name={initial}
      src={src ?? undefined}
      size={sizeMap[size]}
      radius="full"
      className="shrink-0 font-semibold text-white"
      style={src ? undefined : { backgroundColor: colorFor(name || '?') }}
      getInitials={(n) => n}
    />
  );
}

/** Estrela + nota (usa o ícone Lucide). */
export function RatingStars({ value, count }: { value: number; count?: number }) {
  if (!value && !count) return <span className="text-xs text-text-muted">Sem avaliações</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-warning">
      <IconStar className="fill-current" size={12} />
      {value.toFixed(1)}
      {count != null && <span className="text-text-muted">({count})</span>}
    </span>
  );
}
