import type Stripe from "stripe";
import { serverEnv } from "@/server/lib/env";
import { getStripeClient } from "@/server/lib/stripe";
import { getSupabaseAdminClient } from "@/server/lib/supabase";

/**
 * Raw Stripe webhook handler. Mounted directly in src/server.ts (outside the
 * createServerFn RPC layer) because Stripe needs a stable public URL and the
 * exact raw request body for signature verification.
 *
 * Configure in the Stripe dashboard: POST {APP_URL}/api/stripe/webhook
 * Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 */
export async function handleStripeWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature header", { status: 400 });

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, serverEnv.stripeWebhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
        if (!userId || !session.subscription || !session.customer) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: "premium",
            status: subscription.status,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(
              subscription.items.data[0].current_period_end * 1000,
            ).toISOString(),
          },
          { onConflict: "user_id" },
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        const query = supabase.from("subscriptions").update({
          plan: isActive ? "premium" : "free",
          status: subscription.status,
          current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000,
          ).toISOString(),
        });

        if (userId) {
          await query.eq("user_id", userId);
        } else {
          await query.eq("stripe_subscription_id", subscription.id);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`Failed to process Stripe webhook event ${event.type}`, error);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
