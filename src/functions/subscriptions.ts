import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
              "com.beautyai.app://stripe-checkout?status=success",
              "com.beautyai.app://stripe-checkout?status=cancel",
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
