/**
 * Camada de Push (Firebase Cloud Messaging) — COMPLEMENTA Toast + WebSocket + Central.
 *
 * PRONTA, INERTE SEM CREDENCIAIS: só faz algo quando as variáveis
 * `VITE_FIREBASE_*` estão definidas no build. Sem elas, todas as funções são
 * no-op e o app segue funcionando com Toast/WebSocket/Central normalmente.
 *
 * Carrega o SDK do Firebase via CDN (compat) sob demanda — não adiciona
 * dependência npm. O Service Worker (`/firebase-messaging-sw.js`) exibe o Push
 * quando o app está em background/fechado; em foreground o Toast (WebSocket)
 * cuida da exibição (o `onMessage` aqui é silencioso), evitando duplicação.
 *
 * IMPORTANTE: o SW é registrado num ESCOPO DEDICADO
 * (`/firebase-cloud-messaging-push-scope`) para NÃO colidir com o Service Worker
 * do PWA (vite-plugin-pwa), que ocupa o escopo `/`. Registrar dois SWs no mesmo
 * escopo faz um sobrescrever o registro do outro — o que derruba o Push.
 *
 * Logs com prefixo `[push]` para diagnóstico ponta a ponta.
 */
import { api } from './api';
import { notificationsDenied } from './consent';

const FIREBASE_VERSION = '10.12.2';
const SW_SCOPE = '/firebase-cloud-messaging-push-scope';
const log = (...a: unknown[]) => console.info('[push]', ...a);
const logErr = (...a: unknown[]) => console.error('[push]', ...a);

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
}

function readConfig(): { config: FirebaseConfig; vapidKey: string } | null {
  const env = import.meta.env;
  const apiKey = env.VITE_FIREBASE_API_KEY as string | undefined;
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
  const appId = env.VITE_FIREBASE_APP_ID as string | undefined;
  const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const vapidKey = env.VITE_FIREBASE_VAPID_KEY as string | undefined;
  const missing = [
    !apiKey && 'VITE_FIREBASE_API_KEY',
    !projectId && 'VITE_FIREBASE_PROJECT_ID',
    !messagingSenderId && 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    !appId && 'VITE_FIREBASE_APP_ID',
    !vapidKey && 'VITE_FIREBASE_VAPID_KEY',
  ].filter(Boolean);
  if (missing.length) {
    log('desativado — variáveis ausentes:', missing.join(', '));
    return null;
  }
  return {
    config: {
      apiKey: apiKey!,
      authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || `${projectId}.firebaseapp.com`,
      projectId: projectId!,
      messagingSenderId: messagingSenderId!,
      appId: appId!,
    },
    vapidKey: vapidKey!,
  };
}

let loadPromise: Promise<void> | null = null;
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(s);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fb(): any {
  // window.firebase é definido pelos scripts compat do CDN.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).firebase;
}

async function ensureSdk(): Promise<void> {
  if (fb()?.messaging) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`);
    })();
  }
  await loadPromise;
}

/**
 * Aguarda ESTE registro (o do FCM, no escopo dedicado) ter um SW ATIVO.
 * `navigator.serviceWorker.ready` resolve para o SW que controla a página (o do
 * PWA, escopo "/") — por isso não serve aqui e o `subscribe` falhava com
 * "no active Service Worker".
 */
function waitForActive(registration: ServiceWorkerRegistration): Promise<void> {
  return new Promise((resolve) => {
    if (registration.active) return resolve();
    const sw = registration.installing || registration.waiting;
    if (!sw) {
      // Sem SW em transição: aguarda o updatefound como fallback.
      const onUpdate = () => {
        const next = registration.installing;
        if (next) {
          next.addEventListener('statechange', () => {
            if (next.state === 'activated') resolve();
          });
        }
      };
      registration.addEventListener('updatefound', onUpdate, { once: true });
      // Timeout de segurança para não travar o fluxo.
      setTimeout(resolve, 4000);
      return;
    }
    const onState = () => {
      if (sw.state === 'activated') resolve();
    };
    sw.addEventListener('statechange', onState);
    if (sw.state === 'activated') resolve();
    setTimeout(resolve, 4000);
  });
}

let currentToken: string | null = null;

/**
 * Inicializa o Push: pede permissão, registra o Service Worker do FCM, obtém o
 * token e o envia ao backend. Chame após o login. Silencioso se não configurado.
 */
export async function initPush(): Promise<void> {
  try {
    const cfg = readConfig();
    if (!cfg) return; // não configurado → no-op

    // Respeita o consentimento (LGPD): se o usuário recusou notificações, não registra.
    if (notificationsDenied()) {
      log('push desativado por consentimento do usuário (apenas essenciais).');
      return;
    }

    if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) {
      log('desativado — navegador sem suporte a serviceWorker/Notification/PushManager.');
      return;
    }
    if (!window.isSecureContext) {
      logErr('contexto inseguro (Push exige HTTPS ou localhost). Origin:', window.location.origin);
      return;
    }

    const permission =
      Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    log('permissão de notificação:', permission);
    if (permission !== 'granted') return;

    await ensureSdk();
    log('SDK Firebase carregado.');

    // Passa a config ao SW via query (config público) para ele inicializar o FCM.
    const params = new URLSearchParams({
      apiKey: cfg.config.apiKey,
      authDomain: cfg.config.authDomain,
      projectId: cfg.config.projectId,
      messagingSenderId: cfg.config.messagingSenderId,
      appId: cfg.config.appId,
    }).toString();
    // ESCOPO DEDICADO — não colide com o SW do PWA (escopo "/").
    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`, {
      scope: SW_SCOPE,
    });
    log('Service Worker do FCM registrado no escopo', SW_SCOPE);
    // Garante que ESTE registro (FCM) esteja ATIVO antes de pedir o token.
    // `navigator.serviceWorker.ready` resolveria para o SW do PWA (escopo "/"),
    // fazendo o getToken chamar pushManager.subscribe sem SW ativo → AbortError.
    await waitForActive(registration);
    log('Service Worker do FCM ativo.');

    if (!fb().apps?.length) fb().initializeApp(cfg.config);
    const messaging = fb().messaging();
    log('Firebase inicializado (projectId:', cfg.config.projectId + ').');

    // Foreground: NÃO exibe nada (o Toast via WebSocket cuida). Evita duplicar.
    messaging.onMessage((payload: unknown) => {
      log('mensagem em FOREGROUND (silenciosa; Toast via WebSocket):', payload);
    });

    let token: string;
    try {
      token = await messaging.getToken({
        vapidKey: cfg.vapidKey,
        serviceWorkerRegistration: registration,
      });
    } catch (err) {
      // "push service error" costuma ser assinatura antiga presa no navegador
      // (VAPID key trocada) OU VAPID key inválida. Limpamos a assinatura e tentamos 1x.
      logErr('getToken falhou; limpando assinatura antiga e tentando novamente:', (err as Error)?.message ?? err);
      try {
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await existing.unsubscribe();
          log('assinatura push antiga removida.');
        }
      } catch (subErr) {
        logErr('não foi possível remover a assinatura antiga:', subErr);
      }
      token = await messaging.getToken({
        vapidKey: cfg.vapidKey,
        serviceWorkerRegistration: registration,
      });
    }
    if (!token) {
      logErr('getToken retornou vazio (verifique a VAPID key e a permissão).');
      return;
    }
    log('token FCM obtido:', token.slice(0, 16) + '…');
    if (token !== currentToken) {
      currentToken = token;
      await api.registerPushToken(token);
      log('token enviado ao backend com sucesso.');
    } else {
      log('token inalterado — já registrado.');
    }
  } catch (err) {
    // Push é complementar — nunca deve quebrar o app, mas AGORA logamos o motivo.
    const msg = (err as Error)?.message ?? String(err);
    logErr('falha ao inicializar o Push:', msg, err);
    if (/push service error|applicationServerKey|InvalidAccessError/i.test(msg)) {
      logErr(
        'DICA: erro do serviço de push geralmente = VAPID key errada. Confira que ' +
          'VITE_FIREBASE_VAPID_KEY é a chave PÚBLICA de "Cloud Messaging → Certificados push da Web" ' +
          'do MESMO projeto (' + (readConfig()?.config.projectId ?? '?') + ') e que todos os VITE_FIREBASE_* são desse projeto.',
      );
    }
  }
}

/** Remove o token atual (chame no logout). */
export async function disablePush(): Promise<void> {
  try {
    if (currentToken) {
      await api.unregisterPushToken(currentToken);
      log('token removido no logout.');
      currentToken = null;
    }
  } catch (err) {
    logErr('falha ao remover token no logout:', err);
  }
}
