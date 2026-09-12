import { defineConfig } from 'vite';

export default defineConfig({
  root: 'native',
  base: './',
  build: {
    outDir: '../dist-app',
    emptyOutDir: true,
  },
});
