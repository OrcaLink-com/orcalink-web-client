import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuChevronLeft,
  LuChevronRight,
  LuGlobe,
  LuImages,
  LuInstagram,
  LuMapPin,
  LuPhone,
  LuX,
} from 'react-icons/lu';
import { useProviderPublicProfile } from '../../lib/queries';
import { Avatar, Card, RatingStars, Spinner } from '../../components/ui';
import type { PortfolioItem, PublicProviderProfile } from '../../lib/types';

/** Perfil público da empresa do prestador — apresentação para o cliente confiar antes de contratar. */
export function ProviderProfilePage() {
  const { providerId = '' } = useParams();
  const navigate = useNavigate();
  const q = useProviderPublicProfile(providerId);

  if (q.isLoading) return <Spinner label="Carregando perfil…" />;
  if (q.isError || !q.data)
    return <p className="p-6 text-center text-sm text-danger">Não foi possível carregar este perfil.</p>;

  const p = q.data;
  const years = p.foundedYear ? Math.max(0, new Date().getFullYear() - p.foundedYear) : null;
  const title = p.companyName || p.tradeName || p.name;

  // Trio de provas de confiança (sempre 3 colunas) — usa o dado mais rico disponível.
  const stats: { label: string; value: string }[] = [
    { label: 'Avaliação', value: p.ratingCount > 0 ? p.ratingAvg.toFixed(1) : 'Novo' },
    years != null
      ? { label: 'Atuação', value: years === 0 ? '< 1 ano' : `${years} ${years === 1 ? 'ano' : 'anos'}` }
      : { label: 'Avaliações', value: String(p.ratingCount) },
    p.avgResponseMinutes != null
      ? { label: 'Resposta', value: `~${formatMinutes(p.avgResponseMinutes)}` }
      : { label: 'Categorias', value: String(p.categories.length) },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground"
      >
        <LuArrowLeft size={15} /> Voltar
      </button>

      {/* Capa + identidade + provas de confiança */}
      <Card className="overflow-hidden p-0 shadow-card">
        <div className="relative h-44 w-full sm:h-52">
          {p.coverUrl ? (
            <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/40 via-brand-secondary/25 to-content1" />
          )}
          {/* Brilho + scrim para legibilidade sobre qualquer capa */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_0%,rgba(59,130,246,0.28),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-content1 to-transparent" />
        </div>

        <div className="px-5 pb-5">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:text-left">
            <div className="-mt-16 shrink-0 sm:-mt-14">
              <div className="h-28 w-28 overflow-hidden rounded-3xl bg-content2 shadow-pop ring-4 ring-content1">
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Avatar name={p.name} size="lg" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
                <span title="Profissional verificado" className="inline-flex shrink-0 text-primary">
                  <LuBadgeCheck size={20} />
                </span>
              </div>
              {p.tradeName && p.tradeName !== title && (
                <p className="mt-0.5 text-sm text-text-muted">{p.tradeName}</p>
              )}
              <div className="mt-2 flex items-center justify-center gap-1.5 sm:justify-start">
                <RatingStars value={p.ratingAvg} count={p.ratingCount} />
              </div>
            </div>
          </div>

          {/* Provas de confiança — trio de destaque */}
          {stats.length > 0 && (
            <div className="mt-5 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-content2/40">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-0.5 px-2 py-3.5">
                  <span className="text-xl font-bold text-foreground">{s.value}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Descrição / história */}
      {(p.bio || p.history) && (
        <Card className="space-y-3 p-4">
          {p.bio && <p className="text-sm leading-relaxed text-foreground/90">{p.bio}</p>}
          {p.history && (
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Nossa história</h2>
              <p className="text-sm leading-relaxed text-text-muted">{p.history}</p>
            </div>
          )}
        </Card>
      )}

      {/* Especialidades / categorias / cidades */}
      {(p.specialties.length > 0 || p.categories.length > 0 || p.citiesServed.length > 0) && (
        <Card className="space-y-4 p-4">
          {p.categories.length > 0 && (
            <ChipRow title="Categorias atendidas" items={p.categories.map((c) => c.name)} />
          )}
          {p.specialties.length > 0 && <ChipRow title="Especialidades" items={p.specialties} />}
          {p.citiesServed.length > 0 && (
            <div>
              <h2 className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                <LuMapPin size={12} /> Áreas atendidas
              </h2>
              <p className="text-sm text-foreground/90">{p.citiesServed.join(' · ')}</p>
            </div>
          )}
        </Card>
      )}

      {/* Portfólio — cada trabalho é um post com várias fotos (abre em galeria). */}
      {p.portfolio.length > 0 && <PortfolioPosts items={p.portfolio} />}

      {/* Avaliações */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">
          Avaliações {p.ratingCount > 0 && <span className="text-text-muted">({p.ratingCount})</span>}
        </h2>
        {p.reviews.length === 0 ? (
          <Card className="p-4 text-center text-sm text-text-muted">Ainda sem avaliações.</Card>
        ) : (
          <div className="space-y-2.5">
            {p.reviews.map((r, i) => (
              <Card key={i} className="p-3.5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{r.authorName}</span>
                  <RatingStars value={r.rating} />
                </div>
                {r.comment && <p className="text-sm text-text-muted">{r.comment}</p>}
                <p className="mt-1 text-[11px] text-text-muted">
                  {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Contato */}
      {(p.phone || p.social.whatsapp || p.social.website || p.social.instagram) && (
        <Card className="space-y-2 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Contato</h2>
          {p.phone && <ContactRow icon={<LuPhone size={14} />} label={p.phone} />}
          {p.social.whatsapp && <ContactRow icon={<LuPhone size={14} />} label={`WhatsApp: ${p.social.whatsapp}`} />}
          {p.social.instagram && <ContactRow icon={<LuInstagram size={14} />} label={p.social.instagram} />}
          {p.social.website && <ContactRow icon={<LuGlobe size={14} />} label={p.social.website} href={ensureHttp(p.social.website)} />}
        </Card>
      )}
    </div>
  );
}

/** Fotos de um post (compat: item antigo tinha só `url`). */
function imagesOf(it: PortfolioItem): string[] {
  return it.images?.length ? it.images : it.url ? [it.url] : [];
}

/** Portfólio em "posts": grade de capas → abre uma galeria (lightbox) com todas as fotos do post. */
function PortfolioPosts({ items }: { items: PortfolioItem[] }) {
  const [post, setPost] = useState<number | null>(null);
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  const openPost = post != null ? items[post] : null;
  const imgs = openPost ? imagesOf(openPost) : [];
  const count = imgs.length;

  const close = useCallback(() => setPost(null), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (post == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [post, close, prev, next]);

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Portfólio</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((it, i) => {
          const photos = imagesOf(it);
          const cover = photos[0];
          if (!cover) return null;
          return (
            <button
              key={it.id ?? cover}
              type="button"
              onClick={() => {
                setIdx(0);
                setPost(i);
              }}
              className="group overflow-hidden rounded-2xl border border-border bg-content1 text-left shadow-card transition-shadow hover:shadow-pop"
            >
              <div className="relative overflow-hidden">
                <img
                  src={cover}
                  alt={it.title ?? ''}
                  loading="lazy"
                  className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {photos.length > 1 && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                    <LuImages size={12} /> {photos.length}
                  </span>
                )}
                {(it.title || it.date) && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                    {it.title && <p className="font-semibold text-white">{it.title}</p>}
                    {it.date && <p className="text-[11px] text-white/70">{it.date}</p>}
                  </div>
                )}
              </div>
              {it.description && <p className="line-clamp-2 p-3 text-sm text-text-muted">{it.description}</p>}
            </button>
          );
        })}
      </div>

      {openPost && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={openPost.title ?? 'Trabalho'}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx > 50) prev();
            else if (dx < -50) next();
            touchX.current = null;
          }}
        >
          <button
            onClick={close}
            aria-label="Fechar"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <LuX size={20} />
          </button>
          <div className="relative flex flex-1 items-center justify-center px-4">
            {count > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Foto anterior"
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              >
                <LuChevronLeft size={24} />
              </button>
            )}
            <img
              src={imgs[idx]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-[75vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            />
            {count > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Próxima foto"
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              >
                <LuChevronRight size={24} />
              </button>
            )}
          </div>
          <div className="shrink-0 space-y-1 px-5 pb-6 text-center text-white" onClick={(e) => e.stopPropagation()}>
            {openPost.title && <p className="text-lg font-semibold">{openPost.title}</p>}
            {openPost.description && <p className="mx-auto max-w-xl text-sm text-white/80">{openPost.description}</p>}
            {count > 1 && <p className="text-xs text-white/60">{idx + 1} / {count}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function ChipRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-full border border-border bg-content2/70 px-3 py-1 text-xs font-medium text-foreground/90"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContactRow({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const content = (
    <span className="flex items-center gap-2 text-sm text-foreground/90">
      <span className="text-text-muted">{icon}</span>
      {label}
    </span>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="hover:text-primary">
      {content}
    </a>
  ) : (
    content
  );
}

function ensureHttp(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export type { PublicProviderProfile };
