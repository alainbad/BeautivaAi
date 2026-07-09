import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { Pill } from "@/components/ui-primitives";
import { unwrap } from "@/lib/query-helpers";
import {
  listProducts,
  listSavedProducts,
  recommendProducts,
  toggleSaveProduct,
} from "@/functions/products";
import { Bookmark, Star, SlidersHorizontal, Sparkles } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Recommended Products — BeautyAI" },
      {
        name: "description",
        content:
          "Real luxury and dermatologist-favorite skincare curated for your skin type and concerns.",
      },
      { property: "og:title", content: "Recommended Products — BeautyAI" },
      {
        property: "og:description",
        content:
          "Real luxury and dermatologist-favorite skincare curated for your skin type and concerns.",
      },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
});

const categories = ["All", "Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen", "Treatment"];

function ProductsPage() {
  const [cat, setCat] = useState("All");
  const queryClient = useQueryClient();

  const recommendedQuery = useQuery({
    queryKey: ["recommended-products"],
    queryFn: () => unwrap(recommendProducts()),
  });
  const productsQuery = useQuery({
    queryKey: ["products", cat],
    queryFn: () => unwrap(listProducts({ data: { category: cat } })),
  });
  const savedQuery = useQuery({
    queryKey: ["saved-products"],
    queryFn: () => unwrap(listSavedProducts()),
  });

  const saveMutation = useMutation({
    mutationFn: (vars: { productId: string; save: boolean }) =>
      unwrap(toggleSaveProduct({ data: vars })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-products"] }),
  });

  const luxuryPicks = (recommendedQuery.data ?? [])
    .filter((p) => p.price_range === "$$$" || p.price_range === "$$$$")
    .slice(0, 6);
  const savedIds = new Set((savedQuery.data ?? []).map((s) => s.product_id));
  const filtered = productsQuery.data ?? [];

  return (
    <MobileShell>
      <ScreenHeader
        title="For you"
        subtitle="Matched to your skin type and concerns."
        right={
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        }
      />

      {/* Luxury picks carousel */}
      {luxuryPicks.length > 0 && (
        <section className="mt-1">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-rose-gold" />
              <h2 className="font-display text-sm font-semibold tracking-wide">Luxury picks</h2>
            </div>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Prestige
            </span>
          </div>
          <div className="mt-3 -mx-6 overflow-x-auto pl-6">
            <div className="flex gap-3 pr-6">
              {luxuryPicks.map((p) => (
                <article
                  key={p.id}
                  className="relative w-44 shrink-0 overflow-hidden rounded-3xl border border-rose-gold/30 bg-gradient-to-b from-blush/60 to-card p-3 shadow-sm"
                >
                  <div className="flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-white/70">
                    <img
                      src={p.image_url ?? undefined}
                      alt={`${p.brand} ${p.name}`}
                      loading="lazy"
                      className="h-full w-full object-contain p-2 mix-blend-multiply"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-rose-gold font-semibold">
                      {p.brand}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{p.matchScore}%</span>
                  </div>
                  <h3 className="font-display text-[13px] font-semibold leading-tight line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium">{p.price_range}</span>
                    <div className="flex items-center gap-0.5 text-[11px]">
                      <Star className="h-3 w-3 fill-rose-gold text-rose-gold" />
                      <span>{p.rating}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 px-6">
        <h2 className="mb-3 font-display text-sm font-semibold tracking-wide">
          Everyday essentials
        </h2>
        <div className="-mx-6 overflow-x-auto pl-6">
          <div className="flex gap-2 pr-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  cat === c
                    ? "border-rose-gold bg-gradient-rose text-primary-foreground"
                    : "border-border bg-card text-foreground/75"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 px-6 space-y-3">
        {filtered.map((p) => {
          const isSaved = savedIds.has(p.id);
          return (
            <article
              key={p.id}
              className="flex gap-3 rounded-3xl border border-border/60 bg-card p-3 shadow-sm"
            >
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-blush">
                <img
                  src={p.image_url ?? undefined}
                  alt={`${p.brand} ${p.name}`}
                  loading="lazy"
                  className="h-full w-full object-contain p-2 mix-blend-multiply"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {p.category}
                    </p>
                    <h3 className="font-display text-[15px] font-semibold leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <button
                    onClick={() => saveMutation.mutate({ productId: p.id, save: !isSaved })}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      isSaved
                        ? "border-rose-gold bg-blush/50 text-rose-gold"
                        : "border-border bg-card text-foreground/60"
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {p.concerns_match.slice(0, 1).map((c) => (
                    <Pill key={c}>{c}</Pill>
                  ))}
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-foreground/75">
                  {p.concerns_match.length
                    ? `Targets ${p.concerns_match.join(", ").toLowerCase()}.`
                    : ""}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-foreground/75">
                    <Star className="h-3.5 w-3.5 fill-rose-gold text-rose-gold" />
                    <span className="font-medium">{p.rating}</span>
                    <span className="text-muted-foreground">· {p.price_range}</span>
                  </div>
                  {p.affiliate_url && (
                    <a
                      href={p.affiliate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-gradient-rose px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </MobileShell>
  );
}
