// Server-only environment access. Never import this from client components —
// it reads secrets (service role key, Anthropic/Stripe keys) that must not
// end up in the browser bundle.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

export const serverEnv = {
  get supabaseUrl() {
    return required("VITE_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("VITE_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get anthropicApiKey() {
    return required("ANTHROPIC_API_KEY");
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
  },
  get stripePriceMonthly() {
    return required("STRIPE_PRICE_ID_PREMIUM_MONTHLY");
  },
  get stripePriceYearly() {
    return required("STRIPE_PRICE_ID_PREMIUM_YEARLY");
  },
  get appUrl() {
    return process.env.APP_URL ?? "http://localhost:3000";
  },
  get appleIapIssuerId() {
    return required("APPLE_IAP_ISSUER_ID");
  },
  get appleIapKeyId() {
    return required("APPLE_IAP_KEY_ID");
  },
  get appleIapPrivateKey() {
    // Contents of the .p8 in-app-purchase key downloaded from App Store
    // Connect. If the env var holds literal "\n" escapes (common when
    // pasting a multi-line PEM into a single-line .env value), unescape them.
    return required("APPLE_IAP_PRIVATE_KEY").replace(/\\n/g, "\n");
  },
  get appleIapBundleId() {
    return process.env.APPLE_IAP_BUNDLE_ID ?? "com.beautyai.app";
  },
  get appleIapAppAppleId() {
    const value = process.env.APPLE_IAP_APP_APPLE_ID;
    return value ? Number(value) : undefined;
  },
  get appleIapEnvironment(): "Sandbox" | "Production" {
    return process.env.APPLE_IAP_ENVIRONMENT === "Production" ? "Production" : "Sandbox";
  },
};
