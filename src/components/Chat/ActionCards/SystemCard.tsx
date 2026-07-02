import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LuCheck, LuCalendar, LuWallet, LuFlag, LuInfo } from 'react-icons/lu';
import type { SystemPayload } from '../types';
import { systemPop } from '../animations';

export interface SystemCardProps {
  payload: SystemPayload;
}

const ICONS: Record<NonNullable<SystemPayload['icon']>, ReactNode> = {
  check: <LuCheck size={13} />,
  calendar: <LuCalendar size={13} />,
  payment: <LuWallet size={13} />,
  flag: <LuFlag size={13} />,
  info: <LuInfo size={13} />,
};

/** Evento de sistema — pílula pequena e centralizada. */
export function SystemCard({ payload }: SystemCardProps) {
  return (
    <motion.div variants={systemPop} initial="initial" animate="animate" className="my-2 flex justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-content1/70 px-3 py-1 text-[11px] font-medium text-text-muted backdrop-blur">
        {payload.icon && <span className="text-emerald-400">{ICONS[payload.icon]}</span>}
        {payload.text}
      </span>
    </motion.div>
  );
}
