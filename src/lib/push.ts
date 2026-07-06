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
 * Para ativar, defina no ambiente do build (público, não secreto):
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
 *   VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_VAPID_KEY
 * e no backend `FIREBASE_SERVICE_ACCOUNT` (+ `npm i firebase-admin`).
 */
import { api } from './api';

const FIREBASE_VERSION = '10.12.2';

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
  if (!apiKey || !messagingSenderId || !appId || !projectId || !vapidKey) return null;
  return {
    config: {
      apiKey,
      authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || `${projectId}.firebaseapp.com`,
      projectId,
      messagingSenderId,
      appId,
    },
    vapidKey,
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

let currentToken: string | null = null;

/**
 * Inicializa o Push: pede permissão, registra o Service Worker do FCM, obtém o
 * token e o envia ao backend. Chame após o login. Silencioso se não configurado
 * ou se a permissão não for concedida.
 */
export async function initPush(): Promise<void> {
  try {
    const cfg = readConfig();
    if (!cfg) return; // não configurado → no-op
    if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) return;

    const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    if (permission !== 'granted') return;

    await ensureSdk();

    // Passa a config ao SW via query (config público) para ele inicializar o FCM.
    const params = new URLSearchParams({
      apiKey: cfg.config.apiKey,
      authDomain: cfg.config.authDomain,
      projectId: cfg.config.projectId,
      messagingSenderId: cfg.config.messagingSenderId,
      appId: cfg.config.appId,
    }).toString();
    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`);

    if (!fb().apps?.length) fb().initializeApp(cfg.config);
    const messaging = fb().messaging();

    // Foreground: NÃO exibe nada (o Toast via WebSocket cuida). Evita duplicar.
    messaging.onMessage(() => {
      /* silencioso: o WebSocket já mostra o Toast e atualiza a UI */
    });

    const token: string = await messaging.getToken({ vapidKey: cfg.vapidKey, serviceWorkerRegistration: registration });
    if (token && token !== currentToken) {
      currentToken = token;
      await api.registerPushToken(token);
    }
  } catch {
    /* push é complementar — nunca deve quebrar o app */
  }
}

/** Remove o token atual (chame no logout). */
export async function disablePush(): Promise<void> {
  try {
    if (currentToken) {
      await api.unregisterPushToken(currentToken);
      currentToken = null;
    }
  } catch {
    /* ignore */
  }
}
