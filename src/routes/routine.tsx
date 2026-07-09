import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { unwrap } from "@/lib/query-helpers";
import { listRoutines, toggleRoutineStep } from "@/functions/routine";
import { Sun, Moon, Check } from "lucide-react";

export const Route = createFileRoute("/routine")({
  component: RoutinePage,
  head: () => ({
    meta: [
      { title: "Your Routine — BeautyAI" },
      {
        name: "description",
        content: "Personalized morning and evening skincare routine built by BeautyAI.",
      },
      { property: "og:title", content: "Your Routine — BeautyAI" },
      {
        property: "og:description",
        content: "Personalized morning and evening skincare routine built by BeautyAI.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Tab = "am" | "pm";

function RoutinePage() {
  const [tab, setTab] = useState<Tab>("am");
  const queryClient = useQueryClient();
  const routinesQuery = useQuery({ queryKey: ["routines"], queryFn: () => unwrap(listRoutines()) });

  const toggleMutation = useMutation({
    mutationFn: (vars: { routineType: "morning" | "evening"; step: number; completed: boolean }) =>
      unwrap(toggleRoutineStep({ data: vars })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routines"] }),
  });

  const routineType = tab === "am" ? "morning" : "evening";
  const steps =
    (tab === "am" ? routinesQuery.data?.morning : routinesQuery.data?.evening)?.routine_steps ?? [];
  const completedToday = routinesQuery.data?.completedStepsToday ?? [];
  const isStepDone = (step: number) =>
    completedToday.some((c) => c.routineType === routineType && c.step === step);

  return (
    <MobileShell>
      <ScreenHeader title="Your routine" subtitle="Curated to your skin type and goals." />

      <section className="px-6">
        <div className="flex items-center rounded-2xl border border-border bg-card p-1">
          {(["am", "pm"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                tab === t ? "bg-gradient-rose text-primary-foreground shadow" : "text-foreground/70"
              }`}
            >
              {t === "am" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {t === "am" ? "Morning" : "Evening"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-6 space-y-3">
        {steps.length === 0 && (
          <GlassCard className="p-6 text-center text-sm text-muted-foreground">
            Run a skin analysis to get your personalized {tab === "am" ? "morning" : "evening"}{" "}
            routine.
          </GlassCard>
        )}
        {steps.map((s) => {
          const key = `${tab}-${s.step}`;
          const isDone = isStepDone(s.step);
          return (
            <GlassCard key={key} className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() =>
                    toggleMutation.mutate({ routineType, step: s.step, completed: !isDone })
                  }
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                    isDone
                      ? "border-rose-gold bg-gradient-rose text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {isDone && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm text-rose-gold">Step {s.step}</span>
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {s.category}
                    </span>
                  </div>
                  <h3
                    className={`mt-1 font-display text-[16px] font-semibold ${isDone ? "line-through opacity-60" : ""}`}
                  >
                    {s.recommendation}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/75">
                    <span className="font-medium text-foreground/90">Why: </span>
                    {s.reason}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                    <span className="font-medium text-foreground/90">How: </span>
                    {s.instructions}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {s.frequency}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </section>
    </MobileShell>
  );
}
