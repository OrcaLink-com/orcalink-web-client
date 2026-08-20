import { Link } from 'react-router-dom';
import { useMyQuotes, useProfile } from '../lib/queries';
import { Card } from './ui';
import { IconChevronRight, IconSuccess } from './icons';

interface ChecklistItem {
  key: string;
  label: string;
  hint: string;
  done: boolean;
  to: string;
}

/**
 * Onboarding do cliente: checklist do que falta para aproveitar melhor a plataforma
 * (perfil, foto, endereço e o primeiro orçamento). Deriva do estado real e some
 * sozinho quando está tudo completo.
 */
export function OnboardingChecklist() {
  const profileQ = useProfile();
  const quotesQ = useMyQuotes();
  const p = profileQ.data;

  if (!p) return null; // ainda carregando

  const items: ChecklistItem[] = [
    {
      key: 'profile',
      label: 'Complete seu perfil',
      hint: 'Seu nome e telefone para os profissionais falarem com você.',
      done: Boolean(p.name && p.phone),
      to: '/app/perfil',
    },
    {
      key: 'avatar',
      label: 'Adicione uma foto',
      hint: 'Passa mais confiança nas conversas com os profissionais.',
      done: Boolean(p.avatarUrl),
      to: '/app/perfil',
    },
    {
      key: 'address',
      label: 'Informe seu endereço',
      hint: 'Ajuda a encontrar profissionais perto de você.',
      done: Boolean(p.zipCode),
      to: '/app/perfil',
    },
    {
      key: 'first-quote',
      label: 'Crie seu primeiro orçamento',
      hint: 'Descreva o serviço e receba propostas de profissionais.',
      done: (quotesQ.data?.length ?? 0) > 0,
      to: '/app/novo',
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null; // tudo pronto → some

  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <Card className="space-y-4 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">Bem-vindo à OrcaLink</h2>
          <p className="mt-0.5 text-sm text-text-muted">Complete os passos para aproveitar melhor.</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
          {doneCount}/{items.length}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-content2">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="space-y-1">
        {items.map((it) =>
          it.done ? (
            <li key={it.key} className="flex items-center gap-3 rounded-medium px-2 py-2 text-sm">
              <IconSuccess size={18} className="shrink-0 text-success" />
              <span className="text-text-muted line-through">{it.label}</span>
            </li>
          ) : (
            <li key={it.key}>
              <Link
                to={it.to}
                className="flex items-center gap-3 rounded-medium px-2 py-2 transition-colors hover:bg-content2"
              >
                <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-text-muted/50" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{it.label}</span>
                  <span className="block text-xs text-text-muted">{it.hint}</span>
                </span>
                <IconChevronRight size={18} className="shrink-0 text-text-muted" />
              </Link>
            </li>
          ),
        )}
      </ul>
    </Card>
  );
}
