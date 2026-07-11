import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LuLoaderCircle, LuStar } from 'react-icons/lu';

interface ReviewComposerProps {
  onSubmit: (rating: number, comment?: string) => Promise<void>;
}

/**
 * Avaliação inline no chat (estrelas + comentário + enviar). Aparece quando o
 * serviço é concluído e ainda não foi avaliado. Fixado acima do input.
 */
export function ReviewComposer({ onSubmit }: ReviewComposerProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpa o erro assim que o usuário interage (escolhe estrela / edita comentário).
  useEffect(() => {
    setError(null);
  }, [rating, comment]);

  async function submit() {
    setError(null);
    if (rating < 1) {
      setError('Escolha de 1 a 5 estrelas.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border bg-gradient-to-b from-amber-500/10 to-transparent px-3 py-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">Avaliação</p>
      <p className="text-sm font-semibold leading-tight text-foreground">Como foi o serviço?</p>
      <p className="mt-0.5 text-xs text-text-muted">Sua avaliação encerra o atendimento e ajuda outros clientes.</p>

      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} estrela(s)`}
            className="p-0.5"
          >
            <LuStar
              size={28}
              className={(hover || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-text-muted'}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Conte como foi (opcional)"
        className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
      >
        {loading ? <LuLoaderCircle size={16} className="animate-spin" /> : <LuStar size={16} />}
        {loading ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </motion.div>
  );
}
