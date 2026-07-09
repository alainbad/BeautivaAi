import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Sparkles, Wand2 } from "lucide-react";
import { useAuth, useSubscription, isPro } from "@/hooks/use-auth";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Premium — BeautyAI" },
      { name: "description", content: "Unlock AI Retouch and enhanced editing with BeautyAI Premium — $1.99/month." },
      { property: "og:title", content: "BeautyAI Premium" },
      { property: "og:description", content: "Unlock AI Retouch and enhanced editing with BeautyAI Premium — $1.99/month." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
});

const freePerks = [
  "Basic filters & presets",
  "Brightness, contrast, saturation",
  "Warmth & vignette",
  "Skin smoothing",
  "Export to camera roll",
];

const premiumPerks = [
  "AI Retouch — blemish, glow, brighten",
  "Teeth whitening & eye brighten",
  "Face reshape & smart smoothing",
  "Background enhance",
  "Unlimited AI edits",
  "Priority processing",
];

function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: sub } = useSubscription(user);
  const pro = isPro(sub);

  const price = billing === "monthly" ? "$1.99" : "$19.99";
  const unit = billing === "monthly" ? "/month" : "/year";

  const onUpgrade = async () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    setPending(true);
    // Native IAP: on iOS this will trigger the App Store purchase sheet via
    // Capacitor Purchases (RevenueCat). In the web preview we show a notice.
    try {
      alert(
        "In-app purchase runs on the iOS build via the App Store.\n\nOnce the app is wrapped with Capacitor + RevenueCat, this button opens Apple's purchase sheet and unlocks Premium on success.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link to="/home" aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">Premium</h1>
      </header>

      <section className="px-6 pt-2 pb-12">
        <div className="rounded-3xl bg-gradient-rose p-5 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-widest">BeautyAI Premium</span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold">Unlock AI Retouch</h2>
          <p className="mt-1 text-sm text-primary-foreground/85">
            Enhanced editing powered by AI — beyond basic filters and sliders.
          </p>
        </div>

        {pro ? (
          <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-center text-sm">
            You're on Premium. All AI Retouch features are unlocked. ✨
          </div>
        ) : null}

        <div className="mt-5 flex items-center rounded-2xl border border-border bg-card p-1 text-sm">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`flex-1 rounded-xl py-2 font-medium transition ${
                billing === b ? "bg-gradient-rose text-primary-foreground shadow" : "text-foreground/70"
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
            <p className="mt-1 text-xs text-muted-foreground">Basic editing forever.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {freePerks.map((p) => (
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
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-rose-gold" />
              <h3 className="font-display text-xl font-semibold">Premium</h3>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{price}</span>
              <span className="text-sm text-foreground/70">{unit}</span>
            </div>
            <p className="mt-1 text-xs text-foreground/70">
              {billing === "yearly" ? "That's ~$1.67/month, billed yearly." : "Cancel anytime in App Store settings."}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {premiumPerks.map((p) => (
                <li key={p} className="flex items-center gap-2 text-foreground/85">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/70 text-rose-gold">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <button
              onClick={onUpgrade}
              disabled={pending || pro}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-foreground text-background text-sm font-semibold disabled:opacity-60"
            >
              {pro ? "You're on Premium" : pending ? "Opening App Store…" : `Upgrade — ${price}${unit}`}
            </button>
            <p className="mt-2 text-center text-[10px] text-foreground/60">
              Payment via Apple in-app purchase. Manage in App Store settings.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Subscription auto-renews until canceled. Prices in USD; local currency shown at checkout.
        </p>
      </section>
    </div>
  );
}
