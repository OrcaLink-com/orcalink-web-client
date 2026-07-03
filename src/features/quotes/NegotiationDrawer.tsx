import { Drawer, DrawerContent, DrawerBody } from '@heroui/react';
import { NegotiationChat } from './NegotiationChat';

interface NegotiationDrawerProps {
  quoteId: string;
  /** Conversa a exibir; quando null o drawer fica fechado. */
  conversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Chat da negociação em um Drawer lateral — abre por cima do detalhe do
 * orçamento sem navegar de página. Reusa `NegotiationChat`.
 */
export function NegotiationDrawer({ quoteId, conversationId, isOpen, onClose }: NegotiationDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen && Boolean(conversationId)}
      onClose={onClose}
      placement="right"
      size="lg"
      hideCloseButton
      backdrop="blur"
      classNames={{ base: 'bg-background', body: 'p-0' }}
    >
      <DrawerContent>
        <DrawerBody className="flex min-h-0 flex-col p-0">
          {conversationId && (
            <NegotiationChat quoteId={quoteId} conversationId={conversationId} onBack={onClose} />
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
