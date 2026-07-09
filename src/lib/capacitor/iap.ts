import { Capacitor } from "@capacitor/core";
import { Platform, ProductType, store, type Transaction } from "capacitor-plugin-cdv-purchase";
import {
  PREMIUM_PRODUCT_IDS,
  billingForProductId,
  type PremiumBilling,
} from "@/lib/apple-iap-products";
import { verifyApplePurchase } from "@/functions/subscriptions";

/** StoreKit 2 exposes the raw signed transaction here, but the plugin's public `Transaction` type doesn't declare it. */
type AppleTransaction = Transaction & {
  jwsRepresentation?: string;
};

type PurchaseListener = {
  onVerified: (billing: PremiumBilling) => void;
  onError: (message: string) => void;
};

let purchaseListener: PurchaseListener | null = null;
let initialized = false;

/** Lets the pricing screen react to the outcome of a purchase started elsewhere in this module. */
export function setIapPurchaseListener(listener: PurchaseListener | null) {
  purchaseListener = listener;
}

export function isIapAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/** Registers the Premium products and starts listening for purchase approvals. Call once at app startup. */
export async function initIap(): Promise<void> {
  if (initialized || !isIapAvailable()) return;
  initialized = true;

  store.register(
    Object.values(PREMIUM_PRODUCT_IDS).map((id) => ({
      id,
      platform: Platform.APPLE_APPSTORE,
      type: ProductType.PAID_SUBSCRIPTION,
      group: "premium",
    })),
  );

  store.when().approved(async (transaction) => {
    try {
      const jws = (transaction as AppleTransaction).jwsRepresentation;
      if (!jws) {
        throw new Error("No signed transaction from StoreKit — cannot verify this purchase.");
      }

      const res = await verifyApplePurchase({ data: { signedTransaction: jws } });
      if (!res.success) throw new Error(res.error);

      await transaction.finish();
      purchaseListener?.onVerified(res.data.billing as PremiumBilling);
    } catch (err) {
      // Deliberately not finishing the transaction on failure — StoreKit will
      // re-deliver it (e.g. on next app launch) so it can be retried instead
      // of silently losing the purchase.
      purchaseListener?.onError(
        err instanceof Error ? err.message : "Purchase verification failed.",
      );
    }
  });

  await store.initialize([Platform.APPLE_APPSTORE]);
}

/** Starts the native purchase flow for a Premium plan. Resolves once the OS purchase sheet flow is initiated. */
export async function purchasePremium(billing: PremiumBilling): Promise<void> {
  if (!isIapAvailable()) {
    throw new Error("In-app purchases are only available in the BeautyAI iOS app.");
  }
  const productId = PREMIUM_PRODUCT_IDS[billing];
  const product = store.get(productId, Platform.APPLE_APPSTORE);
  const offer = product?.getOffer();
  if (!offer) {
    throw new Error("This plan isn't available right now. Please try again in a moment.");
  }
  const error = await offer.order();
  if (error) {
    throw new Error(error.message || "Purchase failed. Please try again.");
  }
}

/** Restores previously purchased subscriptions (e.g. after a reinstall or on a new device). */
export async function restorePurchases(): Promise<void> {
  if (!isIapAvailable()) return;
  const error = await store.restorePurchases();
  if (error) throw new Error(error.message || "Couldn't restore purchases.");
}

export type { PremiumBilling };
export { billingForProductId };
