import type { CapacitorConfig } from "@capacitor/cli";

// BeautyAI is a TanStack Start SSR app (it needs a live server for
// createServerFn RPCs, auth cookies, and the Stripe webhook route), so it
// can't ship as a fully static Capacitor bundle. Instead the iOS shell loads
// the deployed app over HTTPS (Capacitor's "remote server" mode) and native
// plugins (Camera, Local/Push Notifications, Browser, Preferences) bridge in
// through the injected Capacitor JS runtime. Point CAPACITOR_SERVER_URL at
// your deployed BeautyAI URL before running `npx cap sync ios`.
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.beautyai.app",
  appName: "BeautyAI",
  webDir: ".output/public",
  ios: {
    contentInset: "always",
  },
  ...(serverUrl && {
    server: {
      url: serverUrl,
      cleartext: false,
    },
  }),
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#C79A82",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
