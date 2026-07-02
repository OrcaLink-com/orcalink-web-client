import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mantém um container rolado até o fim quando `dep` muda (novas mensagens),
 * a menos que o usuário tenha rolado para cima manualmente.
 */
export function useAutoScrollToBottom<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  const pinnedRef = useRef(true);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedRef.current = distance < 80;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [dep]);

  return { ref, onScroll };
}

/**
 * Envolve uma ação assíncrona derivando estado idle → loading → success/error.
 * Usado pelos Action Cards para dirigir loading/success dos botões.
 */
export function useAsyncAction(action?: () => Promise<void>) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const run = useCallback(async () => {
    if (!action) return;
    setState('loading');
    try {
      await action();
      setState('success');
    } catch {
      setState('error');
    }
  }, [action]);

  return { state, run, isLoading: state === 'loading', isSuccess: state === 'success' };
}
