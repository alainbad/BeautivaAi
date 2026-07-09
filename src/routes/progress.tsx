import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { progressTimeline } from "@/lib/mock-data";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
  head: () => ({
    meta: [
      { title: "Progress — BeautyAI" },
      { name: "description", content: "Track your skin's transformation over time with weekly photos and scores." },
      { property: "og:title", content: "Progress — BeautyAI" },
      { property: "og:description", content: "Track your skin's transformation over time with weekly photos and scores." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProgressPage() {
  return (
    <MobileShell>
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link to="/home" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold">Progress</h1>
          <p className="text-xs text-muted-foreground">Your journey, month by month.</p>
        </div>
      </header>

      <section className="px-6">
        <GlassCard>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Score trend</p>
          <div className="mt-4 flex items-end justify-between gap-2 h-32">
            {progressTimeline.map((p) => (
              <div key={p.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-foreground/70">{p.score}</span>
                <div className="w-full rounded-t-xl bg-gradient-rose" style={{ height: `${p.score}%` }} />
                <span className="text-[10px] text-muted-foreground">{p.date.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Before / after</h2>
          <button className="flex items-center gap-1 rounded-full bg-gradient-rose px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            <Camera className="h-3.5 w-3.5" /> Add photo
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="aspect-[4/5] rounded-2xl bg-gradient-blush" />
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">Feb 2026</p>
            <p className="text-sm font-medium">Score 68</p>
          </div>
          <div>
            <div className="aspect-[4/5] rounded-2xl bg-gradient-blush" />
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">May 2026</p>
            <p className="text-sm font-medium">Score 82</p>
          </div>
        </div>
      </section>

      <section className="mt-6 px-6">
        <h2 className="font-display text-lg font-semibold">Timeline</h2>
        <ol className="mt-3 relative border-l border-border/70 pl-5 space-y-4">
          {progressTimeline.slice().reverse().map((p, i) => (
            <li key={p.date} className="relative">
              <span className="absolute -left-[26px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-rose ring-4 ring-background" />
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.date}</p>
              <p className="mt-0.5 font-display text-[15px] font-semibold">Score {p.score} {i === 0 && "· Current"}</p>
              <p className="text-xs text-foreground/75">{p.note}</p>
            </li>
          ))}
        </ol>
      </section>
    </MobileShell>
  );
}
