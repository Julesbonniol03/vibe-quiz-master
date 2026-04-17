import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkult.app',
  appName: 'Inkult',
  webDir: 'out',
  server: {
    url: 'https://inkult.app',
    cleartext: true,
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3109961148486262~4407464156',
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#050505',
    },
  },
};

export default config;
