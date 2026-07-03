import { motion } from 'framer-motion';
import { LuArrowRight, LuWallet, LuCircleCheck, LuCalendarClock, LuInfo, LuHourglass } from 'react-icons/lu';
import type { NextStep, NextStepTone } from '../features/quotes/nextStep';

const TONE: Record<NextStepTone, { wrap: string; icon: string; label: string }> = {
  primary: { wrap: 'border-primary/30 bg-primary/10', icon: 'bg-primary/20 text-primary', label: 'text-primary' },
  amber: { wrap: 'border-amber-500/30 bg-amber-500/10', icon: 'bg-amber-500/20 text-amber-300', label: 'text-amber-300' },
  green: { wrap: 'border-emerald-500/30 bg-emerald-500/10', icon: 'bg-emerald-500/20 text-emerald-300', label: 'text-emerald-300' },
  sky: { wrap: 'border-sky-500/30 bg-sky-500/10', icon: 'bg-sky-500/20 text-sky-300', label: 'text-sky-300' },
  neutral: { wrap: 'border-border bg-content1/60', icon: 'bg-content2 text-text-muted', label: 'text-text-muted' },
};

function ToneIcon({ tone, youAct }: { tone: NextStepTone; youAct: boolean }) {
  if (!youAct) return <LuHourglass size={18} />;
  switch (tone) {
    case 'amber':
      return <LuWallet size={18} />;
    case 'green':
      return <LuCircleCheck size={18} />;
    case 'sky':
      return <LuCalendarClock size={18} />;
    case 'neutral':
      return <LuInfo size={18} />;
    default:
      return <LuArrowRight size={18} />;
  }
}

/**
 * Faixa de "próximo passo" logo abaixo do header do chat. Deixa explícito a etapa
 * atual, de quem é a vez e qual a próxima ação — para o usuário nunca ficar
 * perdido no fluxo da negociação.
 */
export function NextStepBanner({ step }: { step: NextStep }) {
  const t = TONE[step.tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 border-b border-border px-3 py-2.5 ${t.wrap}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
        <ToneIcon tone={step.tone} youAct={step.youAct} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${t.label}`}>{step.stageLabel}</p>
        <p className="truncate text-sm font-medium text-foreground">{step.actionText}</p>
        {step.hintText && <p className="truncate text-xs text-text-muted">{step.hintText}</p>}
      </div>
      {step.youAct && (
        <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
          Sua vez
        </span>
      )}
    </motion.div>
  );
}
