import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
  LuMessageCircle,
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

      {/* Contato — logo após a apresentação, para facilitar o primeiro contato. */}
      <ContactCard p={p} />

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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-content2 text-left"
            >
              <img
                src={cover}
                alt={it.title ?? ''}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* escurece no hover para o título aparecer sempre legível */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition-opacity" />
              {photos.length > 1 && (
                <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <LuImages size={11} /> {photos.length}
                </span>
              )}
              {it.title && (
                <p className="absolute inset-x-0 bottom-0 line-clamp-2 p-2 text-xs font-semibold leading-tight text-white">
                  {it.title}
                </p>
              )}
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

/** Canais de contato como "tiles" clicáveis (WhatsApp, telefone, Instagram, site). */
function ContactCard({ p }: { p: PublicProviderProfile }) {
  const wa = p.social.whatsapp ? p.social.whatsapp.replace(/\D/g, '') : '';
  const ig = p.social.instagram
    ? p.social.instagram
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
    : '';
  const channels: {
    key: string;
    icon: ReactNode;
    label: string;
    sub?: string;
    href: string;
    accent: string;
  }[] = [];
  if (wa)
    channels.push({
      key: 'wa',
      icon: <LuMessageCircle size={18} />,
      label: 'WhatsApp',
      sub: p.social.whatsapp ?? undefined,
      href: `https://wa.me/${wa}`,
      accent: 'bg-emerald-500/15 text-emerald-400',
    });
  if (p.phone)
    channels.push({
      key: 'tel',
      icon: <LuPhone size={18} />,
      label: 'Telefone',
      sub: p.phone,
      href: `tel:${p.phone.replace(/\s/g, '')}`,
      accent: 'bg-primary/15 text-primary',
    });
  if (ig)
    channels.push({
      key: 'ig',
      icon: <LuInstagram size={18} />,
      label: 'Instagram',
      sub: `@${ig}`,
      href: `https://instagram.com/${ig}`,
      accent: 'bg-pink-500/15 text-pink-400',
    });
  if (p.social.website)
    channels.push({
      key: 'web',
      icon: <LuGlobe size={18} />,
      label: 'Site',
      sub: p.social.website,
      href: ensureHttp(p.social.website),
      accent: 'bg-sky-500/15 text-sky-400',
    });
  if (channels.length === 0) return null;

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Contato</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {channels.map((c) => (
          <a
            key={c.key}
            href={c.href}
            target={c.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-content2/40 p-3 transition-colors hover:border-primary/40 hover:bg-content2"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${c.accent}`}>
              {c.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{c.label}</span>
              {c.sub && <span className="block truncate text-xs text-text-muted">{c.sub}</span>}
            </span>
          </a>
        ))}
      </div>
    </Card>
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
