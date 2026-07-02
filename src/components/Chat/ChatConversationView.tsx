import { MotionConfig, motion } from 'framer-motion';
import type { ChatActionHandlers, ChatMessage, ChatParticipant, ChatViewer, ServiceStatus } from './types';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatComposer } from './ChatComposer';
import { paneIn } from './animations';

export interface ChatConversationViewProps {
  peer: ChatParticipant;
  serviceStatus: ServiceStatus;
  viewer: ChatViewer;
  messages: ChatMessage[];
  handlers: ChatActionHandlers;
  loading?: boolean;
  peerTyping?: boolean;
  /** Voltar (mobile / embutido no app). */
  onBack?: () => void;
  onOpenMenu?: (action: 'details' | 'archive' | 'block') => void;
  /** Desabilita o composer (conversa encerrada). */
  disabled?: boolean;
  className?: string;
}

/**
 * Painel de uma conversa — header · mensagens · composer. Embutível: preenche o
 * container pai, SEM moldura flutuante, pra se integrar naturalmente ao app
 * (é o que as telas reais renderizam; o `ChatLayout` também o usa por dentro).
 */
export function ChatConversationView({
  peer,
  serviceStatus,
  viewer,
  messages,
  handlers,
  loading,
  peerTyping,
  onBack,
  onOpenMenu,
  disabled,
  className = '',
}: ChatConversationViewProps) {
  const off = disabled ?? serviceStatus === 'canceled';
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={paneIn}
        initial="initial"
        animate="animate"
        className={`flex h-full min-h-0 w-full flex-col bg-background ${className}`}
      >
        <ChatHeader
          peer={peer}
          serviceStatus={serviceStatus}
          onBack={onBack}
          onOpenMenu={onOpenMenu}
          className="shrink-0"
        />
        <ChatMessages
          messages={messages}
          viewer={viewer}
          handlers={handlers}
          loading={loading}
          peerTyping={peerTyping}
          className="min-h-0 flex-1"
        />
        <ChatComposer
          onSend={(t) => handlers.onSendMessage?.(t)}
          onAttach={handlers.onSendAttachment}
          disabled={off}
          placeholder={off ? 'Conversa encerrada' : 'Mensagem'}
          className="shrink-0"
        />
      </motion.div>
    </MotionConfig>
  );
}
