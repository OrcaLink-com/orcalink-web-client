import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  LuCheck,
  LuX,
  LuCalendarPlus,
  LuCalendarCheck,
  LuCalendarClock,
  LuCalendarX,
  LuWallet,
  LuFlag,
  LuInfo,
  LuStar,
  LuPlay,
} from 'react-icons/lu';
import type { EventIcon, EventPayload, EventTone } from '../types';
import { cardIn } from '../animations';

const ICONS: Record<EventIcon, ReactNode> = {
  check: <LuCheck size={18} />,
  x: <LuX size={18} />,
  'calendar-plus': <LuCalendarPlus size={18} />,
  'calendar-check': <LuCalendarCheck size={18} />,
  'calendar-clock': <LuCalendarClock size={18} />,
  'calendar-x': <LuCalendarX size={18} />,
  wallet: <LuWallet size={18} />,
  flag: <LuFlag size={18} />,
  info: <LuInfo size={18} />,
  star: <LuStar size={18} />,
  play: <LuPlay size={18} />,
};

const TONE: Record<EventTone, { border: string; iconBg: string; iconText: string; glow: string }> = {
  green: { border: 'border-emerald-500/30', iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-400', glow: 'from-emerald-500/10' },
  blue: { border: 'border-sky-500/30', iconBg: 'bg-sky-500/15', iconText: 'text-sky-400', glow: 'from-sky-500/10' },
  amber: { border: 'border-amber-500/30', iconBg: 'bg-amber-500/15', iconText: 'text-amber-400', glow: 'from-amber-500/10' },
  danger: { border: 'border-danger/30', iconBg: 'bg-danger/15', iconText: 'text-danger', glow: 'from-danger/10' },
  neutral: { border: 'border-border', iconBg: 'bg-primary/15', iconText: 'text-primary', glow: 'from-primary/10' },
};

export interface EventCardProps {
  payload: EventPayload;
  mine?: boolean;
  /** Hora formatada (ex.: "14:30"). */
  time?: string;
}

/**
 * Card de evento informativo (sem botões): ícone ilustrativo, título, descrição
 * curta e hora. Deixa evidente que uma ação relevante ocorreu no fluxo.
 */
export function EventCard({ payload, mine = false, time }: EventCardProps) {
  const t = TONE[payload.tone];
  return (
    <motion.div
      variants={cardIn}
      initial="initial"
      animate="animate"
      className={`my-1.5 w-full max-w-md ${mine ? 'ml-auto' : 'mr-auto'}`}
    >
      <div className={`relative overflow-hidden rounded-[18px] border ${t.border} bg-content1 shadow-card`}>
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${t.glow} to-transparent`} />
        <div className="relative flex items-start gap-3 p-3.5">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${t.iconBg} ${t.iconText}`}>
            {ICONS[payload.icon]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold leading-tight text-foreground">{payload.title}</h4>
              {time && <span className="shrink-0 text-[10px] text-text-muted">{time}</span>}
            </div>
            {payload.description && (
              <p className="mt-1 text-[13px] leading-snug text-text-muted">{payload.description}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
