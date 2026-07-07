/* eslint-disable no-undef */
/**
 * Service Worker do Firebase Cloud Messaging (Push em background/fechado).
 *
 * Registrado num ESCOPO DEDICADO (/firebase-cloud-messaging-push-scope) para não
 * colidir com o Service Worker do PWA. A config (pública) chega pela query string
 * no registro (ver lib/push.ts), então este arquivo NÃO precisa ser editado ao
 * adicionar as credenciais. Se a config não vier, o SW fica inerte.
 *
 * Recebemos mensagens DATA-ONLY: montamos a notificação e, no clique, abrimos o
 * app já na tela do evento. Logs com prefixo `[push-sw]` (inspecione o SW em
 * DevTools → Application → Service Workers → o deste escopo).
 */
const FIREBASE_VERSION = '10.12.2';
const log = (...a) => console.info('[push-sw]', ...a);

try {
  importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
  importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`);

  const params = new URL(self.location).searchParams;
  const config = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId'),
  };

  if (config.apiKey && config.messagingSenderId && config.appId) {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    log('inicializado (projectId:', config.projectId + ').');

    messaging.onBackgroundMessage((payload) => {
      log('mensagem em BACKGROUND recebida:', payload);
      const d = payload.data || {};
      const title = d.title || 'OrcaLink';
      const options = {
        body: d.body || '',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: d.conversationId || d.kind || 'orcalink',
        data: { link: d.link || '/' },
      };
      log('exibindo notificação:', title, options.body);
      self.registration.showNotification(title, options);
    });
  } else {
    log('config ausente na query — SW inerte (Push não configurado).');
  }
} catch (e) {
  console.error('[push-sw] erro ao inicializar FCM no SW:', e);
}

// Clique na notificação → abre/foca o app na tela do evento.
self.addEventListener('notificationclick', (event) => {
  log('clique na notificação → abrindo', event.notification && event.notification.data);
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    (async () => {
      const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsArr) {
        if ('focus' in client) {
          try {
            await client.navigate(link);
          } catch (_) {
            /* navegação pode falhar se origem diferente; ignora */
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(link);
      return undefined;
    })(),
  );
});
