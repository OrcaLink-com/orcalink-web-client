import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePendingLegal } from '../lib/queries';
import { LEGAL_ROUTES, type LegalDocKey } from '../lib/legalContent';
import { api } from '../lib/api';
import { Button } from './ui';

/**
 * Portão de aceite dos documentos legais. Renderizado quando autenticado; se
 * houver documentos vigentes que exigem aceite e ainda não aceitos (vindos do
 * CMS via /legal/pending), bloqueia o app até o aceite (cobre novos usuários E
 * re-aceite quando o admin publica uma nova versão). Registra no backend
 * (documento + versão + data + IP).
 */
export function TermsGate() {
  const pending = usePendingLegal();
  const qc = useQueryClient();
  const [checked, setChecked] = useState(false);
  const accept = useMutation({
    mutationFn: () => api.acceptLegal(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['legal-pending'] }),
  });

  const docs = pending.data ?? [];
  // Só bloqueia quando temos certeza de que há pendências (evita flicker no carregamento).
  if (!pending.data || docs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-large border border-border bg-content1 p-5 shadow-pop">
        <h2 className="text-lg font-bold">Antes de continuar</h2>
        <p className="mt-1 text-sm text-text-muted">
          Atualizamos nossos documentos. Para continuar usando a OrcaLink, revise e aceite:
        </p>

        <ul className="mt-3 space-y-1 text-sm">
          {docs.map((d) => {
            const route = LEGAL_ROUTES[d.slug as LegalDocKey];
            return (
              <li key={d.id}>
                {route ? (
                  <Link to={route} target="_blank" className="text-primary underline">
                    {d.title}
                  </Link>
                ) : (
                  <span>{d.title}</span>
                )}
              </li>
            );
          })}
        </ul>

        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span>Li e aceito os documentos acima.</span>
        </label>

        <Button full className="mt-4" disabled={!checked} loading={accept.isPending} onClick={() => accept.mutate()}>
          Aceitar e continuar
        </Button>
        {accept.isError && <p className="mt-2 text-sm text-danger">{(accept.error as Error).message}</p>}
      </div>
    </div>
  );
}
