import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/supabase/types";
import { requireUser } from "@/server/lib/auth";
import { askClaudeForJson } from "@/server/lib/claude-json";
import { AppError, toApiResponse } from "@/server/lib/response";
import {
  skinAnalysisResultSchema,
  SKIN_ANALYSIS_SYSTEM_PROMPT,
} from "@/server/lib/skincare-schemas";
import { uploadDataUrlImage } from "@/server/lib/storage";

const FREE_PLAN_ANALYSES_PER_MONTH = 1;

/** Enforces the pricing page's "1 skin analysis / month" free-tier limit. */
async function enforceFreeAnalysisLimit(supabase: SupabaseClient<Database>, userId: string) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  const isPremium = subscription?.plan === "premium" && subscription.status === "active";
  if (isPremium) return;

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("skin_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());
  if (error) throw new AppError(error.message, 500);

  if ((count ?? 0) >= FREE_PLAN_ANALYSES_PER_MONTH) {
    throw new AppError(
      "You've used your free skin analysis for this month. Upgrade to Premium for unlimited analyses.",
      402,
    );
  }
}

/**
 * uploadSkinImage + analyzeSkinImage from the build spec, combined into one
 * round trip: upload the selfie, run Claude vision, persist the analysis and
 * the AM/PM routines it recommends.
 */
export const analyzeSkinPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ dataUrl: z.string().min(1) }))
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      await enforceFreeAnalysisLimit(supabase, user.id);

      const upload = await uploadDataUrlImage(supabase, {
        bucket: "skin-analysis-images",
        userId: user.id,
        dataUrl: data.dataUrl,
      });
      const base64Data = data.dataUrl.slice(data.dataUrl.indexOf(",") + 1);

      const result = await askClaudeForJson({
        system: SKIN_ANALYSIS_SYSTEM_PROMPT,
        schema: skinAnalysisResultSchema,
        maxTokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: upload.contentType, data: base64Data },
              },
              {
                type: "text",
                text: "Analyze this selfie for cosmetic skin concerns and return the JSON described in the system prompt.",
              },
            ],
          },
        ],
      });

      const { data: analysis, error: insertError } = await supabase
        .from("skin_analyses")
        .insert({
          user_id: user.id,
          image_url: upload.path,
          skin_score: result.skin_score,
          acne_level: result.acne_level,
          redness_level: result.redness_level,
          dark_spots_level: result.dark_spots_level,
          wrinkles_level: result.wrinkles_level,
          pores_level: result.pores_level,
          oiliness_level: result.oiliness_level,
          dryness_level: result.dryness_level,
          ai_summary: result.ai_summary,
          recommendations: result.recommendations,
          disclaimer: result.disclaimer,
        })
        .select()
        .single();

      if (insertError || !analysis) {
        throw new AppError(`Failed to save analysis: ${insertError?.message}`, 500);
      }

      await Promise.all(
        (["morning", "evening"] as const).map((routineType) =>
          supabase.from("skincare_routines").upsert(
            {
              user_id: user.id,
              analysis_id: analysis.id,
              routine_type: routineType,
              routine_steps: result.recommendations[routineType],
            },
            { onConflict: "user_id,routine_type" },
          ),
        ),
      );

      return { analysis, imageUrl: upload.publicUrl };
    }),
  );

export const listSkinAnalyses = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("skin_analyses")
      .select()
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

export const getLatestSkinAnalysis = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("skin_analyses")
      .select()
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);
