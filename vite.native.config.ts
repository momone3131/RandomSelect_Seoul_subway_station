import { defineConfig } from 'vite';

export default defineConfig({
  root: 'native',
  publicDir: '../public',
  base: './',
  define: {
    // The native runtime never uses this value as a Web API key. It only keeps
    // the existing composition root on the PlaceSearchService path; the service
    // delegates to the Capacitor native bridge before any Maps JS code executes.
    'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify('__NATIVE_BRIDGE__'),
  },
  build: {
    outDir: '../dist-app',
    emptyOutDir: true,
  },
});
