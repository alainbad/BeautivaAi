import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import type {
  SignInWithAppleOptions,
  SignInWithAppleResponse,
} from "@capacitor-community/apple-sign-in";
import { getSupabaseBrowserClient } from "./supabase/browser-client";

/**
 * A hand-rolled proxy for the native "SignInWithApple" plugin, instead of
 * importing `@capacitor-community/apple-sign-in` itself. That package's JS
 * bundles `scriptjs` (for its web fallback), which touches `document` at
 * module-load time — pulling it in (even via `import type` plus a runtime
 * value import elsewhere, since bundlers can merge them into one chunk) can
 * crash SSR, the same pitfall hit with capacitor-plugin-cdv-purchase in
 * lib/capacitor/iap.ts. We only ever call this on a native iOS device, where
 * `registerPlugin` routes straight to the Swift plugin — no JS web
 * implementation is needed, so we never have to load that package's runtime.
 */
const SignInWithApple = Capacitor.registerPlugin<{
  authorize(options: SignInWithAppleOptions): Promise<SignInWithAppleResponse>;
}>("SignInWithApple");

/**
 * Custom URL scheme the native iOS shell registers (see capacitor.config.ts
 * + ios/App/App/Info.plist) so Supabase's OAuth redirect can hand control
 * back to the app instead of leaving the user stranded in the browser.
 */
export const NATIVE_AUTH_CALLBACK_URL = "com.beautivaai.app://auth-callback";

/**
 * Services ID configured in Apple Developer (Certificates, Identifiers &
 * Profiles → Identifiers → Services IDs) — only used for the web OAuth
 * fallback below. The native flow signs in with the app's own bundle ID
 * (com.beautivaai.app) via AuthenticationServices and ignores this value; see
 * README.md "Sign in with Apple" for setup steps.
 */
const APPLE_SERVICES_ID = "com.beautivaai.app.web";

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
 * `com.beautivaai.app://auth-callback` redirect to finish the sign-in.
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

function randomNonce(length = 32): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Apple sign-in. On iOS this uses the native AuthenticationServices flow
 * (Face ID / Touch ID prompt, no browser hop) and hands the resulting
 * identity token straight to Supabase — Apple requires the SHA-256 hash of a
 * nonce in the authorization request and the original raw nonce back when
 * redeeming the token, to prevent replay attacks. On web it falls back to a
 * normal OAuth redirect, matching signInWithGoogle above.
 */
export async function signInWithApple() {
  const supabase = getSupabaseBrowserClient();

  if (!Capacitor.isNativePlatform()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: webRedirectUrl("/home") },
    });
    if (error) throw error;
    return;
  }

  const rawNonce = randomNonce();
  const hashedNonce = await sha256Hex(rawNonce);

  const { response } = await SignInWithApple.authorize({
    clientId: APPLE_SERVICES_ID,
    redirectURI: NATIVE_AUTH_CALLBACK_URL,
    scopes: "email name",
    nonce: hashedNonce,
  });

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: response.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}
