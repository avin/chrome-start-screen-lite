import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import fs from 'node:fs';
import path from 'node:path';

function loadManifest() {
  const target = process.env.TARGET || 'chrome';
  const byTarget = path.resolve(__dirname, `manifests/manifest.${target}.json`);
  if (fs.existsSync(byTarget)) {
    return JSON.parse(fs.readFileSync(byTarget, 'utf8'));
  }
  // fallback to root manifest.json for local dev compatibility
  const fallback = path.resolve(__dirname, 'manifest.json');
  return JSON.parse(fs.readFileSync(fallback, 'utf8'));
}

export default defineConfig(({ command }) => ({
  plugins: [
    solidPlugin(),
    ...(command === 'build' || process.env.CRX ? [crx({ manifest: loadManifest() })] : []),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
}));
