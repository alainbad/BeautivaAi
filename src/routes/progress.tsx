import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { GlassCard } from "@/components/ui-primitives";
import { unwrap } from "@/lib/query-helpers";
import { captureImageDataUrl } from "@/lib/capacitor/camera";
import { listSkinAnalyses } from "@/functions/skin-analysis";
import { addProgressPhoto, listProgressPhotos } from "@/functions/progress";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
  head: () => ({
    meta: [
      { title: "Progress — BeautyAI" },
      {
        name: "description",
        content: "Track your skin's transformation over time with weekly photos and scores.",
      },
      { property: "og:title", content: "Progress — BeautyAI" },
      {
        property: "og:description",
        content: "Track your skin's transformation over time with weekly photos and scores.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProgressPage() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const analysesQuery = useQuery({
    queryKey: ["analyses"],
    queryFn: () => unwrap(listSkinAnalyses()),
  });
  const photosQuery = useQuery({
    queryKey: ["progress-photos"],
    queryFn: () => unwrap(listProgressPhotos()),
  });

  const addPhotoMutation = useMutation({
    mutationFn: (dataUrl: string) => unwrap(addProgressPhoto({ data: { dataUrl } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress-photos"] }),
  });

  const handleAddPhoto = async () => {
    setError(null);
    try {
      const dataUrl = await captureImageDataUrl("library");
      await addPhotoMutation.mutateAsync(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add photo.");
    }
  };

  const timeline = (analysesQuery.data ?? [])
    .slice()
    .reverse()
    .map((a) => ({
      date: new Date(a.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      }),
      score: a.skin_score ?? 0,
      note: a.ai_summary ?? "",
    }));
  const photos = photosQuery.data ?? [];
  const firstPhoto = photos[photos.length - 1];
  const latestPhoto = photos[0];

  return (
    <MobileShell>
      <header className="safe-top flex items-center gap-3 px-6 pt-4 pb-3">
        <Link
          to="/home"
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold">Progress</h1>
          <p className="text-xs text-muted-foreground">Your journey, month by month.</p>
        </div>
      </header>

      {error && (
        <div className="mx-6 mb-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <section className="px-6">
        <GlassCard>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Score trend</p>
          <div className="mt-4 flex items-end justify-between gap-2 h-32">
            {timeline.length === 0 && (
              <p className="w-full text-center text-xs text-muted-foreground">
                Run a skin analysis to start your trend.
              </p>
            )}
            {timeline.map((p) => (
              <div key={p.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-foreground/70">{p.score}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-rose"
                  style={{ height: `${p.score}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{p.date.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="mt-5 px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Before / after</h2>
          <button
            onClick={handleAddPhoto}
            disabled={addPhotoMutation.isPending}
            className="flex items-center gap-1 rounded-full bg-gradient-rose px-3 py-1.5 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Camera className="h-3.5 w-3.5" />{" "}
            {addPhotoMutation.isPending ? "Adding…" : "Add photo"}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-blush">
              {firstPhoto && (
                <img
                  src={firstPhoto.image_url}
                  alt="Earliest progress photo"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              {firstPhoto
                ? new Date(firstPhoto.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className="text-sm font-medium">
              {firstPhoto?.skin_score ? `Score ${firstPhoto.skin_score}` : ""}
            </p>
          </div>
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-blush">
              {latestPhoto && (
                <img
                  src={latestPhoto.image_url}
                  alt="Latest progress photo"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              {latestPhoto
                ? new Date(latestPhoto.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className="text-sm font-medium">
              {latestPhoto?.skin_score ? `Score ${latestPhoto.skin_score}` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 px-6">
        <h2 className="font-display text-lg font-semibold">Timeline</h2>
        <ol className="mt-3 relative border-l border-border/70 pl-5 space-y-4">
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground">No analyses yet.</p>
          )}
          {timeline
            .slice()
            .reverse()
            .map((p, i) => (
              <li key={p.date} className="relative">
                <span className="absolute -left-[26px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-rose ring-4 ring-background" />
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p.date}
                </p>
                <p className="mt-0.5 font-display text-[15px] font-semibold">
                  Score {p.score} {i === 0 && "· Current"}
                </p>
                <p className="text-xs text-foreground/75">{p.note}</p>
              </li>
            ))}
        </ol>
      </section>
    </MobileShell>
  );
}
