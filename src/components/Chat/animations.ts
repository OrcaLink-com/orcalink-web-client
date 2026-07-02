import type { Transition, Variants } from 'framer-motion';

/**
 * Variants/transições reutilizáveis do módulo de Chat — uma fonte única para
 * as micro-interações, evitando objetos inline duplicados nos componentes.
 */

export const easeOut: Transition = { duration: 0.2, ease: 'easeOut' };
export const soft: Transition = { type: 'spring', stiffness: 380, damping: 30 };

/** Entrada de bolha de mensagem. */
export const bubbleIn: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: easeOut },
};

/** Entrada de Action Card. */
export const cardIn: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

/** Popover (emoji) / menus. */
export const popIn: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.12 } },
};

/** Colapso de altura (calendário inline, etc.). */
export const collapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: easeOut },
  exit: { opacity: 0, height: 0, transition: { duration: 0.15 } },
};

/** Troca de conversa (painel). */
export const paneIn: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: easeOut },
};

/** Pílula de sistema. */
export const systemPop: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

/** Props de toque comuns aos botões. */
export const pressable = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.97 },
} as const;
