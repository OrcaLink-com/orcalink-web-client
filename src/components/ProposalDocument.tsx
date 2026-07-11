import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LuX,
  LuCalendar,
  LuClock,
  LuShieldCheck,
  LuCreditCard,
  LuFileText,
  LuHardHat,
  LuPackage,
  LuWrench,
  LuTruck,
  LuPlus,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { api } from '../lib/api';
import { formatBRL } from '../lib/format';
import type { ProposalPayload, ProposalItem, ProposalItemGroup } from './Chat';
import { Avatar, RatingStars } from './ui';

const GROUP_META: Record<ProposalItemGroup, { label: string; icon: IconType }> = {
  LABOR: { label: 'Mão de obra', icon: LuHardHat },
  MATERIAL: { label: 'Materiais', icon: LuPackage },
  EQUIPMENT: { label: 'Equipamentos', icon: LuWrench },
  TRAVEL: { label: 'Deslocamento', icon: LuTruck },
  OTHER: { label: 'Outros custos', icon: LuPlus },
};
const GROUP_ORDER: ProposalItemGroup[] = ['LABOR', 'MATERIAL', 'EQUIPMENT', 'TRAVEL', 'OTHER'];
const METHOD_LABEL: Record<string, string> = { PIX: 'PIX', CARD: 'Cartão', BOLETO: 'Boleto' };

function fmtDate(iso?: string): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Documento comercial premium de um orçamento. Full-screen no mobile, modal amplo
 * no desktop. Cabeçalho enriquecido com o perfil público do prestador (avatar,
 * empresa, categorias, avaliação). Usa os valores JÁ na visão de quem abre
 * (o backend escala os itens ao preço do cliente).
 */
export function ProposalDocument({
  open,
  onClose,
  payload,
}: {
  open: boolean;
  onClose: () => void;
  payload: ProposalPayload;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const profileQ = useQuery({
    queryKey: ['provider-public', payload.providerId],
    queryFn: () => api.getProviderPublicProfile(payload.providerId as string),
    enabled: open && !!payload.providerId,
    staleTime: 5 * 60 * 1000,
  });

  if (!open) return null;

  const profile = profileQ.data;
  const isEstimate = payload.kind === 'estimate';
  const isPro = payload.format === 'PRO';
  const items = payload.items ?? [];
  const tech = payload.technical ?? null;
  const name = profile?.companyName || profile?.tradeName || profile?.name || payload.providerName || 'Profissional';
  const validity =
    tech?.validityDays && payload.createdAt
      ? fmtDate(new Date(new Date(payload.createdAt).getTime() + tech.validityDays * 86400_000).toISOString())
      : null;

  const byGroup = GROUP_ORDER.map((g) => ({
    group: g,
    meta: GROUP_META[g],
    rows: items.filter((it) => it.group === g),
  })).filter((s) => s.rows.length > 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex w-full flex-col overflow-hidden bg-content1 shadow-pop sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-large sm:border sm:border-border">
        {/* Barra superior */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-text-muted">
            <LuFileText size={16} className="text-primary" />
            {isEstimate ? 'Estimativa' : 'Proposta comercial'}
          </span>
          <button onClick={onClose} aria-label="Fechar" className="text-text-muted hover:text-foreground">
            <LuX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {/* Cabeçalho da empresa */}
          <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={name} src={profile?.avatarUrl ?? profile?.logoUrl ?? undefined} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{name}</p>
                {profile?.companyName && profile?.name && profile.companyName !== profile.name && (
                  <p className="truncate text-xs text-text-muted">{profile.name}</p>
                )}
                {profile && profile.ratingCount > 0 && (
                  <div className="mt-0.5">
                    <RatingStars value={profile.ratingAvg} count={profile.ratingCount} />
                  </div>
                )}
                {profile && profile.categories.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {profile.categories.slice(0, 4).map((c) => (
                      <span key={c.id} className="rounded-full bg-content2 px-2 py-0.5 text-[11px] text-text-muted">
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 space-y-1 text-xs text-text-muted sm:text-right">
              <p className="flex items-center gap-1.5 sm:justify-end">
                <LuCalendar size={13} /> Emitida em {fmtDate(payload.createdAt) ?? '—'}
              </p>
              {validity && (
                <p className="flex items-center gap-1.5 sm:justify-end">
                  <LuClock size={13} /> Válida até {validity}
                </p>
              )}
            </div>
          </header>

          {/* Resumo financeiro */}
          <div className="my-5 flex items-end justify-between rounded-large border border-primary/30 bg-primary/5 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Valor total</p>
              {isEstimate && payload.amountMinCents && payload.amountMaxCents && payload.amountMinCents !== payload.amountMaxCents ? (
                <p className="mt-1 text-2xl font-bold text-primary">
                  {formatBRL(payload.amountMinCents)} – {formatBRL(payload.amountMaxCents)}
                </p>
              ) : (
                <p className="mt-1 text-3xl font-bold text-primary">{formatBRL(payload.amountCents)}</p>
              )}
            </div>
            {payload.leadTimeDays != null && (
              <p className="text-right text-xs text-text-muted">
                Prazo
                <br />
                <span className="text-sm font-semibold text-foreground">{payload.leadTimeDays} dia(s)</span>
              </p>
            )}
          </div>

          {/* Descrição / escopo */}
          {payload.description && (
            <section className="mb-5">
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">Escopo do serviço</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{payload.description}</p>
            </section>
          )}

          {/* Detalhamento por seção (profissional) */}
          {isPro && byGroup.length > 0 && (
            <section className="mb-5 space-y-4">
              {byGroup.map((s) => {
                const subtotal = s.rows.reduce((acc, r) => acc + (r.subtotalCents ?? 0), 0);
                const Icon = s.meta.icon;
                return (
                  <div key={s.group} className="overflow-hidden rounded-large border border-border">
                    <div className="flex items-center gap-2 border-b border-border bg-content2 px-4 py-2 text-sm font-semibold">
                      <Icon size={15} className="text-primary" /> {s.meta.label}
                    </div>
                    <div className="divide-y divide-border">
                      {s.rows.map((r, i) => (
                        <ItemRow key={i} item={r} />
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-border bg-content2/50 px-4 py-2 text-sm">
                      <span className="text-text-muted">Subtotal · {s.meta.label}</span>
                      <span className="font-semibold">{formatBRL(subtotal)}</span>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Informações técnicas */}
          {isPro && tech && (tech.areaText || tech.quantityText || tech.executionConditions || tech.technicalNotes || tech.warrantiesText) && (
            <section className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Informações técnicas</h3>
              <dl className="grid gap-3 rounded-large border border-border p-4 sm:grid-cols-2">
                {tech.areaText && <Info label="Área / metragem" value={tech.areaText} />}
                {tech.quantityText && <Info label="Quantidade" value={tech.quantityText} />}
                {tech.executionConditions && <Info label="Condições de execução" value={tech.executionConditions} full />}
                {tech.technicalNotes && <Info label="Observações técnicas" value={tech.technicalNotes} full />}
                {tech.warrantiesText && <Info label="Garantias" value={tech.warrantiesText} full />}
              </dl>
            </section>
          )}

          {/* Condições gerais */}
          <section className="mb-2 grid gap-3 sm:grid-cols-3">
            {payload.leadTimeDays != null && <Badge icon={LuClock} label="Prazo de execução" value={`${payload.leadTimeDays} dia(s)`} />}
            {!isEstimate && payload.warrantyDays != null && (
              <Badge icon={LuShieldCheck} label="Garantia" value={`${payload.warrantyDays} dia(s)`} />
            )}
            {!isEstimate && payload.paymentMethods && payload.paymentMethods.length > 0 && (
              <Badge icon={LuCreditCard} label="Pagamento" value={payload.paymentMethods.map((m) => METHOD_LABEL[m] ?? m).join(', ')} />
            )}
          </section>

          {payload.notes && (
            <section className="mt-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Observações</h3>
              <p className="whitespace-pre-wrap text-sm text-text-muted">{payload.notes}</p>
            </section>
          )}
        </div>

        {/* Total fixo no rodapé */}
        <div className="flex items-center justify-between border-t border-border bg-content1 px-5 py-3 sm:px-7">
          <span className="text-sm text-text-muted">Total geral</span>
          <span className="text-xl font-bold text-primary">{formatBRL(payload.amountCents)}</span>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: ProposalItem }) {
  const hasQty = item.quantity != null && item.unitCents != null;
  // Descrição opcional: se vazia, usa o rótulo do grupo (ex.: "Mão de obra").
  const label = item.description?.trim() || GROUP_META[item.group]?.label || 'Item';
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
      <div className="min-w-0">
        <p className="truncate">{label}</p>
        {hasQty && (
          <p className="text-xs text-text-muted">
            {item.quantity}
            {item.unit ? ` ${item.unit}` : ''} × {formatBRL(item.unitCents)}
          </p>
        )}
      </div>
      <span className="shrink-0 font-medium tabular-nums">{formatBRL(item.subtotalCents)}</span>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-[11px] uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm">{value}</dd>
    </div>
  );
}

function Badge({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-large border border-border px-3 py-2">
      <Icon size={16} className="shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
