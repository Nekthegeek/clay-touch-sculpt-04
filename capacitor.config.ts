import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cf22dee98ea44a1bb2555392d5ecd070',
  appName: 'clay-touch-sculpt-04',
  webDir: 'dist',
  server: {
    url: 'https://cf22dee9-8ea4-4a1b-b255-5392d5ecd070.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1C1C1E'
    },
    Haptics: {
      enabled: true
    }
  }
};

export default config;