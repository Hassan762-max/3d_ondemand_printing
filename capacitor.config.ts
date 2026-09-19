import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Printora Android shell loads the live Next.js origin in a WebView.
 * Set CAPACITOR_SERVER_URL to your ngrok or LAN URL before syncing, e.g.:
 *   CAPACITOR_SERVER_URL=https://xxxx.ngrok-free.app
 * Default: local Next.js on the Android emulator loopback.
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.replace(/\/$/, "") ||
  "http://10.0.2.2:3000";

const config: CapacitorConfig = {
  appId: "pk.printora.app",
  appName: "Printora",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
