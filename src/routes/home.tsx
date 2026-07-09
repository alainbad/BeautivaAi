import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard, ScoreRing, Pill } from "@/components/ui-primitives";
import { skinScore, lastAnalysisDate, morningRoutine, eveningRoutine, products, reminders, progressTimeline } from "@/lib/mock-data";
import { Bell, ChevronRight, Sparkles, Sun, Moon, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: Home,
});

function Home() {
  return (
    <MobileShell>
      <ScreenHeader
        title="Good morning, Sofia"
        subtitle="Here's how your skin is doing today."
        right={
          <Link to="/settings" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <Bell className="h-4 w-4" />
          </Link>
        }
      />

      <section className="px-6">
        <GlassCard className="flex items-center gap-5">
          <ScoreRing score={skinScore} />
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Skin score</p>
            <p className="mt-1 font-display text-2xl font-semibold">Radiant</p>
            <p className="mt-1 text-xs text-muted-foreground">Last analysis · {lastAnalysisDate}</p>
            <Link
              to="/analyze"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rose-gold"
            >
              New analysis <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </GlassCard>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Today's routine</h2>
          <Link to="/routine" className="text-xs font-medium text-rose-gold">See all</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <RoutineTile icon={<Sun className="h-4 w-4" />} title="Morning" count={morningRoutine.length} done={2} />
          <RoutineTile icon={<Moon className="h-4 w-4" />} title="Evening" count={eveningRoutine.length} done={0} />
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
          <Link to="/products" className="text-xs font-medium text-rose-gold">Browse</Link>
        </div>
        <div className="mt-3 -mx-6 overflow-x-auto pl-6">
          <div className="flex gap-3 pr-6">
            {products.slice(0, 4).map((p) => (
              <Link
                to="/products"
                key={p.id}
                className="w-40 shrink-0 rounded-3xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="aspect-[4/5] w-full rounded-2xl bg-gradient-blush" />
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">{p.category}</p>
                <p className="mt-0.5 font-display text-[15px] font-semibold leading-tight">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.brand}</span>
                  <Pill tone="accent">{p.match}%</Pill>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Progress</h2>
          <Link to="/progress" className="text-xs font-medium text-rose-gold">See timeline</Link>
        </div>
        <GlassCard className="mt-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush/60 text-rose-gold">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">+14 points in 3 months</p>
              <p className="text-xs text-muted-foreground">Consistency is paying off.</p>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            {progressTimeline.map((p) => (
              <div key={p.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-lg bg-gradient-rose" style={{ height: `${p.score}px` }} />
                <span className="text-[10px] text-muted-foreground">{p.date.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Reminders</h2>
          <Link to="/settings" className="text-xs font-medium text-rose-gold">Manage</Link>
        </div>
        <ul className="mt-3 space-y-2">
          {reminders.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lavender/60 text-foreground">
                <Bell className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.detail}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">{r.time}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 mt-6">
        <Link
          to="/chat"
          className="flex items-center gap-3 rounded-3xl bg-gradient-rose p-4 text-primary-foreground shadow-lg"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-display text-[15px] font-semibold">Ask your AI beauty coach</p>
            <p className="text-xs opacity-90">Ingredients, routines, product swaps.</p>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </MobileShell>
  );
}

function RoutineTile({ icon, title, count, done }: { icon: React.ReactNode; title: string; count: number; done: number }) {
  const pct = Math.round((done / count) * 100);
  return (
    <Link to="/routine" className="block rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blush/50 text-rose-gold">{icon}</span>
        <span className="font-display text-[15px] font-semibold">{title}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{done} of {count} done</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-rose" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
