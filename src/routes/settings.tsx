import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui-primitives";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings — BeautyAI" },
      { name: "description", content: "Manage notifications, appearance, and account preferences." },
      { property: "og:title", content: "Settings — BeautyAI" },
      { property: "og:description", content: "Manage notifications, appearance, and account preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Settings() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background safe-x">
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
      </header>

      <section className="px-6 space-y-5">
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Account
          </h2>
          <GlassCard className="p-0">
            <Row label="Full name" value="Sofia Laurent" />
            <Row label="Email" value="sofia@beautyai.app" />
            <Row label="Country" value="France" last />
          </GlassCard>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Notifications
          </h2>
          <GlassCard className="p-0">
            <Toggle label="Morning routine reminder" defaultOn />
            <Toggle label="Evening routine reminder" defaultOn />
            <Toggle label="Weekly progress check-in" defaultOn />
            <Toggle label="Product tips & new features" last />
          </GlassCard>
        </div>

        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Subscription
          </h2>
          <GlassCard>
            <p className="text-sm">Premium · yearly</p>
            <p className="mt-1 text-xs text-muted-foreground">Renews on Feb 12, 2027</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Link to="/pricing" className="flex h-11 items-center justify-center rounded-2xl border border-border bg-card text-sm font-medium">
                Manage plan
              </Link>
              <button className="flex h-11 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-sm font-medium">
                Restore purchases
              </button>
            </div>
          </GlassCard>
        </div>

        <p className="pb-10 text-center text-[11px] text-muted-foreground">BeautyAI v1.0.0 · iOS</p>
      </section>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function Toggle({ label, defaultOn = false, last }: { label: string; defaultOn?: boolean; last?: boolean }) {
  return (
    <label className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}>
      <span className="text-sm">{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
        <span className="block h-6 w-10 rounded-full bg-muted transition peer-checked:bg-gradient-rose" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
