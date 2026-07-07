import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from '../lib/realtime';
import { getActiveConversation } from '../lib/activeChat';
import { MessageAvatar } from './Chat/MessageAvatar';

/** Payload leve entregue pelo socket (`message:new`). */
interface IncomingMessage {
  quoteId: string;
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  preview: string;
  createdAt: string;
}

interface Toast extends IncomingMessage {
  /** id único do toast (permite empilhar várias do mesmo remetente). */
  key: string;
}

const AUTO_DISMISS_MS = 6000;

/**
 * Toaster de novas mensagens. Ouve `message:new` e mostra um card moderno
 * (avatar · nome · prévia · hora). Clicar abre o orçamento + chat e destaca a
 * mensagem. Se o usuário já está vendo aquela conversa, não notifica.
 */
export function MessageToaster() {
  const socket = useSocket();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onMessage = (msg: IncomingMessage) => {
      // Atualiza listas (não lidas, última mensagem) mesmo fora do chat.
      void qc.invalidateQueries({ queryKey: ['me', 'conversations'] });
      void qc.invalidateQueries({ queryKey: ['quotes', msg.quoteId, 'conversations'] });
      void qc.invalidateQueries({ queryKey: ['conversations', msg.conversationId, 'messages'] });
      void qc.invalidateQueries({ queryKey: ['notifications'] });
      // Já olhando exatamente este chat → não incomoda; a conversa atualiza sozinha.
      if (getActiveConversation() === msg.conversationId) return;
      // Aba em background → quem notifica é o Push (FCM), não o Toast. Evita duplicar.
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      const key = `${msg.messageId}-${Date.now()}`;
      setToasts((prev) => [...prev.slice(-2), { ...msg, key }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== key));
      }, AUTO_DISMISS_MS);
    };
    socket.on('message:new', onMessage);
    return () => {
      socket.off('message:new', onMessage);
    };
  }, [socket, qc]);

  function dismiss(key: string) {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }

  function open(t: Toast) {
    dismiss(t.key);
    // Abre o orçamento e sinaliza p/ abrir o chat na gaveta lateral (Drawer).
    navigate(`/app/orcamento/${t.quoteId}`, { state: { openChat: t.conversationId } });
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:left-auto sm:right-4 sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.key}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={() => open(t)}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-content1/95 p-3 text-left shadow-pop backdrop-blur-xl transition-colors hover:bg-content2"
          >
            <MessageAvatar participant={{ name: t.senderName, avatarUrl: t.senderAvatarUrl ?? undefined }} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{t.senderName}</p>
                <span className="ml-auto shrink-0 text-[11px] text-text-muted">
                  {new Date(t.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-sm text-text-muted">{t.preview}</p>
              <p className="mt-1 text-[11px] font-medium text-primary">Toque para abrir a conversa</p>
            </div>
            <span
              role="button"
              aria-label="Dispensar"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.key);
              }}
              className="shrink-0 rounded-full px-1.5 text-text-muted hover:text-foreground"
            >
              ✕
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
