import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkult.app.quizz',
  appName: 'Inkult',
  webDir: 'out',
<<<<<<< Updated upstream
  server: {
    url: 'https://inkult.app',
    cleartext: true,
  },
=======
>>>>>>> Stashed changes
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
