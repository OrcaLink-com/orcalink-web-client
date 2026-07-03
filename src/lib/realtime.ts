import { useCallback, useEffect, useRef, useState } from 'react';
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

/** Acesso ao socket para consumidores externos (ex.: toasts de notificação). */
export function useSocket(): Socket {
  return getSocket();
}

/** Estado de presença de um usuário observado. */
export interface PresenceState {
  online: boolean;
  /** ISO do último "visto" (quando offline e disponível). */
  lastSeenAt?: string;
}

/**
 * Observa a presença (online/offline/visto por último) de um ou mais usuários.
 * Assina as salas `presence:<id>` no backend e reflete `presence:changed`.
 */
export function usePresence(userId: string | undefined): PresenceState {
  const [state, setState] = useState<PresenceState>({ online: false });

  useEffect(() => {
    if (!userId) return;
    const s = getSocket();
    let cancelled = false;

    const subscribe = () => {
      s.emit('presence:subscribe', { userIds: [userId] }, (snapshot: Array<PresenceState & { userId: string }>) => {
        if (cancelled) return;
        const mine = snapshot?.find((p) => p.userId === userId);
        if (mine) setState({ online: mine.online, lastSeenAt: mine.lastSeenAt });
      });
    };
    if (s.connected) subscribe();
    s.on('connect', subscribe);

    const onChanged = (p: PresenceState & { userId: string }) => {
      if (p.userId !== userId) return;
      setState({ online: p.online, lastSeenAt: p.lastSeenAt });
    };
    s.on('presence:changed', onChanged);

    return () => {
      cancelled = true;
      s.emit('presence:unsubscribe', { userIds: [userId] });
      s.off('connect', subscribe);
      s.off('presence:changed', onChanged);
    };
  }, [userId]);

  return state;
}

/** Ouve o "digitando…" da contraparte no orçamento (auto-expira em 4s). */
export function usePeerTyping(quoteId: string | undefined, peerId: string | undefined): boolean {
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!quoteId) return;
    const s = getSocket();
    const onTyping = (p: { quoteId: string; userId: string; typing: boolean }) => {
      if (p.quoteId !== quoteId) return;
      if (peerId && p.userId !== peerId) return;
      clearTimeout(timer.current);
      setTyping(p.typing);
      if (p.typing) timer.current = setTimeout(() => setTyping(false), 4000);
    };
    s.on('typing', onTyping);
    return () => {
      clearTimeout(timer.current);
      s.off('typing', onTyping);
      setTyping(false);
    };
  }, [quoteId, peerId]);

  return typing;
}

/**
 * Retorna uma função para sinalizar "estou digitando" no orçamento. Faz debounce:
 * emite `typing:true` na primeira tecla e `typing:false` após 2.5s de silêncio.
 */
export function useTypingSignal(quoteId: string | undefined): () => void {
  const active = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      if (active.current && quoteId) {
        getSocket().emit('typing', { quoteId, typing: false });
        active.current = false;
      }
    };
  }, [quoteId]);

  return useCallback(() => {
    if (!quoteId) return;
    const s = getSocket();
    if (!active.current) {
      active.current = true;
      s.emit('typing', { quoteId, typing: true });
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      active.current = false;
      s.emit('typing', { quoteId, typing: false });
    }, 2500);
  }, [quoteId]);
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
