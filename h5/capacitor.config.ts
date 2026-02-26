import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vietbridge.ai",
  appName: "VietBridge AI",
  webDir: "dist",
  server: {
    // In production, the H5 loads from local files and calls the remote API
    // via VITE_API_BASE set at build time
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#F8F7F5",
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#F8F7F5",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#F8F7F5",
    },
  },
};

export default config;
