import { Link } from 'react-router-dom';
import { LEGAL_DOCS, LEGAL_ROUTES, type LegalDocKey } from '../lib/legalContent';
import { IconBack } from './icons';

/** Índice público de todos os documentos legais — facilita ler tudo num só lugar. */
export function LegalIndex() {
  const keys = Object.keys(LEGAL_DOCS) as LegalDocKey[];
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground">
        <IconBack size={15} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Documentos legais</h1>
      <p className="mt-1 text-sm text-text-muted">Termos, políticas e conduta da plataforma.</p>

      <div className="mt-4 rounded-large border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
        ⓘ Minutas provisórias — sujeitas a revisão jurídica antes do lançamento oficial.
      </div>

      <div className="mt-6 divide-y divide-border rounded-large border border-border">
        {keys.map((k) => (
          <Link
            key={k}
            to={LEGAL_ROUTES[k]}
            className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-content2"
          >
            <div className="min-w-0">
              <p className="font-medium">{LEGAL_DOCS[k].title}</p>
              <p className="text-xs text-text-muted">Atualizado em {LEGAL_DOCS[k].updatedAt}</p>
            </div>
            <span className="text-text-muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
