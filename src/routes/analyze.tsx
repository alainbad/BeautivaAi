import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { GlassCard, DisclaimerBox, Pill, ScoreRing } from "@/components/ui-primitives";
import { captureImageDataUrl } from "@/lib/capacitor/camera";
import { buildSkinMetrics, scoreLabel } from "@/lib/skin-analysis-display";
import { analyzeSkinPhoto } from "@/functions/skin-analysis";
import type { SkinAnalysis } from "@/lib/supabase/types";
import { Camera, Image as ImageIcon, Sparkles, RefreshCw, Check } from "lucide-react";

export const Route = createFileRoute("/analyze")({
  component: Analyze,
  head: () => ({
    meta: [
      { title: "Skin Analysis — BeautyAI" },
      {
        name: "description",
        content: "Upload a selfie to get your AI-powered skin score and cosmetic breakdown.",
      },
      { property: "og:title", content: "Skin Analysis — BeautyAI" },
      {
        property: "og:description",
        content: "Upload a selfie to get your AI-powered skin score and cosmetic breakdown.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Phase = "intro" | "preview" | "loading" | "result";

function Analyze() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [photo, setPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = async (source: "camera" | "library") => {
    setError(null);
    try {
      const dataUrl = await captureImageDataUrl(source);
      setPhoto(dataUrl);
      setPhase("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't access the camera.");
    }
  };

  const runAnalysis = async () => {
    if (!photo) return;
    setPhase("loading");
    setError(null);
    try {
      const res = await analyzeSkinPhoto({ data: { dataUrl: photo } });
      if (!res.success) throw new Error(res.error);
      setAnalysis(res.data.analysis);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setPhase("preview");
    }
  };

  const metrics = analysis ? buildSkinMetrics(analysis) : [];

  return (
    <MobileShell>
      <ScreenHeader title="Skin analysis" subtitle="Cosmetic guidance, powered by AI vision." />

      <section className="px-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

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
                  onClick={() => capture("camera")}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-rose text-primary-foreground text-[15px] font-medium"
                >
                  <Camera className="h-4 w-4" /> Take photo
                </button>
                <button
                  onClick={() => capture("library")}
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
              This analysis is for cosmetic guidance only and is not a medical diagnosis. For
              serious skin concerns, consult a dermatologist.
            </DisclaimerBox>
          </>
        )}

        {phase === "preview" && (
          <>
            <GlassCard>
              <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-blush">
                {photo && (
                  <img
                    src={photo}
                    alt="Your selfie preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Photo looks great — ready to analyze.
              </p>
            </GlassCard>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setPhase("intro")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-medium"
              >
                <RefreshCw className="h-4 w-4" /> Retake
              </button>
              <button
                onClick={runAnalysis}
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

        {phase === "result" && analysis && (
          <>
            <GlassCard className="flex items-center gap-5">
              <ScoreRing score={analysis.skin_score ?? 0} />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Overall
                </p>
                <p className="font-display text-2xl font-semibold">
                  {scoreLabel(analysis.skin_score ?? 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">You're glowing today ✨</p>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display text-[15px] font-semibold">Breakdown</h3>
              <ul className="mt-3 space-y-3">
                {metrics.map((m) => (
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
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {analysis.ai_summary}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Link
                  to="/routine"
                  className="flex h-11 items-center justify-center rounded-2xl border border-border bg-card text-sm font-medium"
                >
                  View routine
                </Link>
                <Link
                  to="/products"
                  className="flex h-11 items-center justify-center rounded-2xl bg-gradient-rose text-primary-foreground text-sm font-medium"
                >
                  See products
                </Link>
              </div>
            </GlassCard>

            <DisclaimerBox>
              {analysis.disclaimer ??
                "Cosmetic guidance only. Not a medical diagnosis. Consult a dermatologist for medical concerns."}
            </DisclaimerBox>
          </>
        )}
      </section>
    </MobileShell>
  );
}
