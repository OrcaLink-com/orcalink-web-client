import { defineConfig } from '@vite-pwa/assets-generator/config';

/**
 * O `pwa-source.svg` já é um ícone completo (fundo escuro arredondado + marca
 * centralizada). O preset padrão (minimal2023) gera apple/maskable com FUNDO
 * BRANCO e padding — o que criava a borda branca feia ao redor do ícone.
 *
 * Aqui usamos fundo da marca (#0b0e14) e sem padding no apple (full-bleed); no
 * maskable mantemos um respiro pequeno, mas na mesma cor do fundo (invisível),
 * respeitando a "safe zone" do Android sem mostrar branco.
 */
export default defineConfig({
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
    },
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#0b0e14' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: '#0b0e14' },
    },
  },
  images: ['public/pwa-source.svg'],
});
