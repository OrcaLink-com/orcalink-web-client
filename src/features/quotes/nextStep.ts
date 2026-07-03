import type { QuoteStatus } from '../../lib/types';

/**
 * "Próximo passo" da negociação, calculado na perspectiva de quem vê. O objetivo
 * é que nenhum dos dois lados fique em dúvida sobre o que fazer a seguir: sempre
 * dizemos a etapa atual, de quem é a vez, qual a ação e o que vem depois.
 */
export type NextStepTone = 'primary' | 'amber' | 'green' | 'sky' | 'neutral';

export interface NextStep {
  /** Rótulo curto da etapa atual (ex.: "Estimativa aceita"). */
  stageLabel: string;
  tone: NextStepTone;
  /** É a vez de quem vê agir? (senão, está aguardando a contraparte). */
  youAct: boolean;
  /** A ação principal esperada agora (imperativo). */
  actionText: string;
  /** O que acontece depois dessa ação (opcional). */
  hintText?: string;
}

export type ProposalTypeLite = 'PRE' | 'FINAL';
export type ProposalStatusLite = 'PENDING' | 'ACCEPTED' | 'APPROVED' | 'REJECTED' | 'FINISHED';

export interface NextStepInput {
  quoteStatus: QuoteStatus;
  viewerRole: 'client' | 'provider';
  requiresVisit: boolean;
  latestProposalType?: ProposalTypeLite;
  latestProposalStatus?: ProposalStatusLite;
  /** Já houve visita técnica concluída. */
  hasCompletedVisit: boolean;
  /** Há visita sugerida aguardando confirmação do cliente. */
  hasPendingVisit: boolean;
  /** Há visita técnica confirmada (aceita) aguardando ser realizada/confirmada pelo prestador. */
  hasConfirmedVisit: boolean;
}

/** Nome da contraparte na frase ("o profissional" / "o cliente"). */
function counterpart(role: 'client' | 'provider'): string {
  return role === 'client' ? 'o profissional' : 'o cliente';
}

export function computeNextStep(input: NextStepInput): NextStep | null {
  const {
    quoteStatus,
    viewerRole,
    requiresVisit,
    latestProposalType,
    latestProposalStatus,
    hasCompletedVisit,
    hasPendingVisit,
    hasConfirmedVisit,
  } = input;
  const isClient = viewerRole === 'client';
  const other = counterpart(viewerRole);

  const waiting = (stageLabel: string, actor: 'client' | 'provider', actionForActor: string, hint?: string): NextStep => {
    const youAct = viewerRole === actor;
    return {
      stageLabel,
      tone: youAct ? 'primary' : 'neutral',
      youAct,
      actionText: youAct ? actionForActor : `Aguardando ${other}`,
      hintText: youAct ? hint : actionForActor.replace(/^./, (c) => c.toLowerCase()),
    };
  };

  switch (quoteStatus) {
    case 'CREATED':
    case 'WAITING_PROPOSALS':
    case 'IN_NEGOTIATION': {
      // Estimativa (PRE) aceita → agendar visita ou enviar a proposta final.
      if (latestProposalType === 'PRE' && latestProposalStatus === 'ACCEPTED') {
        if (requiresVisit && !hasCompletedVisit) {
          if (hasPendingVisit) {
            return {
              stageLabel: 'Estimativa aceita · visita sugerida',
              tone: 'sky',
              youAct: isClient,
              actionText: isClient ? 'Confirme o horário da visita técnica' : `Aguardando ${other} confirmar a visita`,
              hintText: 'Depois da visita, o profissional envia a proposta final.',
            };
          }
          if (hasConfirmedVisit) {
            // Visita agendada e aceita → falta o prestador realizar e confirmar.
            return {
              stageLabel: 'Visita técnica agendada',
              tone: 'sky',
              youAct: !isClient,
              actionText: isClient
                ? `Aguardando a visita e a confirmação do ${other}`
                : 'Após a visita, confirme que ela foi realizada',
              hintText: isClient
                ? 'Depois, o profissional envia a proposta final.'
                : 'Marcar como realizada libera o envio da proposta final.',
            };
          }
          return {
            stageLabel: 'Estimativa aceita',
            tone: 'primary',
            youAct: !isClient,
            actionText: isClient ? `Aguardando ${other} agendar a visita técnica` : 'Agende a visita técnica',
            hintText: 'Após a visita, envie a proposta final.',
          };
        }
        return {
          stageLabel: 'Estimativa aceita',
          tone: 'primary',
          youAct: !isClient,
          actionText: isClient ? `Aguardando ${other} enviar a proposta final` : 'Envie a proposta final',
          hintText: isClient ? 'Você poderá aceitá-la para contratar.' : 'O cliente poderá aceitá-la para contratar.',
        };
      }
      // Proposta final pendente → cliente decide.
      if (latestProposalType === 'FINAL' && latestProposalStatus === 'PENDING') {
        return waiting(
          'Proposta final recebida',
          'client',
          'Analise e aceite a proposta para contratar',
          'Ao aceitar, você vai para o pagamento.',
        );
      }
      // Estimativa pendente → cliente decide.
      if (latestProposalType === 'PRE' && latestProposalStatus === 'PENDING') {
        return waiting(
          'Estimativa recebida',
          'client',
          'Analise a estimativa recebida',
          'Aceite para avançar a negociação.',
        );
      }
      // Sem proposta ainda → prestador começa.
      return waiting(
        'Em negociação',
        'provider',
        'Envie uma estimativa ou proposta',
        'O cliente poderá aceitar para avançar.',
      );
    }

    case 'PROVIDER_SELECTED':
    case 'WAITING_PAYMENT':
      return {
        stageLabel: 'Proposta aceita · aguardando pagamento',
        tone: 'amber',
        youAct: isClient,
        actionText: isClient ? 'Realize o pagamento para contratar' : 'Aguardando o pagamento do cliente',
        hintText: isClient
          ? 'O valor fica em custódia até a conclusão do serviço.'
          : 'Assim que o cliente pagar, você agenda a execução.',
      };

    case 'PAID':
      return {
        stageLabel: 'Pagamento confirmado',
        tone: 'sky',
        youAct: !isClient,
        actionText: isClient ? `Aguardando ${other} agendar a execução` : 'Agende a data de execução',
        hintText: 'Combine a melhor data com a contraparte.',
      };

    case 'EXECUTION_SCHEDULED':
      return {
        stageLabel: 'Execução agendada',
        tone: 'sky',
        youAct: !isClient,
        actionText: isClient ? `Aguardando ${other} iniciar o serviço` : 'Inicie o serviço na data combinada',
        hintText: 'Ao iniciar, o cliente acompanha o andamento.',
      };

    case 'IN_PROGRESS':
      return {
        stageLabel: 'Serviço em execução',
        tone: 'sky',
        youAct: isClient,
        actionText: isClient ? 'Confirme a conclusão quando o serviço terminar' : `Aguardando ${other} confirmar a conclusão`,
        hintText: isClient ? 'Após confirmar, o repasse é liberado ao profissional.' : 'O repasse é liberado após a confirmação.',
      };

    case 'FINISHED':
      return {
        stageLabel: 'Serviço concluído',
        tone: 'green',
        youAct: isClient,
        actionText: isClient ? 'Avalie o profissional' : 'Serviço concluído — repasse liberado',
        hintText: isClient ? 'Sua avaliação ajuda outros clientes.' : undefined,
      };

    case 'CANCELED':
      return {
        stageLabel: 'Negociação encerrada',
        tone: 'neutral',
        youAct: false,
        actionText: 'Este orçamento foi cancelado',
      };

    default:
      return null;
  }
}
