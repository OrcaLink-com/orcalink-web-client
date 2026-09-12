import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * `lazy()` com auto-recuperação de chunk defasado.
 *
 * Depois de um deploy novo, um `import()` dinâmico pode falhar (ou resolver
 * vazio) porque o Service Worker/CDN ainda servia o `index.html` antigo, que
 * aponta para chunks com hash que não existem mais. O sintoma é a tela branca
 * `Cannot read properties of undefined (reading 'LoginPage')`.
 *
 * Aqui detectamos isso e recarregamos a página UMA vez (guardado em
 * sessionStorage) para buscar o index atualizado — sem loop de reload.
 * O tipo das props do componente é preservado (`M[K]`).
 */
export function lazyPage<M, K extends keyof M>(
  factory: () => Promise<M>,
  name: K,
): LazyExoticComponent<M[K] extends ComponentType<infer _P> ? M[K] : never> {
  return lazy(async () => {
    try {
      // Chunk defasado pode resolver `undefined` — usar optional chaining evita o
      // TypeError cru ("reading 'HomePage'") e cai no erro amigável + reload abaixo.
      const mod = (await factory()) as Record<string, unknown> | undefined;
      const Comp = (mod?.[name as string] ??
        (mod as { default?: unknown } | undefined)?.default) as ComponentType<unknown> | undefined;
      if (!Comp) throw new Error(`Chunk "${String(name)}" carregou vazio (deploy defasado?).`);
      return { default: Comp };
    } catch (err) {
      const KEY = 'ol_chunk_reload';
      if (typeof window !== 'undefined' && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
      }
      throw err;
    }
    // O cast é seguro: `Comp` tem o tipo de `M[K]`.
  }) as LazyExoticComponent<M[K] extends ComponentType<infer _P> ? M[K] : never>;
}
