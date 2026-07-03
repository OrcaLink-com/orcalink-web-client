import { useNavigate, useParams } from 'react-router-dom';
import { NegotiationChat } from './NegotiationChat';

/**
 * Rota dedicada da negociação (mantida para links diretos / deep-link).
 * O conteúdo vem de `NegotiationChat`; o mesmo componente é reusado no
 * `NegotiationDrawer` a partir do detalhe do orçamento.
 */
export function NegotiationPage() {
  const { quoteId = '', conversationId = '' } = useParams();
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100dvh-8.5rem)] overflow-hidden rounded-2xl border border-border lg:h-[calc(100dvh-7rem)]">
      <NegotiationChat
        quoteId={quoteId}
        conversationId={conversationId}
        onBack={() => navigate(`/orcamento/${quoteId}`)}
      />
    </div>
  );
}
