import { brand } from '@orcalink/design-tokens/brand.config';
import { ButtonLink } from '../../components/ui';
import { IconBack, IconArrowRight } from '../../components/icons';

/**
 * Página 404 personalizada. `homeTo` define o destino do botão principal
 * ("/" para visitantes; "/app" quando dentro da área autenticada).
 */
export function NotFoundPage({ homeTo = '/' }: { homeTo?: string }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-8">
        <div
          aria-hidden
          className="select-none bg-gradient-to-br from-primary to-primary-600 bg-clip-text text-[7rem] font-black leading-none text-transparent"
        >
          404
        </div>
        <img
          src="/pwa-source.svg"
          alt=""
          aria-hidden
          className="absolute -right-3 -top-3 h-12 w-12 rotate-6 rounded-medium shadow-pop"
        />
      </div>

      <h1 className="text-xl font-bold">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        O link que você abriu não existe ou foi movido. Vamos te levar de volta para um lugar conhecido.
      </p>

      <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <ButtonLink to={homeTo} startContent={<IconBack size={16} />}>
          Voltar para o início
        </ButtonLink>
        {homeTo !== '/' && (
          <ButtonLink to="/" variant="secondary" endContent={<IconArrowRight size={16} />}>
            Ver o site do {brand.name}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
