import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard, DisclaimerBox, Pill, ScoreRing } from "@/components/ui-primitives";
import { skinMetrics, aiSummary } from "@/lib/mock-data";
import { Camera, Image as ImageIcon, Sparkles, RefreshCw, Check } from "lucide-react";

export const Route = createFileRoute("/analyze")({
  component: Analyze,
});

type Phase = "intro" | "preview" | "loading" | "result";

function Analyze() {
  const [phase, setPhase] = useState<Phase>("intro");

  return (
    <MobileShell>
      <ScreenHeader title="Skin analysis" subtitle="Cosmetic guidance, powered by AI vision." />

      <section className="px-6 space-y-4">
        {phase === "intro" && (
          <>
            <GlassCard>
              <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-blush">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 backdrop-blur">
                  <Camera className="h-6 w-6 text-rose-gold" />
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPhase("preview")}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium"
                >
                  <Camera className="h-4 w-4" /> Take photo
                </button>
                <button
                  onClick={() => setPhase("preview")}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[15px] font-medium"
                >
                  <ImageIcon className="h-4 w-4" /> Upload
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display text-[15px] font-semibold">For best results</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                {[
                  "Use natural daylight",
                  "Remove makeup if possible",
                  "Face the camera directly",
                  "Avoid filters and beautifiers",
                  "Keep your face centered",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blush/60 text-rose-gold">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <DisclaimerBox>
              This analysis is for cosmetic guidance only and is not a medical diagnosis.
              For serious skin concerns, consult a dermatologist.
            </DisclaimerBox>
          </>
        )}

        {phase === "preview" && (
          <>
            <GlassCard>
              <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-blush" />
              <p className="mt-3 text-center text-xs text-muted-foreground">Photo looks great — ready to analyze.</p>
            </GlassCard>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setPhase("intro")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-medium"
              >
                <RefreshCw className="h-4 w-4" /> Retake
              </button>
              <button
                onClick={() => {
                  setPhase("loading");
                  setTimeout(() => setPhase("result"), 1800);
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-rose text-primary-foreground font-medium"
              >
                <Sparkles className="h-4 w-4" /> Analyze
              </button>
            </div>
          </>
        )}

        {phase === "loading" && (
          <GlassCard className="flex flex-col items-center gap-4 py-10">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-blush/60" />
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-gradient-rose text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <p className="font-display text-lg font-semibold">Analyzing your skin…</p>
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Reading tone, texture and hydration signals.
            </p>
          </GlassCard>
        )}

        {phase === "result" && (
          <>
            <GlassCard className="flex items-center gap-5">
              <ScoreRing score={82} />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Overall</p>
                <p className="font-display text-2xl font-semibold">Radiant</p>
                <p className="mt-1 text-xs text-muted-foreground">You're glowing today ✨</p>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display text-[15px] font-semibold">Breakdown</h3>
              <ul className="mt-3 space-y-3">
                {skinMetrics.map((m) => (
                  <li key={m.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/85">{m.label}</span>
                      <Pill tone={m.tone === "good" ? "good" : "warn"}>{m.level}</Pill>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-rose" style={{ width: `${m.value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display text-[15px] font-semibold">AI summary</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{aiSummary}</p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button className="h-11 rounded-2xl border border-border bg-card text-sm font-medium">
                  View routine
                </button>
                <button className="h-11 rounded-2xl bg-gradient-rose text-primary-foreground text-sm font-medium">
                  See products
                </button>
              </div>
            </GlassCard>

            <DisclaimerBox>
              Cosmetic guidance only. Not a medical diagnosis. Consult a dermatologist for medical concerns.
            </DisclaimerBox>
          </>
        )}
      </section>
    </MobileShell>
  );
}
