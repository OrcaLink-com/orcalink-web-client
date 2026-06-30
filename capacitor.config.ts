import type { CapacitorConfig } from '@capacitor/cli';

// appId vem da marca (design-tokens). Aqui mantemos o default por simplicidade;
// no build de produção, parametrizar por env.
const config: CapacitorConfig = {
  appId: 'com.orcalink.client',
  appName: 'OrcaLink',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
