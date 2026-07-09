import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Product } from "@/lib/supabase/types";
import { requireUser } from "@/server/lib/auth";
import { AppError, toApiResponse } from "@/server/lib/response";
import { getSupabaseServerClient } from "@/server/lib/supabase";

export const listProducts = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().optional() }).optional())
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const supabase = getSupabaseServerClient();
      let query = supabase
        .from("products")
        .select()
        .eq("is_active", true)
        .order("rating", { ascending: false });
      if (data?.category && data.category !== "All") {
        query = query.eq("category", data.category);
      }
      const { data: products, error } = await query;
      if (error) throw new AppError(error.message, 500);
      return products;
    }),
  );

export const listSavedProducts = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("saved_products")
      .select("product_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

export const toggleSaveProduct = createServerFn({ method: "POST" })
  .validator(z.object({ productId: z.string().uuid(), save: z.boolean() }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      if (data.save) {
        const { error } = await supabase
          .from("saved_products")
          .upsert(
            { user_id: user.id, product_id: data.productId },
            { onConflict: "user_id,product_id" },
          );
        if (error) throw new AppError(error.message, 500);
      } else {
        const { error } = await supabase
          .from("saved_products")
          .delete()
          .match({ user_id: user.id, product_id: data.productId });
        if (error) throw new AppError(error.message, 500);
      }
      return { ok: true };
    }),
  );

function scoreProduct(
  product: Product,
  opts: { skinType: string | null; concerns: string[]; budget: string | null },
) {
  let score = 60;
  if (
    opts.skinType &&
    (product.skin_type_match.includes(opts.skinType) || product.skin_type_match.includes("All"))
  ) {
    score += 20;
  }
  const matchedConcerns = product.concerns_match.filter((c) => opts.concerns.includes(c));
  score += Math.min(matchedConcerns.length * 8, 16);
  if (product.rating) score += Math.round((product.rating - 4) * 5);
  return { score: Math.max(0, Math.min(100, score)), matchedConcerns };
}

const BUDGET_TO_PRICE_RANGE: Record<string, string[]> = {
  "Budget-friendly": ["$"],
  "Mid-range": ["$", "$$"],
  Premium: ["$$", "$$$"],
  Luxury: ["$$$", "$$$$"],
};

/** productService.recommendProducts — deterministic scoring against the shared catalog. */
export const recommendProducts = createServerFn({ method: "POST" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();

    const [{ data: profile }, { data: analysis }, { data: products, error: productsError }] =
      await Promise.all([
        supabase.from("profiles").select().eq("id", user.id).single(),
        supabase
          .from("skin_analyses")
          .select()
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("products").select().eq("is_active", true),
      ]);
    if (productsError) throw new AppError(productsError.message, 500);
    if (!products?.length) return [];

    const concerns = profile?.skin_concerns ?? [];
    const allowedPriceRanges = profile?.preferred_budget
      ? BUDGET_TO_PRICE_RANGE[profile.preferred_budget]
      : undefined;

    const ranked = products
      .filter(
        (p) => !allowedPriceRanges || !p.price_range || allowedPriceRanges.includes(p.price_range),
      )
      .map((product) => {
        const { score, matchedConcerns } = scoreProduct(product, {
          skinType: profile?.skin_type ?? null,
          concerns,
          budget: profile?.preferred_budget ?? null,
        });
        const reason = matchedConcerns.length
          ? `Targets ${matchedConcerns.join(", ").toLowerCase()} — matched to your profile.`
          : `A solid fit for your ${profile?.skin_type ?? "skin"} type.`;
        return { product, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (analysis) {
      const { error: insertError } = await supabase.from("recommended_products").insert(
        ranked.map((r) => ({
          user_id: user.id,
          analysis_id: analysis.id,
          product_id: r.product.id,
          reason: r.reason,
          match_score: r.score,
        })),
      );
      if (insertError) console.error("Failed to log recommended_products", insertError);
    }

    return ranked.map((r) => ({ ...r.product, matchScore: r.score, matchReason: r.reason }));
  }),
);
