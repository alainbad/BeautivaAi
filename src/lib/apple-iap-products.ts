// Apple In-App Purchase product identifiers — must exactly match the
// subscription products created in App Store Connect (Subscriptions group
// "BeautyAI Premium"). Shared between client (registering/ordering products)
// and server (mapping a verified productId back to a billing plan).

export const APPLE_IAP_BUNDLE_ID = "com.beautivaai.app";

export const APPLE_PRODUCT_ID_PREMIUM_MONTHLY = "com.beautivaai.app.premium.monthly";
export const APPLE_PRODUCT_ID_PREMIUM_YEARLY = "com.beautivaai.app.premium.yearly";

export type PremiumBilling = "monthly" | "yearly";

export const PREMIUM_PRODUCT_IDS: Record<PremiumBilling, string> = {
  monthly: APPLE_PRODUCT_ID_PREMIUM_MONTHLY,
  yearly: APPLE_PRODUCT_ID_PREMIUM_YEARLY,
};

export function billingForProductId(productId: string): PremiumBilling | null {
  if (productId === APPLE_PRODUCT_ID_PREMIUM_MONTHLY) return "monthly";
  if (productId === APPLE_PRODUCT_ID_PREMIUM_YEARLY) return "yearly";
  return null;
}
