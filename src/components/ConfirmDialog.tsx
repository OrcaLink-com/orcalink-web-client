import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuLoaderCircle, LuTriangleAlert } from 'react-icons/lu';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/**
 * Modal premium de confirmação para ações IRREVERSÍVEIS (pagar, confirmar visita,
 * iniciar/concluir serviço). Deixa claro o impacto — nada de "ok/cancelar" genérico.
 */
export function ConfirmDialog({
  open,
  title = 'Tem certeza que deseja continuar?',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-content1 shadow-pop"
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    danger ? 'bg-danger/15 text-danger' : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  <LuTriangleAlert size={22} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-tight">{title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{description}</p>
                  <p className="mt-1 text-xs font-medium text-text-muted">Esta ação não poderá ser desfeita.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-content2 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => void confirm()}
                disabled={loading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                  danger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-brand-secondary'
                }`}
              >
                {loading && <LuLoaderCircle size={16} className="animate-spin" />}
                {loading ? 'Processando…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
