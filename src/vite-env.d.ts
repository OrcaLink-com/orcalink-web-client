/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BRAND_NAME?: string;
  readonly VITE_BRAND_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Permite importar o CSS de tema do pacote de design tokens.
declare module '@orcalink/design-tokens/theme.css';
