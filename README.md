# BeautyAI — Backend & iOS Setup

This file covers the backend (Supabase, Claude AI, Stripe) and Capacitor iOS
build — the parts of this repo owned by the backend/Claude side of the
project. Frontend UI/UX is owned by Lovable; see `AGENTS.md`.

## 1. Environment variables

Copy `.env.example` to `.env` and fill in real values. `VITE_`-prefixed vars
are the only ones bundled into the client; everything else is server-only.

## 2. Supabase project setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations in order against your project (SQL editor, or via the
   Supabase CLI: `supabase link` then `supabase db push`):
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_storage.sql`
   - `supabase/migrations/0004_routine_completions.sql`
3. Optionally seed the product catalog: run `supabase/seed.sql`.
4. Copy the Project URL and anon key into `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`, and the service role key into
   `SUPABASE_SERVICE_ROLE_KEY` (Settings → API).
5. To make a user an admin (unlocks `/admin`), run:
   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```

### Google sign-in

1. In the [Google Cloud Console](https://console.cloud.google.com/), create
   an OAuth 2.0 Client ID (Web application) and add
   `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorized
   redirect URI.
2. In Supabase → Authentication → Providers → Google, paste the client ID
   and secret and enable the provider.
3. Under Authentication → URL Configuration, add
   `com.beautyai.app://auth-callback` to the list of allowed redirect URLs
   (this is what lets the OAuth flow hand control back to the iOS app —
   see `src/lib/capacitor/deep-link.ts`).

## 3. Claude (Anthropic)

Set `ANTHROPIC_API_KEY`. Used for:

- `src/server/functions/skin-analysis.ts` — Claude vision analyzes selfies
  and returns structured cosmetic scores + AM/PM routines.
- `src/server/functions/chat.ts` — the AI Beauty Chat (Premium feature).
- `src/server/functions/routine.ts` — routine regeneration from profile +
  latest analysis.

## 4. Stripe

1. Create two recurring Prices for the Premium plan (monthly + yearly) and
   set `STRIPE_PRICE_ID_PREMIUM_MONTHLY` / `STRIPE_PRICE_ID_PREMIUM_YEARLY`.
2. Add a webhook endpoint pointing at `{APP_URL}/api/stripe/webhook` listening
   for `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Set `STRIPE_SECRET_KEY` from the Stripe dashboard.

The webhook is handled directly in `src/server.ts` (outside the normal
TanStack Start RPC layer, since Stripe needs a stable public URL and the raw
request body for signature verification) — see
`src/server/http/stripe-webhook.ts`.

## 5. Running the backend locally

```sh
bun install
bun run dev
```

## 6. Building for iOS (Capacitor)

BeautyAI is a server-rendered app (auth cookies, Claude/Stripe server
functions), so it ships to iOS in Capacitor's "remote server" mode: the
native shell loads your deployed BeautyAI URL over HTTPS, and native plugins
bridge in through the injected Capacitor runtime.

```sh
# 1. Deploy the app (Cloudflare/Node/etc.) and note its HTTPS URL.
# 2. Generate the iOS platform project (first time only):
bun run cap:add:ios

# 3. Point Capacitor at your deployed backend and sync:
CAPACITOR_SERVER_URL=https://your-deployed-app.example.com bun run cap:sync:ios

# 4. Open in Xcode:
bun run cap:open:ios
```

In Xcode, add the following to `ios/App/App/Info.plist` (required for the
Camera plugin and local notifications used by the skin analysis, progress
photo, and routine reminder flows):

```xml
<key>NSCameraUsageDescription</key>
<string>BeautyAI needs camera access so users can take a selfie for cosmetic skin analysis.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>BeautyAI needs photo access so users can upload skin analysis and progress photos.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>BeautyAI needs photo access so users can upload skin analysis and progress photos.</string>
```

Also register the custom URL scheme (for Google sign-in and Stripe Checkout
return) by adding a `CFBundleURLTypes` entry for `com.beautyai.app` in
Info.plist, or via Xcode's target → Info → URL Types.

Local/push notification permission prompts are handled at runtime by
`@capacitor/local-notifications` / `@capacitor/push-notifications` — no
extra Info.plist entry is required for those beyond the standard
`NSUserNotificationsUsageDescription` (optional, iOS shows its own system
prompt).

Test on a simulator or device via Xcode's Run button once synced.
