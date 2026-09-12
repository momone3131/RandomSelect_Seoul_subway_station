import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.github.momone3131.randomseoul',
  appName: 'Random Seoul',
  webDir: 'dist-app',
  server: {
    androidScheme: 'https',
  },
};

export default config;
