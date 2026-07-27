import { useEffect, useRef, useState } from "react";

/**
 * Botão "Entrar com Google" (Google Identity Services).
 *
 * PRONTO, INERTE SEM CREDENCIAL: sem `VITE_GOOGLE_CLIENT_ID` no build, não
 * renderiza nada e o login por e-mail segue normal. Mesmo padrão do `push.ts`,
 * que carrega o SDK por CDN sob demanda — sem dependência npm no front.
 *
 * O GIS devolve um ID token (`credential`); quem valida é a API.
 *
 * Tema ESCURO (`filled_black`) para não destoar do fundo do app, e largura
 * recalculada no resize (o Google exige um inteiro 200–400; passar o valor
 * fracionário/0 do primeiro render causava o botão branco desalinhado).
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
    const el = holder.current;

    // Largura exigida pelo Google: inteiro entre 200 e 400. Usa clientWidth (não
    // é afetado por transform da animação de entrada, que dava um valor grande e
    // fazia o botão vazar o padding do card).
    const pickWidth = () => Math.max(200, Math.min(400, el.clientWidth || 320));
    const draw = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "center",
        locale: "pt-BR",
        width: pickWidth(),
      });
    };

    let ro: ResizeObserver | null = null;
    let safety: ReturnType<typeof setTimeout> | null = null;
    let last = 0;
    const redraw = () => {
      const w = pickWidth();
      if (w === last) return;
      last = w;
      draw();
    };
    void loadGis()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res: { credential?: string }) => {
            if (res?.credential) void onCredential(res.credential);
          },
        });
        last = pickWidth();
        draw(); // desenha na hora (garante que o botão apareça)
        // Corrige a largura se o container mudar (layout assenta após a animação).
        ro = new ResizeObserver(redraw);
        ro.observe(el);
        safety = setTimeout(redraw, 300); // rede de segurança pós-animação
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setFailed(true);
        onError?.(e.message);
      });

    return () => {
      cancelled = true;
      ro?.disconnect();
      if (safety) clearTimeout(safety);
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

  // min-height reserva o espaço do botão (evita "pulo" enquanto o GIS carrega).
  return <div ref={holder} className="flex min-h-[44px] justify-center" />;
}
