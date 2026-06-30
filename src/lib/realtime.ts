import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      // `auth` como função é reavaliada a cada (re)conexão → pega o token atual.
      auth: (cb) => cb({ token: localStorage.getItem('ol_access') ?? '' }),
      transports: ['websocket'],
    });
  }
  return socket;
}

/**
 * Tempo real por orçamento: entra na sala e, ao receber `quote:changed`,
 * invalida as queries para re-buscar via REST (respeitando a visibilidade).
 */
export function useQuoteRealtime(quoteId: string | undefined): void {
  const qc = useQueryClient();
  useEffect(() => {
    if (!quoteId) return;
    const s = getSocket();
    const join = () => s.emit('quote:join', { quoteId });
    if (s.connected) join();
    s.on('connect', join);

    const onChanged = (payload: { quoteId: string }) => {
      if (payload.quoteId !== quoteId) return;
      void qc.invalidateQueries({ queryKey: ['quotes', quoteId] }); // quote, conversas, pricing, visitas, review
      void qc.invalidateQueries({ queryKey: ['conversations'] }); // mensagens
    };
    s.on('quote:changed', onChanged);

    return () => {
      s.emit('quote:leave', { quoteId });
      s.off('connect', join);
      s.off('quote:changed', onChanged);
    };
  }, [quoteId, qc]);
}

/**
 * Inbox em tempo real: ouve `notification:new` e invalida a query de inbox.
 * O backend usa salas `user:<id>` para entregar ao destinatário (docs/ux/11 §11.11).
 */
export function useNotificationsRealtime(): void {
  const qc = useQueryClient();
  useEffect(() => {
    const s = getSocket();
    const onNew = () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    };
    s.on('notification:new', onNew);
    return () => {
      s.off('notification:new', onNew);
    };
  }, [qc]);
}
