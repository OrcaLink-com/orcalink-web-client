import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
import { brand } from '@orcalink/design-tokens/brand.config';
import { useShowcaseReviews } from '../../lib/queries';
import { Button, ButtonLink, Spinner } from '../../components/ui';
import { ReviewCard } from '../../components/ReviewCard';
import { IconArrowRight, IconStar } from '../../components/icons';

const PAGE = 12;

/** Página pública de avaliações (paginada). Dados sensíveis preservados no backend. */
export function AvaliacoesPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isFetching } = useShowcaseReviews(PAGE, offset);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header simples com voltar. */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground">
            <LuArrowLeft size={16} /> Início
          </Link>
          <a href="/" aria-label={brand.name}>
            <img src="/brand/logo.svg" alt={brand.name} className="h-8 w-auto" />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Avaliações</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">O que dizem sobre a Orca Link</h1>
          {total > 0 && (
            <p className="mt-2 text-sm text-text-muted">
              {total} {total === 1 ? 'avaliação de cliente' : 'avaliações de clientes'} que contrataram pela plataforma.
            </p>
          )}
        </div>

        {isLoading ? (
          <Spinner label="Carregando avaliações…" />
        ) : total === 0 ? (
          <div className="mx-auto max-w-lg rounded-large border border-dashed border-border bg-content1 p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <IconStar size={22} />
            </div>
            <p className="text-base font-semibold">Ainda não há avaliações</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-muted">
              As avaliações aparecem aqui assim que os primeiros serviços forem concluídos e avaliados.
            </p>
            <div className="mt-5">
              <ButtonLink to="/login" endContent={<IconArrowRight size={16} />}>
                Solicitar orçamento
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r, i) => (
                <ReviewCard key={offset + i} review={r} />
              ))}
            </div>

            {/* Paginação simples (offset). */}
            {total > PAGE && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  disabled={offset === 0 || isFetching}
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE))}
                >
                  Anteriores
                </Button>
                <span className="text-sm text-text-muted">
                  {offset + 1}–{Math.min(offset + items.length, total)} de {total}
                </span>
                <Button
                  variant="secondary"
                  disabled={offset + PAGE >= total || isFetching}
                  onClick={() => setOffset((o) => o + PAGE)}
                >
                  Próximas
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
