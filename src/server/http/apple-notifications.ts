import { billingForProductId } from "@/lib/apple-iap-products";
import { getSupabaseAdminClient } from "@/server/lib/supabase";

/**
 * Raw HTTP route for Apple's App Store Server Notifications V2 — mounted
 * directly in src/server.ts (outside the TanStack Start RPC layer) because
 * Apple needs a stable public URL. Configure it in App Store Connect under
 * Apps → BeautyAI → App Information → App Store Server Notifications:
 * POST {APP_URL}/api/apple/notifications
 *
 * Handles renewals, cancellations, refunds, and expirations for
 * subscriptions that were first recorded by verifyApplePurchase
 * (src/functions/subscriptions.ts) when the user completed the purchase in
 * the app.
 */
export async function handleAppleNotification(request: Request): Promise<Response> {
  let body: { signedPayload?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.signedPayload) {
    return new Response("Missing signedPayload", { status: 400 });
  }

  try {
    // Dynamic import so this module (and @apple/app-store-server-library,
    // which performs disallowed global-scope crypto I/O at load time) never
    // gets pulled into the shared SSR chunk — see apple-iap.ts for details.
    const { getAppleSignedDataVerifier } = await import("@/server/lib/apple-iap");
    const verifier = await getAppleSignedDataVerifier();
    const notification = await verifier.verifyAndDecodeNotification(body.signedPayload);

    const signedTransactionInfo = notification.data?.signedTransactionInfo;
    if (!signedTransactionInfo) {
      // Notification carries no transaction (e.g. a summary/extension
      // notification) — nothing for us to reconcile.
      return acknowledged();
    }

    const transaction = await verifier.verifyAndDecodeTransaction(signedTransactionInfo);
    if (!transaction.originalTransactionId || !transaction.productId) {
      return acknowledged();
    }
    if (!billingForProductId(transaction.productId)) {
      // Not one of our Premium products — ignore.
      return acknowledged();
    }

    const isRevoked = transaction.revocationDate != null;
    const isExpired = transaction.expiresDate != null && transaction.expiresDate < Date.now();
    const status = isRevoked ? "revoked" : isExpired ? "expired" : "active";
    const plan = status === "active" ? "premium" : "free";

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan,
        status,
        apple_product_id: transaction.productId,
        apple_environment: transaction.environment,
        current_period_end: transaction.expiresDate
          ? new Date(transaction.expiresDate).toISOString()
          : null,
      })
      .eq("apple_original_transaction_id", transaction.originalTransactionId);

    if (error) {
      console.error("Failed to update subscription from Apple notification", error);
      return new Response("Internal error", { status: 500 });
    }

    return acknowledged();
  } catch (error) {
    console.error("Failed to verify Apple Server Notification", error);
    // Signature/verification failures are not retryable by Apple resending
    // the same payload, so acknowledge rather than trigger their retry storm.
    return acknowledged();
  }
}

function acknowledged(): Response {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
