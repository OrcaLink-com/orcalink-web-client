import { useEffect, useRef, useState } from "react";

/**
 * Botão "Entrar com Google" (Google Identity Services).
 *
 * PRONTO, INERTE SEM CREDENCIAL: sem `VITE_GOOGLE_CLIENT_ID` no build, não
 * renderiza nada e o login por e-mail segue normal. Mesmo padrão do `push.ts`,
 * que carrega o SDK por CDN sob demanda — sem dependência npm no front.
 *
 * O GIS devolve um ID token (`credential`); quem valida é a API.
 */
declare global {
  interface Window {
    google?: any;
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

/** Carrega o script do GIS uma única vez (compartilhado entre montagens). */
let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
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

export function GoogleSignInButton({
  onCredential,
  onError,
}: {
  /** Recebe o ID token do Google para trocar por sessão na API. */
  onCredential: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const holder = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!clientId || !holder.current) return;
    let cancelled = false;

    void loadGis()
      .then(() => {
        if (cancelled || !holder.current || !window.google?.accounts?.id)
          return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res: { credential?: string }) => {
            if (res?.credential) void onCredential(res.credential);
          },
        });
        window.google.accounts.id.renderButton(holder.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "pt-BR",
          width: holder.current.offsetWidth || undefined,
        });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setFailed(true);
        onError?.(e.message);
      });

    return () => {
      cancelled = true;
    };
    // onCredential/onError são estáveis o suficiente aqui (definidos no pai por render);
    // reexecutar a cada render recriaria o botão do Google sem necessidade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Sem credencial configurada: nada é renderizado (login por e-mail segue).
  if (!clientId) return null;
  if (failed) {
    return (
      <p className="text-center text-xs text-text-muted">
        Login com Google indisponível. Use seu e-mail abaixo.
      </p>
    );
  }

  return <div ref={holder} className="flex justify-center [&>div]:!w-full" />;
}
