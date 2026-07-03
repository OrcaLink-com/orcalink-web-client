/**
 * Rastreia qual conversa está aberta na tela AGORA. Serve para o toaster de
 * mensagens suprimir a notificação quando o usuário já está olhando aquele chat
 * (nesse caso a conversa só atualiza normalmente via realtime).
 *
 * É um singleton de módulo (não React state) de propósito: o toaster lê o valor
 * dentro de um listener de socket, fora do ciclo de render.
 */
let activeConversationId: string | null = null;

export function setActiveConversation(id: string | null): void {
  activeConversationId = id;
}

export function getActiveConversation(): string | null {
  return activeConversationId;
}
