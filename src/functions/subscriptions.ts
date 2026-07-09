import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { billingForProductId } from "@/lib/apple-iap-products";
import { requireUser } from "@/server/lib/auth";
import { serverEnv } from "@/server/lib/env";
import { AppError, toApiResponse } from "@/server/lib/response";
import { getStripeClient } from "@/server/lib/stripe";

export const getSubscription = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("subscriptions")
      .select()
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

/** subscriptionService: creates a Stripe Checkout session for a Premium plan. */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator(
    z.object({
      billing: z.enum(["monthly", "yearly"]),
      platform: z.enum(["web", "ios"]).default("web"),
    }),
  )
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      const stripe = getStripeClient();

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let customerId = subscription?.stripe_customer_id ?? undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
        await supabase
          .from("subscriptions")
          .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
      }

      const priceId =
        data.billing === "monthly" ? serverEnv.stripePriceMonthly : serverEnv.stripePriceYearly;

      // On iOS the checkout page runs in the system browser (Capacitor Browser
      // plugin), which has no direct route back into the app — redirecting to
      // our custom URL scheme lets iOS hand control back to BeautyAI, where
      // capacitor deep-link handling (src/lib/capacitor/deep-link.ts) closes
      // the browser and refreshes subscription state.
      const [successUrl, cancelUrl] =
        data.platform === "ios"
          ? [
              "com.beautivaai.app://stripe-checkout?status=success",
              "com.beautivaai.app://stripe-checkout?status=cancel",
            ]
          : [
              `${serverEnv.appUrl}/pricing?checkout=success`,
              `${serverEnv.appUrl}/pricing?checkout=cancel`,
            ];

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: user.id,
        subscription_data: { metadata: { supabase_user_id: user.id } },
      });

      if (!session.url) throw new AppError("Stripe did not return a checkout URL.", 502);
      return { checkoutUrl: session.url };
    }),
  );

/**
 * subscriptionService.verifyApplePurchase — called right after a native
 * StoreKit purchase is approved (see src/lib/capacitor/iap.ts). Verifies the
 * signed transaction against Apple's servers before the client is allowed to
 * `transaction.finish()`, and records the subscription. Renewals and
 * cancellations after this point arrive via the App Store Server
 * Notifications V2 webhook (src/server/http/apple-notifications.ts).
 */
export const verifyApplePurchase = createServerFn({ method: "POST" })
  .validator(z.object({ signedTransaction: z.string().min(1) }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      // Dynamic import so this module (and @apple/app-store-server-library,
      // which performs disallowed global-scope crypto I/O at load time)
      // never gets pulled into the shared SSR chunk — see apple-iap.ts.
      const { getAppleSignedDataVerifier } = await import("@/server/lib/apple-iap");
      const verifier = await getAppleSignedDataVerifier();

      const transaction = await verifier.verifyAndDecodeTransaction(data.signedTransaction);

      const billing = transaction.productId ? billingForProductId(transaction.productId) : null;
      if (!billing) {
        throw new AppError(`Unrecognized product id: ${transaction.productId ?? "unknown"}`, 400);
      }
      if (!transaction.originalTransactionId) {
        throw new AppError("Apple transaction is missing an originalTransactionId.", 502);
      }

      const isRevoked = transaction.revocationDate != null;
      const isExpired = transaction.expiresDate != null && transaction.expiresDate < Date.now();
      const status = isRevoked ? "revoked" : isExpired ? "expired" : "active";
      const plan = status === "active" ? "premium" : "free";

      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan,
          status,
          apple_original_transaction_id: transaction.originalTransactionId,
          apple_product_id: transaction.productId,
          apple_environment: transaction.environment,
          current_period_end: transaction.expiresDate
            ? new Date(transaction.expiresDate).toISOString()
            : null,
        },
        { onConflict: "user_id" },
      );
      if (error) throw new AppError(error.message, 500);

      return { plan, status, billing };
    }),
  );

/** Lets a Premium user manage/cancel billing without a custom cancellation form. */
export const createBillingPortalSession = createServerFn({ method: "POST" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const stripe = getStripeClient();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!subscription?.stripe_customer_id) {
      throw new AppError("No billing account found yet — subscribe to Premium first.", 400);
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${serverEnv.appUrl}/settings`,
    });
    return { portalUrl: portal.url };
  }),
);
