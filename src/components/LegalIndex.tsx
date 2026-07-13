import { Link } from 'react-router-dom';
import { LEGAL_DOCS, LEGAL_ROUTES, type LegalDocKey } from '../lib/legalContent';
import { useLegalDocsList } from '../lib/queries';
import { IconBack } from './icons';

/**
 * Índice público de todos os documentos legais. Lê a lista vigente do CMS
 * (banco); cai no conteúdo local se a API falhar. Só mostra docs com rota conhecida.
 */
export function LegalIndex() {
  const q = useLegalDocsList();
  const known = Object.keys(LEGAL_ROUTES) as LegalDocKey[];

  const items = (q.data ?? [])
    .filter((d): d is typeof d & { slug: LegalDocKey } => (known as string[]).includes(d.slug))
    .map((d) => ({ slug: d.slug, title: d.title, updatedAt: d.updatedAt.slice(0, 10) }));

  // Fallback local se a API não trouxe nada.
  const list =
    items.length > 0
      ? items
      : known.map((slug) => ({ slug, title: LEGAL_DOCS[slug].title, updatedAt: LEGAL_DOCS[slug].updatedAt }));

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground">
        <IconBack size={15} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Documentos legais</h1>
      <p className="mt-1 text-sm text-text-muted">Termos, políticas e conduta da plataforma.</p>

      <div className="mt-6 divide-y divide-border rounded-large border border-border">
        {list.map((d) => (
          <Link
            key={d.slug}
            to={LEGAL_ROUTES[d.slug]}
            className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-content2"
          >
            <div className="min-w-0">
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-text-muted">Atualizado em {d.updatedAt}</p>
            </div>
            <span className="text-text-muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
