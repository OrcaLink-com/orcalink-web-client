import { IconStar } from './icons';
import type { ShowcaseReview } from '../lib/types';

/** Estrelas preenchidas conforme a nota (1..5). */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-warning" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} size={14} className={i < rating ? 'fill-current' : 'text-content3'} />
      ))}
    </div>
  );
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (src) {
    return <img src={src} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
      {initials || '★'}
    </span>
  );
}

function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

/**
 * Card de avaliação pública (landing + página /avaliacoes). O nome já vem
 * abreviado do backend (dado sensível preservado).
 */
export function ReviewCard({ review }: { review: ShowcaseReview }) {
  return (
    <figure className="flex h-full flex-col rounded-large border border-border bg-content1 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <Avatar name={review.authorName} src={review.avatarUrl} />
        <div className="min-w-0">
          <figcaption className="truncate text-sm font-semibold">{review.authorName}</figcaption>
          {review.category && <p className="truncate text-xs text-text-muted">{review.category}</p>}
        </div>
      </div>
      <Stars rating={review.rating} />
      {review.comment && (
        <blockquote className="mt-2 flex-1 text-sm text-foreground">"{review.comment}"</blockquote>
      )}
      <p className="mt-3 text-xs text-text-muted">{monthYear(review.createdAt)}</p>
    </figure>
  );
}
