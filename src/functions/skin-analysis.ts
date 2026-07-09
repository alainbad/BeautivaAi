import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/server/lib/auth";
import { askClaudeForJson } from "@/server/lib/claude-json";
import { AppError, toApiResponse } from "@/server/lib/response";
import {
  skinAnalysisResultSchema,
  SKIN_ANALYSIS_SYSTEM_PROMPT,
} from "@/server/lib/skincare-schemas";
import { uploadDataUrlImage } from "@/server/lib/storage";

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
