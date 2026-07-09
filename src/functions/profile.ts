import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/server/lib/auth";
import { AppError, toApiResponse } from "@/server/lib/response";

export const getProfile = createServerFn({ method: "GET" }).handler(async () =>
  toApiResponse(async () => {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase.from("profiles").select().eq("id", user.id).single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }),
);

const profileInputSchema = z.object({
  fullName: z.string().min(1).optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  skinType: z.string().optional(),
  skinConcerns: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  preferredBudget: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)")
    .optional(),
});

/** profileService.upsertProfile — used by onboarding and the settings screen. */
export const upsertProfile = createServerFn({ method: "POST" })
  .validator(profileInputSchema)
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();
      const { data: profile, error } = await supabase
        .from("profiles")
        .update({
          ...(data.fullName !== undefined && { full_name: data.fullName }),
          ...(data.ageRange !== undefined && { age_range: data.ageRange }),
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.skinType !== undefined && { skin_type: data.skinType }),
          ...(data.skinConcerns !== undefined && { skin_concerns: data.skinConcerns }),
          ...(data.allergies !== undefined && { allergies: data.allergies }),
          ...(data.preferredBudget !== undefined && { preferred_budget: data.preferredBudget }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.dateOfBirth !== undefined && { date_of_birth: data.dateOfBirth }),
        })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw new AppError(error.message, 500);
      return profile;
    }),
  );
