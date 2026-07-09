import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/server/lib/auth";
import { askClaudeForJson } from "@/server/lib/claude-json";
import { AppError, toApiResponse } from "@/server/lib/response";
import { COSMETIC_DISCLAIMER, routineStepSchema } from "@/server/lib/skincare-schemas";

export const listRoutines = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const [
      { data: routines, error: routinesError },
      { data: completions, error: completionsError },
    ] = await Promise.all([
      supabase.from("skincare_routines").select().eq("user_id", user.id),
      supabase
        .from("routine_completions")
        .select()
        .eq("user_id", user.id)
        .eq("completed_date", new Date().toISOString().slice(0, 10)),
    ]);
    if (routinesError) throw new AppError(routinesError.message, 500);
    if (completionsError) throw new AppError(completionsError.message, 500);

    return {
      morning: routines?.find((r) => r.routine_type === "morning") ?? null,
      evening: routines?.find((r) => r.routine_type === "evening") ?? null,
      completedStepsToday: (completions ?? []).map((c) => ({
        routineType: c.routine_type,
        step: c.step,
      })),
    };
  }),
);

const generateRoutineOutputSchema = z.object({
  morning: z.array(routineStepSchema),
  evening: z.array(routineStepSchema),
});

/**
 * generateRoutine from the build spec — regenerates AM/PM routines from the
 * user's profile + latest analysis without requiring a new photo.
 */
export const regenerateRoutine = createServerFn({ method: "POST" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();

    const [{ data: profile }, { data: analysis }] = await Promise.all([
      supabase.from("profiles").select().eq("id", user.id).single(),
      supabase
        .from("skin_analyses")
        .select()
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (!analysis) {
      throw new AppError(
        "Run a skin analysis first so BeautyAI has something to base your routine on.",
        400,
      );
    }

    const result = await askClaudeForJson({
      schema: generateRoutineOutputSchema,
      maxTokens: 1536,
      system: `You build simple, safe AM/PM skincare routines for the BeautyAI app.
Keep routines simple (4-5 steps each). Always include sunscreen in the morning routine.
Avoid unsafe ingredient combinations (e.g. retinoids with strong acids in the same slot).
Return only valid JSON: { "morning": RoutineStep[], "evening": RoutineStep[] } where RoutineStep is
{ "step": number, "category": string, "recommendation": string, "reason": string, "instructions": string, "frequency": string }.
No markdown fences, no extra commentary.`,
      messages: [
        {
          role: "user",
          content: `User profile: ${JSON.stringify({
            skinType: profile?.skin_type,
            concerns: profile?.skin_concerns,
            allergies: profile?.allergies,
            budget: profile?.preferred_budget,
          })}
Latest skin analysis: ${JSON.stringify({
            score: analysis.skin_score,
            acne: analysis.acne_level,
            redness: analysis.redness_level,
            darkSpots: analysis.dark_spots_level,
            wrinkles: analysis.wrinkles_level,
            pores: analysis.pores_level,
            oiliness: analysis.oiliness_level,
            dryness: analysis.dryness_level,
            summary: analysis.ai_summary,
          })}
Cosmetic disclaimer to keep in mind: ${COSMETIC_DISCLAIMER}`,
        },
      ],
    });

    const [morningWrite, eveningWrite] = await Promise.all([
      supabase.from("skincare_routines").upsert(
        {
          user_id: user.id,
          analysis_id: analysis.id,
          routine_type: "morning",
          routine_steps: result.morning,
        },
        { onConflict: "user_id,routine_type" },
      ),
      supabase.from("skincare_routines").upsert(
        {
          user_id: user.id,
          analysis_id: analysis.id,
          routine_type: "evening",
          routine_steps: result.evening,
        },
        { onConflict: "user_id,routine_type" },
      ),
    ]);
    const writeError = morningWrite.error ?? eveningWrite.error;
    if (writeError) throw new AppError(writeError.message, 500);

    return result;
  }),
);

export const toggleRoutineStep = createServerFn({ method: "POST" })
  .validator(
    z.object({
      routineType: z.enum(["morning", "evening"]),
      step: z.number().int().positive(),
      completed: z.boolean(),
    }),
  )
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      const today = new Date().toISOString().slice(0, 10);

      if (data.completed) {
        const { error } = await supabase.from("routine_completions").upsert(
          {
            user_id: user.id,
            routine_type: data.routineType,
            step: data.step,
            completed_date: today,
          },
          { onConflict: "user_id,routine_type,step,completed_date" },
        );
        if (error) throw new AppError(error.message, 500);
      } else {
        const { error } = await supabase.from("routine_completions").delete().match({
          user_id: user.id,
          routine_type: data.routineType,
          step: data.step,
          completed_date: today,
        });
        if (error) throw new AppError(error.message, 500);
      }
      return { ok: true };
    }),
  );
