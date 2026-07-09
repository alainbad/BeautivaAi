import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { ChevronRight, LogOut, CreditCard, Bell, LineChart, MessageCircleHeart, Shield, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — BeautyAI" },
      { name: "description", content: "Your BeautyAI profile: skin type, concerns, goals, and preferences." },
      { property: "og:title", content: "Profile — BeautyAI" },
      { property: "og:description", content: "Your BeautyAI profile: skin type, concerns, goals, and preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProfilePage() {
  return (
    <MobileShell>
      <ScreenHeader title="Profile" subtitle="Manage your beauty preferences." />

      <section className="px-6">
        <GlassCard className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-blush font-display text-2xl font-semibold text-rose-gold">
            S
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-semibold">Sofia Laurent</p>
            <p className="text-xs text-muted-foreground">sofia@beautyai.app</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-rose px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              Premium
            </span>
          </div>
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Beauty profile
        </h2>
        <GlassCard className="p-0">
          <ProfileRow label="Age range" value="25–34" />
          <ProfileRow label="Skin type" value="Combination" />
          <ProfileRow label="Concerns" value="Redness, Dark spots, Pores" />
          <ProfileRow label="Allergies" value="Fragrance" />
          <ProfileRow label="Budget" value="Mid-range" />
          <ProfileRow label="Country" value="France" last />
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Shortcuts
        </h2>
        <GlassCard className="p-0">
          <NavRow to="/progress" icon={<LineChart className="h-4 w-4" />} label="Progress tracker" />
          <NavRow to="/chat" icon={<MessageCircleHeart className="h-4 w-4" />} label="AI beauty chat" />
          <NavRow to="/pricing" icon={<CreditCard className="h-4 w-4" />} label="Manage subscription" />
          <NavRow to="/settings" icon={<SettingsIcon className="h-4 w-4" />} label="Settings & notifications" />
          <NavRow to="/admin" icon={<Shield className="h-4 w-4" />} label="Admin (preview)" last />
        </GlassCard>
      </section>

      <section className="mt-6 px-6">
        <Link
          to="/"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-medium text-foreground/80"
        >
          <LogOut className="h-4 w-4" /> Log out
        </Link>
      </section>
    </MobileShell>
  );
}

function ProfileRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function NavRow({ to, icon, label, last }: { to: string; icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3.5 ${last ? "" : "border-b border-border/60"}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blush/50 text-rose-gold">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
