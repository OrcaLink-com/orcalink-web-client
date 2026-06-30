// Consome o preset compartilhado de @orcalink/design-tokens + plugin do HeroUI.
// As cores de domínio resolvem via CSS variables (theme-dark.css); o HeroUI usa um
// tema dark mapeado para os MESMOS hex dos nossos tokens (evita choque de nomes).
import preset from '@orcalink/design-tokens/tailwind-preset';
import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  darkMode: 'class',
  plugins: [
    heroui({
      defaultTheme: 'dark',
      themes: {
        dark: {
          colors: {
            background: '#0b0e14',
            foreground: '#e8eaed',
            divider: '#232a39',
            focus: '#3b82f6',
            content1: '#161b26',
            content2: '#1e2533',
            content3: '#232a39',
            content4: '#2b3446',
            default: {
              50: '#11151d',
              100: '#161b26',
              200: '#1e2533',
              300: '#232a39',
              400: '#2b3446',
              500: '#3a445a',
              foreground: '#e8eaed',
              DEFAULT: '#1e2533',
            },
            primary: {
              foreground: '#ffffff',
              DEFAULT: '#3b82f6',
            },
            secondary: {
              foreground: '#ffffff',
              DEFAULT: '#1d4ed8',
            },
            success: {
              foreground: '#04130a',
              DEFAULT: '#22c55e',
            },
            warning: {
              foreground: '#1a1203',
              DEFAULT: '#f5a623',
            },
            danger: {
              foreground: '#ffffff',
              DEFAULT: '#f0616d',
            },
          },
        },
      },
      layout: {
        radius: { small: '8px', medium: '12px', large: '18px' },
        fontSize: { tiny: '0.75rem', small: '0.875rem', medium: '0.95rem', large: '1.1rem' },
      },
    }),
  ],
};
