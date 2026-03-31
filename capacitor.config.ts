import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teube.app',
  appName: 'Teubé',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Haptics: {
      // Use native haptics on iOS/Android
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#050505',
    },
  },
};

export default config;
