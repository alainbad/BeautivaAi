# BeautyAI — Backend & iOS Setup

This file covers the backend (Supabase, Claude AI, Apple In-App Purchase
billing) and Capacitor iOS build — the parts of this repo owned by the
backend/Claude side of the project. Frontend UI/UX is owned by Lovable; see
`AGENTS.md`.

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
   - `supabase/migrations/0005_apple_iap.sql`
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
   `com.beautivaai.app://auth-callback` to the list of allowed redirect URLs
   (this is what lets the OAuth flow hand control back to the iOS app —
   see `src/lib/capacitor/deep-link.ts`).

### Sign in with Apple

On iOS this uses the native AuthenticationServices flow (Face ID/Touch ID
prompt, no browser hop) via `@capacitor-community/apple-sign-in`, exchanging
the identity token directly with Supabase (`signInWithIdToken`). On web it
falls back to a normal OAuth redirect, same as Google. See
`src/lib/auth-client.ts`'s `signInWithApple`.

1. **Apple Developer → Certificates, Identifiers & Profiles → Identifiers**:
   open the `com.beautivaai.app` App ID and enable the **Sign In with Apple**
   capability.
2. **Identifiers → Services IDs**: create a new Services ID (e.g.
   `com.beautivaai.app.web`) for the web OAuth fallback. Configure it with:
   - Primary App ID: `com.beautivaai.app`
   - Domain: your deployed app's domain (e.g. `your-app.example.com`)
   - Return URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

   If you use a Services ID other than `com.beautivaai.app.web`, update
   `APPLE_SERVICES_ID` in `src/lib/auth-client.ts`.
3. **Keys**: create a new key with **Sign In with Apple** enabled, associated
   with the Services ID above. Download the `.p8` file (only downloadable
   once) and note its **Key ID**, plus your **Team ID** (top right of the
   Apple Developer site).
4. In **Supabase → Authentication → Providers → Apple**, enable the provider
   and set:
   - **Client IDs**: `com.beautivaai.app,com.beautivaai.app.web` (comma-separated
     — the bundle ID covers native sign-in, the Services ID covers the web
     OAuth fallback)
   - **Secret Key**: paste your Team ID, Key ID, and the `.p8` private key
     contents where Supabase's UI asks for them (it signs the client secret
     JWT for you).
5. Under Authentication → URL Configuration, confirm
   `com.beautivaai.app://auth-callback` is in the allowed redirect URLs (it's
   already there from the Google setup above — reused for Apple's web
   fallback too).
6. In Xcode, add the **Sign In with Apple** capability to the App target
   (Signing & Capabilities → + Capability). No Info.plist entry is required.

## 3. Claude (Anthropic)

Set `ANTHROPIC_API_KEY`. Used for:

- `src/functions/skin-analysis.ts` — Claude vision analyzes selfies and
  returns structured cosmetic scores + AM/PM routines.
- `src/functions/chat.ts` — the AI Beauty Chat (Premium feature).
- `src/functions/routine.ts` — routine regeneration from profile + latest
  analysis.

## 4. Apple In-App Purchases (Premium billing)

BeautyAI is App Store-only, so Premium subscriptions run entirely through
StoreKit rather than a web checkout. The client uses
[`capacitor-plugin-cdv-purchase`](https://github.com/j3k0/cordova-plugin-purchase)
(`src/lib/capacitor/iap.ts`); the backend verifies purchases directly against
Apple using Apple's own official
[`@apple/app-store-server-library`](https://github.com/apple/app-store-server-library-node)
— no third-party billing service involved.

### 4.1 App Store Connect setup

1. In **App Store Connect → Apps → BeautyAI → Subscriptions**, create a
   Subscription Group (e.g. "BeautyAI Premium").
2. Add two auto-renewable subscription products in that group, with product
   IDs matching exactly what's hardcoded in
   `src/lib/apple-iap-products.ts`:
   - `com.beautivaai.app.premium.monthly` — $2.99/month
   - `com.beautivaai.app.premium.yearly` — $29.99/year
3. Fill in the required subscription display name, description, and pricing
   for each. Submit them for review along with your first app build (Apple
   reviews IAP products together with the app binary).

### 4.2 Server-to-Apple credentials (for the App Store Server API)

1. **App Store Connect → Users and Access → Integrations → In-App Purchase**
   → create a new key. Download the `.p8` file (only downloadable once) and
   note its **Key ID**.
2. Note your **Issuer ID** from the same Integrations page.
3. Set in `.env`:
   ```sh
   APPLE_IAP_ISSUER_ID=<issuer id>
   APPLE_IAP_KEY_ID=<key id>
   APPLE_IAP_PRIVATE_KEY="$(cat AuthKey_XXXXXXXXXX.p8)"
   APPLE_IAP_BUNDLE_ID=com.beautivaai.app
   APPLE_IAP_APP_APPLE_ID=<numeric App Store app id, Production only>
   APPLE_IAP_ENVIRONMENT=Sandbox   # switch to Production at launch
   ```

### 4.3 Apple root certificate (for verifying signed transactions)

The backend deploys to Cloudflare Workers, which has no filesystem, so the
root certificate is passed as a base64 env var instead of a bundled file:

```sh
curl -o AppleRootCA-G3.cer https://www.apple.com/certificateauthority/AppleRootCA-G3.cer
base64 -i AppleRootCA-G3.cer | tr -d '\n' > AppleRootCA-G3.b64
printf 'APPLE_IAP_ROOT_CERTS_BASE64=%s\n' "$(cat AppleRootCA-G3.b64)" >> .env
```
(Get the exact current root certificate list from
[apple.com/certificateauthority](https://www.apple.com/certificateauthority/)
— "Apple Root CA - G3 Root" is the one used by the App Store Server Library
as of this writing. Delete the `.cer`/`.b64` files after copying the value;
don't commit them.)

### 4.4 App Store Server Notifications V2 (renewals, cancellations, refunds)

In **App Store Connect → Apps → BeautyAI → App Information → App Store
Server Notifications**, set both the Production and Sandbox URLs to:

```
{APP_URL}/api/apple/notifications
```

Handled directly in `src/server.ts` (outside the TanStack Start RPC layer,
same reasoning as the Stripe webhook below) — see
`src/server/http/apple-notifications.ts`.

### 4.5 Testing

Use a [Sandbox tester account](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox)
(App Store Connect → Users and Access → Sandbox → Testers) signed into the
iOS Simulator or a device to test purchases without being charged, with
`APPLE_IAP_ENVIRONMENT=Sandbox`.

## 5. Stripe (currently unused)

The Stripe integration (`src/functions/subscriptions.ts`'s
`createCheckoutSession`/`createBillingPortalSession`, and
`src/server/http/stripe-webhook.ts`) is still in the codebase but not wired
into any UI — Premium billing runs through Apple IAP above instead. It's
kept in case a web checkout path is added later. To activate it again:

1. Create two recurring Prices for the Premium plan (monthly + yearly) and
   set `STRIPE_PRICE_ID_PREMIUM_MONTHLY` / `STRIPE_PRICE_ID_PREMIUM_YEARLY`.
2. Add a webhook endpoint pointing at `{APP_URL}/api/stripe/webhook` listening
   for `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Set `STRIPE_SECRET_KEY` from the Stripe dashboard.
4. Wire `createCheckoutSession` back into `src/routes/pricing.tsx`.

## 6. Running the backend locally

```sh
bun install
bun run dev
```

## 7. Building for iOS (Capacitor)

BeautyAI is a server-rendered app (auth cookies, Claude/Apple IAP server
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

Also register the custom URL scheme (for Google sign-in return) by adding a
`CFBundleURLTypes` entry for `com.beautivaai.app` in Info.plist, or via Xcode's
target → Info → URL Types. In-app purchases don't need this — StoreKit
purchase and renewal flows are entirely native, no browser redirect involved.

Local/push notification permission prompts are handled at runtime by
`@capacitor/local-notifications` / `@capacitor/push-notifications` — no
extra Info.plist entry is required for those beyond the standard
`NSUserNotificationsUsageDescription` (optional, iOS shows its own system
prompt).

Test on a simulator or device via Xcode's Run button once synced.
