import { useParams, useNavigate } from 'react-router-dom';
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuCalendarClock,
  LuClock,
  LuGlobe,
  LuInstagram,
  LuMapPin,
  LuPhone,
} from 'react-icons/lu';
import { useProviderPublicProfile } from '../../lib/queries';
import { Avatar, Card, RatingStars, Spinner } from '../../components/ui';
import type { PublicProviderProfile } from '../../lib/types';

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

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground"
      >
        <LuArrowLeft size={15} /> Voltar
      </button>

      {/* Capa + identidade */}
      <Card className="overflow-hidden p-0">
        <div className="relative h-40 w-full bg-gradient-to-br from-primary/30 to-brand-secondary/30">
          {p.coverUrl && <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="-mt-12 shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-content1 bg-content2">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Avatar name={p.name} src={p.avatarUrl} size="lg" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold">{title}</h1>
              <LuBadgeCheck size={18} className="shrink-0 text-primary" />
            </div>
            {p.tradeName && p.tradeName !== title && <p className="text-sm text-text-muted">{p.tradeName}</p>}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
              <RatingStars value={p.ratingAvg} count={p.ratingCount} />
              {years != null && (
                <span className="inline-flex items-center gap-1">
                  <LuCalendarClock size={12} /> {years === 0 ? 'menos de 1 ano' : `${years} ano(s)`} de atuação
                </span>
              )}
              {p.avgResponseMinutes != null && (
                <span className="inline-flex items-center gap-1">
                  <LuClock size={12} /> responde em ~{formatMinutes(p.avgResponseMinutes)}
                </span>
              )}
            </div>
          </div>
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

      {/* Portfólio */}
      {p.portfolio.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Portfólio</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {p.portfolio.map((it) => (
              <div key={it.id ?? it.url} className="overflow-hidden rounded-2xl border border-border bg-content1">
                <img src={it.url} alt={it.title ?? ''} loading="lazy" className="aspect-video w-full object-cover" />
                {(it.title || it.description || it.date) && (
                  <div className="p-3">
                    {it.title && <p className="font-semibold">{it.title}</p>}
                    {it.description && <p className="mt-0.5 text-sm text-text-muted">{it.description}</p>}
                    {it.date && <p className="mt-1 text-xs text-text-muted">{it.date}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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

function ChipRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="rounded-full bg-content2 px-2.5 py-1 text-xs font-medium text-foreground/90">
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
