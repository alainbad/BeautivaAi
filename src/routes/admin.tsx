import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Users,
  LineChart,
  CreditCard,
  FileText,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui-primitives";
import { getAdminStats } from "@/functions/admin";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({
    meta: [
      { title: "Admin — BeautyAI" },
      { name: "description", content: "Admin dashboard for BeautyAI operators." },
      { property: "og:title", content: "Admin — BeautyAI" },
      { property: "og:description", content: "Admin dashboard for BeautyAI operators." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const sections = [
  { icon: Package, title: "Products management", desc: "Add, edit and match products." },
  { icon: Users, title: "Users overview", desc: "Search users and see their profiles." },
  { icon: LineChart, title: "Skin analysis logs", desc: "Monitor AI accuracy and volume." },
  { icon: CreditCard, title: "Subscription overview", desc: "Stripe subscriptions and MRR." },
  { icon: FileText, title: "Content management", desc: "Articles, FAQs and onboarding copy." },
];

function Admin() {
  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: () => getAdminStats() });
  const denied = statsQuery.data && !statsQuery.data.success;
  const stats = statsQuery.data?.success ? statsQuery.data.data : null;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background safe-x pb-10">
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link
          to="/profile"
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold">Admin</h1>
          <p className="text-xs text-muted-foreground">Live BeautyAI operator dashboard.</p>
        </div>
      </header>

      {denied ? (
        <section className="px-6">
          <GlassCard className="p-6 text-center text-sm text-muted-foreground">
            {statsQuery.data && !statsQuery.data.success
              ? statsQuery.data.error
              : "Admin access required."}
          </GlassCard>
        </section>
      ) : (
        <>
          <section className="px-6 grid grid-cols-2 gap-3">
            {[
              { label: "Total users", value: stats?.totalUsers ?? "—" },
              { label: "Analyses", value: stats?.totalAnalyses ?? "—" },
              { label: "Premium subs", value: stats?.premiumSubscribers ?? "—" },
              { label: "Products", value: stats?.totalProducts ?? "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl border border-border/60 bg-card p-4">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
              </div>
            ))}
          </section>

          <section className="mt-5 px-6 space-y-2">
            {sections.map((s) => (
              <GlassCard key={s.title} className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush/50 text-rose-gold">
                  <s.icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-[15px] font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </GlassCard>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
