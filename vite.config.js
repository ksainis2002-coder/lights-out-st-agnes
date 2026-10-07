import { defineConfig } from 'vite';

// base: './' keeps every asset path relative so the build runs from any
// GitHub Pages subfolder. Do not change it (CLAUDE.md).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
