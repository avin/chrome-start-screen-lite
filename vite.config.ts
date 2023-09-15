import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import manifest from './manifest.json';

export default defineConfig(({ command }) => ({
  plugins: [
    solidPlugin(),
    ...(command === 'build' || process.env.CRX ? [crx({ manifest })] : []),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
}));
