import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { unwrap } from "@/lib/query-helpers";
import { getSubscription } from "@/functions/subscriptions";
import {
  isIapAvailable,
  purchasePremium,
  restorePurchases,
  setIapPurchaseListener,
} from "@/lib/capacitor/iap";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — BeautyAI" },
      {
        name: "description",
        content:
          "Start free or unlock Premium: unlimited analyses, AI Beauty Chat, and progress tracking.",
      },
      { property: "og:title", content: "Pricing — BeautyAI" },
      {
        property: "og:description",
        content:
          "Start free or unlock Premium: unlimited analyses, AI Beauty Chat, and progress tracking.",
      },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
});

const perks = {
  free: [
    "Basic profile & onboarding",
    "1 skin analysis / month",
    "Basic routine",
    "Product recommendations",
  ],
  premium: [
    "Unlimited skin analyses",
    "Progress tracking with photos",
    "Advanced AM/PM routine",
    "AI Beauty Chat",
    "Premium product matching",
    "Beauty reminders & notifications",
  ],
};

function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => unwrap(getSubscription()),
  });
  const isPremium = subscriptionQuery.data?.plan === "premium";
  const available = isIapAvailable();

  useEffect(() => {
    setIapPurchaseListener({
      onVerified: () => {
        setPurchasing(false);
        setPurchaseError(null);
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
      },
      onError: (message) => {
        setPurchasing(false);
        setPurchaseError(message);
      },
    });
    return () => setIapPurchaseListener(null);
  }, [queryClient]);

  const handleUpgrade = async () => {
    setPurchaseError(null);
    setPurchasing(true);
    try {
      await purchasePremium(billing);
      // Resolution (success or failure) arrives async via the listener above
      // once StoreKit reports the transaction as approved.
    } catch (err) {
      setPurchasing(false);
      setPurchaseError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    }
  };

  const restoreMutation = useMutation({
    mutationFn: restorePurchases,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscription"] }),
  });

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link
          to="/home"
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">Pricing</h1>
      </header>

      <section className="px-6 pt-2">
        <p className="text-sm text-muted-foreground">
          Start free. Upgrade whenever you're ready to glow further.
        </p>

        {!available && (
          <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            Premium is available in the BeautyAI iOS app via the App Store. Open the app on your
            iPhone to upgrade.
          </div>
        )}

        <div className="mt-5 flex items-center rounded-2xl border border-border bg-card p-1 text-sm">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`flex-1 rounded-xl py-2 font-medium transition ${
                billing === b
                  ? "bg-gradient-rose text-primary-foreground shadow"
                  : "text-foreground/70"
              }`}
            >
              {b === "monthly" ? "Monthly" : "Yearly · save 16%"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl font-semibold">Free</h3>
              <span className="font-display text-2xl">$0</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">To get you started.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {perks.free.map((p) => (
                <li key={p} className="flex items-center gap-2 text-foreground/85">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-foreground/70">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-blush p-5 shadow-lg">
            <span className="absolute right-5 top-5 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-gold">
              Most loved
            </span>
            <h3 className="font-display text-xl font-semibold">Premium</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">
                {billing === "monthly" ? "$2.99" : "$29.99"}
              </span>
              <span className="text-sm text-foreground/70">
                /{billing === "monthly" ? "month" : "year"}
              </span>
            </div>
            <p className="mt-1 text-xs text-foreground/70">
              {billing === "yearly" ? "That's just $2.50/month, billed yearly." : "Cancel anytime."}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {perks.premium.map((p) => (
                <li key={p} className="flex items-center gap-2 text-foreground/85">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/70 text-rose-gold">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            {purchaseError && (
              <p className="mt-3 text-xs font-medium text-destructive">{purchaseError}</p>
            )}
            <button
              onClick={handleUpgrade}
              disabled={isPremium || purchasing || !available}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-foreground text-background text-sm font-semibold disabled:opacity-60"
            >
              {isPremium ? "You're on Premium" : purchasing ? "Processing…" : "Upgrade to Premium"}
            </button>
          </div>
        </div>

        {available && !isPremium && (
          <button
            onClick={() => restoreMutation.mutate()}
            disabled={restoreMutation.isPending}
            className="mt-4 w-full text-center text-xs font-medium text-muted-foreground underline disabled:opacity-60"
          >
            {restoreMutation.isPending ? "Restoring…" : "Restore purchases"}
          </button>
        )}
        {restoreMutation.error && (
          <p className="mt-2 text-center text-xs font-medium text-destructive">
            {restoreMutation.error.message}
          </p>
        )}

        <p className="mt-6 pb-10 text-center text-[11px] text-muted-foreground">
          Subscription auto-renews through the App Store. Manage or cancel anytime in your iPhone
          Settings → your name → Subscriptions.
        </p>
      </section>
    </div>
  );
}
