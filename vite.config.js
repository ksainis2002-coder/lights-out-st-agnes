import { defineConfig } from 'vite';

// base: './' keeps every asset path relative so the build runs from any
// GitHub Pages subfolder. Do not change it (CLAUDE.md).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 600, // three.js alone is ~530 kB
    // Three.js in its own chunk: cached across game updates, and keeps the
    // game chunk small enough to read in a bundle report.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'three', test: /node_modules[\\/]three/ }],
        },
      },
    },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
