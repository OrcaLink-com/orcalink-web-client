import { motion } from 'framer-motion';

/** Indicador "digitando…" com três pontinhos animados. */
export function ChatTyping({ name }: { name?: string }) {
  return (
    <div className="my-1 flex items-center gap-2" aria-live="polite">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-content2 px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-text-muted"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      {name && <span className="text-xs text-text-muted">{name} está digitando…</span>}
    </div>
  );
}
