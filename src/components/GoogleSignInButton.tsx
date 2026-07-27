import { useEffect, useRef, useState } from "react";

/**
 * Botão "Continuar com o Google" — botão NOSSO (estilizado pelo app), sem o
 * botão renderizado do GIS (que arrastava um iframe branco por cima).
 *
 * Usa o fluxo de CÓDIGO OAuth (popup): o Google devolve um `code` que a API
 * troca por um id_token no servidor. Assim controlamos 100% o visual.
 *
 * PRONTO, INERTE SEM CREDENCIAL: sem `VITE_GOOGLE_CLIENT_ID` não renderiza nada.
 * Carrega o SDK do GIS por CDN sob demanda (sem dependência npm), igual ao push.ts.
 */
declare global {
  interface Window {
    google?: any;
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Não foi possível carregar o Google."));
    document.head.appendChild(script);
  });
  return gisPromise;
}

/** "G" oficial do Google (4 cores). */
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  onCode,
  onError,
}: {
  /** Recebe o `code` do OAuth para a API trocar por sessão. */
  onCode: (code: string) => void | Promise<void>;
  onError?: (message: string) => void;
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const clientRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    void loadGis()
      .then(() => {
        if (cancelled || !window.google?.accounts?.oauth2) return;
        clientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: "openid email profile",
          ux_mode: "popup",
          callback: (resp: { code?: string; error?: string }) => {
            if (resp?.error) {
              // "access_denied" = usuário fechou o popup; não é erro de fato.
              if (resp.error !== "access_denied") {
                onError?.("Não foi possível entrar com o Google.");
              }
              return;
            }
            if (resp?.code) void onCode(resp.code);
          },
        });
        setReady(true);
      })
      .catch((e: Error) => {
        if (!cancelled) onError?.(e.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Sem credencial: nada é renderizado (login por e-mail segue).
  if (!clientId) return null;

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => clientRef.current?.requestCode()}
      className="flex w-full items-center justify-center gap-2.5 rounded-medium border border-border bg-content2 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-content3 disabled:opacity-60"
    >
      <GoogleG />
      Continuar com o Google
    </button>
  );
}
