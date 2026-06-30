import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        name: 'OrcaLink — Orçamentos de serviços',
        short_name: 'OrcaLink',
        description: 'Solicite orçamentos, compare propostas e contrate profissionais com segurança.',
        lang: 'pt-BR',
        theme_color: '#0b0e14',
        background_color: '#0b0e14',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['business', 'productivity', 'lifestyle'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'CacheFirst',
            options: { cacheName: 'uploads', expiration: { maxEntries: 60, maxAgeSeconds: 604800 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    // O pacote design-tokens é uma dependência local (file:); permitir acesso.
    fs: { allow: ['..'] },
  },
  // design-tokens é distribuído como fonte .ts; não pré-empacotar.
  optimizeDeps: {
    exclude: ['@orcalink/design-tokens'],
  },
});
