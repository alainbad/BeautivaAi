import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/mobile-shell";
import { Pill } from "@/components/ui-primitives";
import { products, luxuryPicks } from "@/lib/mock-data";
import { Bookmark, Star, SlidersHorizontal, Sparkles } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

const categories = ["All", "Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen", "Treatment"];

function ProductsPage() {
  const [cat, setCat] = useState("All");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const filtered = cat === "All" ? products : products.filter((p) => p.category === cat);

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
      <section className="mt-1">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-rose-gold" />
            <h2 className="font-display text-sm font-semibold tracking-wide">Luxury picks</h2>
          </div>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Prestige</span>
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
                    src={p.image}
                    alt={`${p.brand} ${p.name}`}
                    loading="lazy"
                    className="h-full w-full object-contain p-2 mix-blend-multiply"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-rose-gold font-semibold">{p.brand}</p>
                  <span className="text-[10px] text-muted-foreground">{p.match}%</span>
                </div>
                <h3 className="font-display text-[13px] font-semibold leading-tight line-clamp-2">{p.name}</h3>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium">{p.price}</span>
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

      <section className="mt-6 px-6">
        <h2 className="mb-3 font-display text-sm font-semibold tracking-wide">Everyday essentials</h2>
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
          const isSaved = !!saved[p.id];
          return (
            <article
              key={p.id}
              className="flex gap-3 rounded-3xl border border-border/60 bg-card p-3 shadow-sm"
            >
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-blush">
                <img
                  src={p.image}
                  alt={`${p.brand} ${p.name}`}
                  loading="lazy"
                  className="h-full w-full object-contain p-2 mix-blend-multiply"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.category}</p>
                    <h3 className="font-display text-[15px] font-semibold leading-tight">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <button
                    onClick={() => setSaved((s) => ({ ...s, [p.id]: !s[p.id] }))}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      isSaved ? "border-rose-gold bg-blush/50 text-rose-gold" : "border-border bg-card text-foreground/60"
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Pill tone="accent">{p.match}% match</Pill>
                  {p.concerns.slice(0, 1).map((c) => (
                    <Pill key={c}>{c}</Pill>
                  ))}
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-foreground/75">{p.why}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-foreground/75">
                    <Star className="h-3.5 w-3.5 fill-rose-gold text-rose-gold" />
                    <span className="font-medium">{p.rating}</span>
                    <span className="text-muted-foreground">· {p.price}</span>
                  </div>
                  <button className="rounded-full bg-gradient-rose px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                    View
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </MobileShell>
  );
}
