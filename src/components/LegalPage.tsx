import { Link } from 'react-router-dom';
import { LEGAL_DOCS } from '../lib/legalContent';
import { IconBack } from './icons';

/** Página pública de documento legal (Termos / Privacidade) — minuta provisória. */
export function LegalPage({ doc }: { doc: 'terms' | 'privacy' }) {
  const d = LEGAL_DOCS[doc];
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-1 text-sm text-text-muted hover:text-foreground">
        <IconBack size={15} /> Voltar
      </Link>

      <div className="mb-5 rounded-large border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
        ⓘ Minuta provisória — sujeita a revisão jurídica antes do lançamento oficial.
      </div>

      <h1 className="text-2xl font-bold tracking-tight">{d.title}</h1>
      <p className="mt-1 text-xs text-text-muted">Última atualização: {d.updatedAt}</p>
      <p className="mt-4 text-sm leading-relaxed text-text-muted">{d.intro}</p>

      <div className="mt-6 space-y-5">
        {d.sections.map((s) => (
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

      <div className="mt-8 flex gap-4 border-t border-border pt-5 text-sm">
        <Link to="/termos" className="text-primary hover:underline">
          Termos de Uso
        </Link>
        <Link to="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
      </div>
    </div>
  );
}
