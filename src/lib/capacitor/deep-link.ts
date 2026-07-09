import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

let initialized = false;

/**
 * Wires up `com.beautivaai.app://...` deep links so OAuth (Google sign-in) and
 * Stripe Checkout can hand control back to the native app. Call once at app
 * startup (see src/routes/__root.tsx). No-ops on web.
 */
export function initNativeDeepLinks(
  onStripeCheckoutReturn?: (status: "success" | "cancel") => void,
) {
  if (initialized || !Capacitor.isNativePlatform()) return;
  initialized = true;

  CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
    const parsed = new URL(url);
    if (parsed.protocol !== "com.beautivaai.app:") return;

    await Browser.close().catch(() => {});

    if (parsed.host === "auth-callback" || parsed.pathname.includes("auth-callback")) {
      const supabase = getSupabaseBrowserClient();
      const code = parsed.searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      return;
    }

    if (parsed.host === "stripe-checkout" || parsed.pathname.includes("stripe-checkout")) {
      const status = parsed.searchParams.get("status") === "success" ? "success" : "cancel";
      onStripeCheckoutReturn?.(status);
    }
  });
}
