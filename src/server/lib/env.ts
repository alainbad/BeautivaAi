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
};
