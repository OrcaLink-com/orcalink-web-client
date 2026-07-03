import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuArrowRight, LuLoaderCircle } from 'react-icons/lu';
import { ConfirmDialog } from './ConfirmDialog';

export type NextActionTone = 'primary' | 'amber' | 'green' | 'sky';

const TONE: Record<NextActionTone, { wrap: string; icon: string; btn: string; label: string }> = {
  primary: { wrap: 'border-primary/30 from-primary/10', icon: 'bg-primary/20 text-primary', btn: 'bg-primary hover:bg-brand-secondary', label: 'text-primary' },
  amber: { wrap: 'border-amber-500/30 from-amber-500/10', icon: 'bg-amber-500/20 text-amber-300', btn: 'bg-amber-500 hover:bg-amber-600', label: 'text-amber-300' },
  green: { wrap: 'border-emerald-500/30 from-emerald-500/10', icon: 'bg-emerald-500/20 text-emerald-300', btn: 'bg-emerald-500 hover:bg-emerald-600', label: 'text-emerald-300' },
  sky: { wrap: 'border-sky-500/30 from-sky-500/10', icon: 'bg-sky-500/20 text-sky-300', btn: 'bg-sky-500 hover:bg-sky-600', label: 'text-sky-300' },
};

export interface NextActionCardProps {
  tone?: NextActionTone;
  /** Ícone à esquerda. */
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void | Promise<void>;
  /** Quando presente, pede confirmação (ação irreversível). */
  confirm?: { description: string; confirmLabel?: string; danger?: boolean };
}

/**
 * Card de ação premium FIXADO acima do input (estilo bottom sheet). Destaca a
 * próxima tarefa do fluxo com um CTA. Para ações irreversíveis, abre um
 * `ConfirmDialog` antes de executar.
 */
export function NextActionCard({ tone = 'primary', icon, title, description, ctaLabel, onCta, confirm }: NextActionCardProps) {
  const t = TONE[tone];
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);

  async function run() {
    setLoading(true);
    try {
      await onCta();
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (confirm) setAsking(true);
    else void run();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-t border-border bg-gradient-to-b ${t.wrap} to-transparent px-3 py-3`}
      >
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>{icon}</span>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${t.label}`}>Próxima ação</p>
            <p className="text-sm font-semibold leading-tight text-foreground">{title}</p>
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${t.btn}`}
        >
          {loading ? <LuLoaderCircle size={16} className="animate-spin" /> : <LuArrowRight size={16} />}
          {loading ? 'Processando…' : ctaLabel}
        </button>
      </motion.div>

      {confirm && (
        <ConfirmDialog
          open={asking}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel ?? ctaLabel}
          danger={confirm.danger}
          onConfirm={run}
          onClose={() => setAsking(false)}
        />
      )}
    </>
  );
}
