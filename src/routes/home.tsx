import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard, ScoreRing, Pill } from "@/components/ui-primitives";
import { unwrap } from "@/lib/query-helpers";
import { getProfile } from "@/functions/profile";
import { getLatestSkinAnalysis, listSkinAnalyses } from "@/functions/skin-analysis";
import { listRoutines } from "@/functions/routine";
import { recommendProducts } from "@/functions/products";
import { listReminders } from "@/functions/reminders";
import { Bell, ChevronRight, Sparkles, Sun, Moon, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Home — BeautyAI" },
      {
        name: "description",
        content: "Your personalized BeautyAI dashboard: skin score, routine, and daily glow.",
      },
      { property: "og:title", content: "Home — BeautyAI" },
      {
        property: "og:description",
        content: "Your personalized BeautyAI dashboard: skin score, routine, and daily glow.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Home() {
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => unwrap(getProfile()) });
  const analysisQuery = useQuery({
    queryKey: ["latest-analysis"],
    queryFn: () => unwrap(getLatestSkinAnalysis()),
  });
  const analysesQuery = useQuery({
    queryKey: ["analyses"],
    queryFn: () => unwrap(listSkinAnalyses()),
  });
  const routinesQuery = useQuery({ queryKey: ["routines"], queryFn: () => unwrap(listRoutines()) });
  const productsQuery = useQuery({
    queryKey: ["recommended-products"],
    queryFn: () => unwrap(recommendProducts()),
  });
  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => unwrap(listReminders()),
  });

  const firstName = profileQuery.data?.full_name?.split(" ")[0] ?? "there";
  const profileInitial = profileQuery.data?.full_name?.trim()?.[0]?.toUpperCase() ?? "?";
  const skinScore = analysisQuery.data?.skin_score ?? 0;
  const lastAnalysisDate = analysisQuery.data
    ? new Date(analysisQuery.data.created_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No analysis yet";

  const morningSteps = routinesQuery.data?.morning?.routine_steps ?? [];
  const eveningSteps = routinesQuery.data?.evening?.routine_steps ?? [];
  const completedToday = routinesQuery.data?.completedStepsToday ?? [];
  const morningDone = completedToday.filter((c) => c.routineType === "morning").length;
  const eveningDone = completedToday.filter((c) => c.routineType === "evening").length;

  const products = productsQuery.data ?? [];
  const reminders = remindersQuery.data ?? [];
  const progressTimeline = (analysesQuery.data ?? [])
    .slice(0, 4)
    .reverse()
    .map((a) => ({
      date: new Date(a.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      }),
      score: a.skin_score ?? 0,
    }));

  return (
    <MobileShell>
      <ScreenHeader
        title={`Good morning, ${firstName}`}
        subtitle="Here's how your skin is doing today."
        right={
          <Link
            to="/profile"
            aria-label="Go to your profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-blush font-display text-sm font-semibold text-rose-gold"
          >
            {profileInitial}
          </Link>
        }
      />

      <section className="px-6">
        <GlassCard className="flex items-center gap-5">
          <ScoreRing score={skinScore} />
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Skin score
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {analysisQuery.data ? "Radiant" : "Get started"}
            </p>
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
          <Link to="/routine" className="text-xs font-medium text-rose-gold">
            See all
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <RoutineTile
            icon={<Sun className="h-4 w-4" />}
            title="Morning"
            count={morningSteps.length}
            done={morningDone}
          />
          <RoutineTile
            icon={<Moon className="h-4 w-4" />}
            title="Evening"
            count={eveningSteps.length}
            done={eveningDone}
          />
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
          <Link to="/products" className="text-xs font-medium text-rose-gold">
            Browse
          </Link>
        </div>
        <div className="mt-3 -mx-6 overflow-x-auto pl-6">
          <div className="flex gap-3 pr-6">
            {products.slice(0, 4).map((p) => (
              <Link
                to="/products"
                key={p.id}
                className="w-40 shrink-0 rounded-3xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-blush">
                  <img
                    src={p.image_url ?? undefined}
                    alt={`${p.brand} ${p.name}`}
                    loading="lazy"
                    className="h-full w-full object-contain p-3 mix-blend-multiply"
                  />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p.category}
                </p>
                <p className="mt-0.5 font-display text-[15px] font-semibold leading-tight">
                  {p.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.brand}</span>
                  <Pill tone="accent">{p.matchScore}%</Pill>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Progress</h2>
          <Link to="/progress" className="text-xs font-medium text-rose-gold">
            See timeline
          </Link>
        </div>
        <GlassCard className="mt-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush/60 text-rose-gold">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {progressTimeline.length >= 2
                  ? `${progressTimeline[progressTimeline.length - 1].score - progressTimeline[0].score >= 0 ? "+" : ""}${
                      progressTimeline[progressTimeline.length - 1].score -
                      progressTimeline[0].score
                    } points`
                  : "Run your first analysis"}
              </p>
              <p className="text-xs text-muted-foreground">Consistency is paying off.</p>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            {progressTimeline.map((p) => (
              <div key={p.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-lg bg-gradient-rose"
                  style={{ height: `${p.score}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{p.date.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Reminders</h2>
          <Link to="/settings" className="text-xs font-medium text-rose-gold">
            Manage
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {reminders.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lavender/60 text-foreground">
                <Bell className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">{r.reminder_time}</span>
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

function RoutineTile({
  icon,
  title,
  count,
  done,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  done: number;
}) {
  const pct = count > 0 ? Math.round((done / count) * 100) : 0;
  return (
    <Link to="/routine" className="block rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blush/50 text-rose-gold">
          {icon}
        </span>
        <span className="font-display text-[15px] font-semibold">{title}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {done} of {count} done
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-rose" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
