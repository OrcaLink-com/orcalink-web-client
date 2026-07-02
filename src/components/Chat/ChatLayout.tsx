import type {
  ChatActionHandlers,
  ChatConversation,
  ChatMessage,
  ChatViewer,
} from './types';
import { ChatSidebar } from './ChatSidebar';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatConversationView } from './ChatConversationView';

/**
 * Shell de duas colunas (sidebar + conversa). Preenche o container pai e usa o
 * fundo do app — SEM moldura flutuante, pra parecer parte da plataforma.
 *
 *  - **Desktop (≥lg):** sidebar fixa + painel da conversa.
 *  - **Mobile:** uma coluna — sem conversa → lista; com conversa → painel.
 */
export interface ChatLayoutProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack?: () => void;
  viewer: ChatViewer;
  messages: ChatMessage[];
  handlers: ChatActionHandlers;
  loading?: boolean;
  peerTyping?: boolean;
}

export function ChatLayout({
  conversations,
  selectedId,
  onSelect,
  onBack,
  viewer,
  messages,
  handlers,
  loading,
  peerTyping,
}: ChatLayoutProps) {
  const active = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <ChatSidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        className={`w-full shrink-0 flex-col border-r border-border lg:flex lg:w-[340px] ${
          active ? 'hidden lg:flex' : 'flex'
        }`}
      />

      <section className={`min-w-0 flex-1 ${active ? 'flex' : 'hidden lg:flex'}`}>
        {active ? (
          <ChatConversationView
            key={active.id}
            peer={active.peer}
            serviceStatus={active.serviceStatus}
            viewer={viewer}
            messages={messages}
            handlers={handlers}
            loading={loading}
            peerTyping={peerTyping}
            onBack={onBack}
          />
        ) : (
          <ChatEmptyState className="m-auto" />
        )}
      </section>
    </div>
  );
}
