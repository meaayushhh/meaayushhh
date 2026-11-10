import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const root = import.meta.dirname;

/**
 * The frontend builds into ../assets/dist with STABLE filenames
 * (chessbharat.js / chessbharat.css) so the WordPress plugin can enqueue
 * them predictably and version them with filemtime(). No build tools are
 * required on the production WordPress server - only the compiled output
 * in assets/dist is shipped and loaded.
 */
export default defineConfig({
  plugins: [react()],
  // Relative base so bundled asset URLs resolve against the script's own
  // location (via import.meta.url) - correct when the plugin is served from
  // /wp-content/plugins/.../assets/dist/ rather than the site root.
  base: './',
  build: {
    outDir: resolve(root, '../assets/dist'),
    emptyOutDir: true,
    cssCodeSplit: false,
    // Keep it to a single JS + single CSS for simple WP enqueueing in Phase 1.
    // Code-splitting for the lazy-loaded engine is introduced in Phase 3.
    rollupOptions: {
      input: resolve(root, 'src/main.tsx'),
      output: {
        entryFileNames: 'chessbharat.js',
        chunkFileNames: 'chessbharat-[name].js',
        assetFileNames: (info) => {
          const name = info.names?.[0] ?? '';
          if (name.endsWith('.css')) return 'chessbharat.css';
          return 'media/[name]-[hash][extname]';
        },
      },
    },
    target: 'es2020',
    sourcemap: false,
  },
});
