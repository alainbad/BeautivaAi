import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/server/lib/auth";
import { AppError, toApiResponse } from "@/server/lib/response";

export const getAdminStats = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase } = await requireAdmin();
    const [users, analyses, premiumSubs, products] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("skin_analyses").select("id", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "premium"),
      supabase.from("products").select("id", { count: "exact", head: true }),
    ]);
    return {
      totalUsers: users.count ?? 0,
      totalAnalyses: analyses.count ?? 0,
      premiumSubscribers: premiumSubs.count ?? 0,
      totalProducts: products.count ?? 0,
    };
  }),
);

export const listUsersAdmin = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, skin_type, is_admin, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

export const listAnalysisLogsAdmin = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("skin_analyses")
      .select("id, user_id, skin_score, ai_summary, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

export const listSubscriptionsAdmin = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan, status, current_period_end, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  skinTypeMatch: z.array(z.string()).default([]),
  concernsMatch: z.array(z.string()).default([]),
  ingredients: z.array(z.string()).default([]),
  priceRange: z.string().optional(),
  imageUrl: z.string().optional(),
  affiliateUrl: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});

/** adminService.upsertProduct — add or edit a catalog product. */
export const upsertProductAdmin = createServerFn({ method: "POST" })
  .validator(productInputSchema)
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase } = await requireAdmin();
      const { data: product, error } = await supabase
        .from("products")
        .upsert({
          ...(data.id && { id: data.id }),
          name: data.name,
          brand: data.brand,
          category: data.category,
          skin_type_match: data.skinTypeMatch,
          concerns_match: data.concernsMatch,
          ingredients: data.ingredients,
          price_range: data.priceRange,
          image_url: data.imageUrl,
          affiliate_url: data.affiliateUrl,
          rating: data.rating,
        })
        .select()
        .single();
      if (error) throw new AppError(error.message, 500);
      return product;
    }),
  );

/** adminService — disable/re-enable a product instead of hard-deleting it. */
export const setProductActiveAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase } = await requireAdmin();
      const { error } = await supabase
        .from("products")
        .update({ is_active: data.isActive })
        .eq("id", data.id);
      if (error) throw new AppError(error.message, 500);
      return { ok: true };
    }),
  );
