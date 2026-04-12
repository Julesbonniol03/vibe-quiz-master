import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkult.app',
  appName: 'Inkult',
  webDir: 'out',
  bundledWebRuntime: false,
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3109961148486262~4407464156'
    }
  }
};

export default config;
