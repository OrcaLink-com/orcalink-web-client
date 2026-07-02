import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LuLoaderCircle, LuCheck } from 'react-icons/lu';
import type { CardAccent } from '../types';
import { useAsyncAction } from '../hooks';
import { cardIn, pressable } from '../animations';

/* ───────────── Accent (paleta por tipo de card) ───────────── */

interface AccentStyle {
  iconBg: string;
  iconText: string;
  border: string;
  glow: string;
  primaryBtn: string;
  badge: string;
  title: string;
}

export const ACCENTS: Record<CardAccent, AccentStyle> = {
  green: {
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'from-emerald-500/10',
    primaryBtn: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    badge: 'bg-emerald-500/15 text-emerald-300',
    title: 'text-emerald-300',
  },
  purple: {
    iconBg: 'bg-violet-500/15',
    iconText: 'text-violet-400',
    border: 'border-violet-500/30',
    glow: 'from-violet-500/10',
    primaryBtn: 'bg-violet-500 hover:bg-violet-600 text-white',
    badge: 'bg-violet-500/15 text-violet-300',
    title: 'text-violet-300',
  },
  blue: {
    iconBg: 'bg-sky-500/15',
    iconText: 'text-sky-400',
    border: 'border-sky-500/30',
    glow: 'from-sky-500/10',
    primaryBtn: 'bg-sky-500 hover:bg-sky-600 text-white',
    badge: 'bg-sky-500/15 text-sky-300',
    title: 'text-sky-300',
  },
  neutral: {
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    border: 'border-border',
    glow: 'from-primary/10',
    primaryBtn: 'bg-primary hover:bg-brand-secondary text-white',
    badge: 'bg-primary/15 text-primary',
    title: 'text-foreground',
  },
};

/* ───────────── Card base ───────────── */

export interface BaseActionCardProps {
  accent: CardAccent;
  icon: ReactNode;
  title: string;
  /** Subtítulo (ex.: "João Silva · Pinturas"). */
  subtitle?: string;
  description?: string;
  badge?: { label: string; tone?: 'accent' | 'success' | 'muted' | 'danger' };
  meta?: MetaItem[];
  /** Conteúdo extra entre a descrição e as ações (ex.: calendário inline). */
  children?: ReactNode;
  /** Linha de botões. */
  actions?: ReactNode;
  /** Alinhamento na timeline (minha=direita). Cards costumam vir do outro lado. */
  mine?: boolean;
}

export interface MetaItem {
  icon?: ReactNode;
  label: string;
  value: string;
  emphasize?: boolean;
}

export function BaseActionCard({
  accent,
  icon,
  title,
  subtitle,
  description,
  badge,
  meta,
  children,
  actions,
  mine = false,
}: BaseActionCardProps) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      variants={cardIn}
      initial="initial"
      animate="animate"
      className={`my-1.5 w-full max-w-md ${mine ? 'ml-auto' : 'mr-auto'}`}
    >
      <div
        className={`relative overflow-hidden rounded-[18px] border ${a.border} bg-content1 shadow-pop`}
      >
        {/* brilho de topo (glassmorphism sutil) */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${a.glow} to-transparent`} />

        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${a.iconBg} ${a.iconText}`}>
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[15px] font-semibold leading-tight text-foreground">{title}</h4>
                {badge && <StatusBadge label={badge.label} tone={badge.tone} accentBadge={a.badge} />}
              </div>
              {subtitle && <p className={`mt-0.5 text-xs font-medium ${a.title}`}>{subtitle}</p>}
              {description && <p className="mt-1.5 text-sm text-text-muted">{description}</p>}
            </div>
          </div>

          {meta && meta.length > 0 && (
            <>
              <Divider />
              <ul className="space-y-1.5">
                {meta.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {m.icon && <span className="text-text-muted">{m.icon}</span>}
                    <span className="text-text-muted">{m.label}</span>
                    <span className={`ml-auto font-medium ${m.emphasize ? 'text-foreground' : 'text-foreground/90'}`}>
                      {m.value}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {children}

          {actions && (
            <>
              <Divider />
              <div className="flex flex-col gap-2">{actions}</div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Divider() {
  return <div className="my-3 h-px bg-border" />;
}

function StatusBadge({
  label,
  tone = 'muted',
  accentBadge,
}: {
  label: string;
  tone?: 'accent' | 'success' | 'muted' | 'danger';
  accentBadge: string;
}) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-300'
      : tone === 'danger'
        ? 'bg-danger/15 text-danger'
        : tone === 'accent'
          ? accentBadge
          : 'bg-content2 text-text-muted';
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
  );
}

/* ───────────── Botões dos cards ───────────── */

export interface CardButtonProps {
  children: ReactNode;
  onPress?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'ghost';
  accent?: CardAccent;
  icon?: ReactNode;
  disabled?: boolean;
  /** Rótulo mostrado no estado de sucesso (ex.: "Pago!"). */
  successLabel?: string;
}

/**
 * Botão com estados idle → loading → success (derivados da Promise) + animações
 * de hover/press (Framer Motion). Reutilizado por todos os cards.
 */
export function CardButton({
  children,
  onPress,
  variant = 'primary',
  accent = 'neutral',
  icon,
  disabled,
  successLabel,
}: CardButtonProps) {
  const { state, run, isLoading, isSuccess } = useAsyncAction(
    onPress ? () => Promise.resolve(onPress()) : undefined,
  );
  const a = ACCENTS[accent];

  const base =
    'relative flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-content1 disabled:cursor-not-allowed disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? a.primaryBtn
      : variant === 'secondary'
        ? 'border border-border bg-content2 text-foreground hover:bg-content1'
        : 'text-text-muted hover:bg-content2';

  return (
    <motion.button
      type="button"
      {...(disabled ? {} : pressable)}
      disabled={disabled || isLoading || isSuccess}
      onClick={() => void run()}
      className={`${base} ${isSuccess ? 'bg-emerald-500 text-white' : styles}`}
    >
      {isLoading ? (
        <LuLoaderCircle size={18} className="animate-spin" />
      ) : isSuccess ? (
        <>
          <LuCheck size={18} /> {successLabel ?? 'Pronto'}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
      <span className="sr-only">{state}</span>
    </motion.button>
  );
}
