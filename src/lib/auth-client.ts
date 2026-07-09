import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { getSupabaseBrowserClient } from "./supabase/browser-client";

/**
 * Custom URL scheme the native iOS shell registers (see capacitor.config.ts
 * + ios/App/App/Info.plist) so Supabase's OAuth redirect can hand control
 * back to the app instead of leaving the user stranded in the browser.
 */
export const NATIVE_AUTH_CALLBACK_URL = "com.beautyai.app://auth-callback";

function webRedirectUrl(path: string) {
  return `${window.location.origin}${path}`;
}

export async function signUpWithPassword(opts: {
  email: string;
  password: string;
  fullName: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: opts.email,
    password: opts.password,
    options: {
      data: { full_name: opts.fullName },
      // Confirmation links always land on the web /verified page (opened in
      // the system browser even from a native shell) — handling the
      // signup-confirmation hash tokens via a native deep link is a possible
      // future enhancement, not implemented yet.
      emailRedirectTo: webRedirectUrl("/verified"),
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword(opts: { email: string; password: string }) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword(opts);
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Capacitor.isNativePlatform() ? NATIVE_AUTH_CALLBACK_URL : webRedirectUrl("/login"),
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}

/**
 * Google sign-in. On the web this is a normal OAuth redirect. On iOS
 * (Capacitor), Supabase's `signInWithOAuth` can't navigate the WKWebView
 * away from the app, so we open the OAuth URL in the system browser via the
 * Capacitor Browser plugin and let capacitor-deep-link.ts pick up the
 * `com.beautyai.app://auth-callback` redirect to finish the sign-in.
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient();
  const isNative = Capacitor.isNativePlatform();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: isNative ? NATIVE_AUTH_CALLBACK_URL : webRedirectUrl("/home"),
      skipBrowserRedirect: isNative,
    },
  });
  if (error) throw error;

  if (isNative && data.url) {
    await Browser.open({ url: data.url, presentationStyle: "popover" });
  }
}
