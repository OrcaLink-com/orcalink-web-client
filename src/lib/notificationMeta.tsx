import type { ReactNode } from 'react';
import {
  IconAgenda,
  IconCelebrate,
  IconCheck,
  IconClose,
  IconConfirmed,
  IconEstimate,
  IconExecution,
  IconInbox,
  IconPayment,
  IconProposal,
  IconReschedule,
  IconScheduled,
  IconStar,
  IconSuccess,
} from '../components/icons';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

/** Classes do círculo do ícone (fundo tintado + cor do ícone) por tom. */
const TONE_CLASS: Record<Tone, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-sky-500/15 text-sky-400',
  muted: 'bg-content2 text-text-muted',
};

const META: Record<string, { icon: (s: number) => ReactNode; tone: Tone }> = {
  PRE_RECEIVED: { icon: (s) => <IconEstimate size={s} />, tone: 'primary' },
  PRE_ACCEPTED: { icon: (s) => <IconCheck size={s} />, tone: 'success' },
  PRE_REJECTED: { icon: (s) => <IconClose size={s} />, tone: 'muted' },
  VISIT_SUGGESTED: { icon: (s) => <IconAgenda size={s} />, tone: 'warning' },
  VISIT_RESCHEDULED: { icon: (s) => <IconReschedule size={s} />, tone: 'warning' },
  VISIT_CONFIRMED: { icon: (s) => <IconConfirmed size={s} />, tone: 'success' },
  VISIT_COMPLETED: { icon: (s) => <IconCheck size={s} />, tone: 'success' },
  FINAL_RECEIVED: { icon: (s) => <IconProposal size={s} />, tone: 'primary' },
  FINAL_ACCEPTED: { icon: (s) => <IconCelebrate size={s} />, tone: 'success' },
  FINAL_REJECTED: { icon: (s) => <IconClose size={s} />, tone: 'muted' },
  OTHER_REJECTED: { icon: (s) => <IconClose size={s} />, tone: 'muted' },
  PAYMENT_CONFIRMED: { icon: (s) => <IconPayment size={s} />, tone: 'success' },
  EXECUTION_SCHEDULED: { icon: (s) => <IconScheduled size={s} />, tone: 'info' },
  EXECUTION_STARTED: { icon: (s) => <IconExecution size={s} />, tone: 'primary' },
  SERVICE_COMPLETED: { icon: (s) => <IconSuccess size={s} />, tone: 'success' },
  REVIEW_RECEIVED: { icon: (s) => <IconStar size={s} />, tone: 'warning' },
};

/** Ícone + classes do círculo para uma notificação, por `kind`. Fallback neutro. */
export function notificationMeta(kind: string, size = 16): { icon: ReactNode; circleClass: string } {
  const m = META[kind];
  const tone: Tone = m?.tone ?? 'muted';
  const icon = m ? m.icon(size) : <IconInbox size={size} />;
  return {
    icon,
    circleClass: `flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[tone]}`,
  };
}
