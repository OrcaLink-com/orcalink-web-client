import { Link } from 'react-router-dom';
import { LEGAL_DOCS, type LegalDocKey } from '../lib/legalContent';
import { useLegalDoc } from '../lib/queries';
import { IconBack } from './icons';

// Estiliza o HTML vindo do CMS (h2/p/.lead) sem depender de plugin de typography.
const HTML_CLASSES =
  'mt-6 [&_h2]:mt-5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground ' +
  '[&_p]:mt-1.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-text-muted';

/**
 * Página pública de documento legal. Lê o documento vigente do CMS (banco);
 * se a API falhar, cai no conteúdo local (minuta) como rede de segurança.
 */
export function LegalPage({ doc }: { doc: LegalDocKey }) {
  const q = useLegalDoc(doc);
  const fb = LEGAL_DOCS[doc];
  const fromApi = q.data ?? null;
  const title = fromApi?.title ?? fb.title;
  const updatedAt = (fromApi?.updatedAt ?? fb.updatedAt).slice(0, 10);

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground">
        <IconBack size={15} /> Voltar
      </Link>

      {/* Aviso de minuta só enquanto o conteúdo vem do fallback local (ainda não publicado no CMS). */}
      {!fromApi && (
        <div className="mb-5 rounded-large border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
          ⓘ Minuta provisória — sujeita a revisão jurídica antes do lançamento oficial.
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-xs text-text-muted">Última atualização: {updatedAt}</p>

      {fromApi ? (
        <div className={HTML_CLASSES} dangerouslySetInnerHTML={{ __html: fromApi.contentHtml }} />
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">{fb.intro}</p>
          <div className="mt-6 space-y-5">
            {fb.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-sm font-semibold text-foreground">{s.title}</h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="mt-1 text-sm leading-relaxed text-text-muted">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-5 text-sm">
        <Link to="/termos" className="text-primary hover:underline">
          Termos de Uso
        </Link>
        <Link to="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        <Link to="/conduta" className="text-primary hover:underline">
          Código de Conduta
        </Link>
        <Link to="/reembolso" className="text-primary hover:underline">
          Cancelamento e Reembolso
        </Link>
        <Link to="/legal" className="text-text-muted hover:underline">
          Todos os documentos
        </Link>
      </div>
    </div>
  );
}
