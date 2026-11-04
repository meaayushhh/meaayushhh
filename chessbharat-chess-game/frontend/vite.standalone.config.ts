import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const root = import.meta.dirname;

/**
 * Standalone build: a single classic IIFE bundle with the logo and fonts
 * inlined as data URIs, so the whole game can be assembled into one offline
 * HTML file (see scripts/build-standalone.mjs). Not used by the WordPress
 * plugin, which ships the normal module build in assets/dist.
 */
export default defineConfig({
  plugins: [react()],
  // Lib builds don't inline NODE_ENV, so React would reference `process` at
  // runtime. Replace it for the standalone bundle.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: resolve(root, 'standalone-dist'),
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000, // inline the logo + woff2 fonts as data URIs
    lib: {
      entry: resolve(root, 'src/main.tsx'),
      name: 'ChessBharatApp',
      formats: ['iife'],
      fileName: () => 'standalone.js',
    },
    rollupOptions: {
      output: { assetFileNames: 'standalone.[ext]' },
    },
    target: 'es2019',
  },
});
