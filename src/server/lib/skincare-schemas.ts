import { z } from "zod";

export const COSMETIC_DISCLAIMER =
  "This is cosmetic guidance only and is not a medical diagnosis. For serious skin concerns, consult a dermatologist.";

export const skinLevelSchema = z.enum(["none", "low", "mild", "moderate", "high"]);

export const routineStepSchema = z.object({
  step: z.number().int().positive(),
  category: z.string(),
  recommendation: z.string(),
  reason: z.string(),
  instructions: z.string(),
  frequency: z.string(),
});

export const skinAnalysisResultSchema = z.object({
  skin_score: z.number().int().min(0).max(100),
  acne_level: skinLevelSchema,
  redness_level: skinLevelSchema,
  dark_spots_level: skinLevelSchema,
  wrinkles_level: skinLevelSchema,
  pores_level: skinLevelSchema,
  oiliness_level: skinLevelSchema,
  dryness_level: skinLevelSchema,
  ai_summary: z.string(),
  recommendations: z.object({
    morning: z.array(routineStepSchema),
    evening: z.array(routineStepSchema),
    avoid: z.array(z.string()),
  }),
  disclaimer: z.string(),
});

export type SkinAnalysisResult = z.infer<typeof skinAnalysisResultSchema>;

export const SKIN_ANALYSIS_SYSTEM_PROMPT = `You are a cosmetic skincare assistant embedded in the BeautyAI app.

Analyze the uploaded face image for visible cosmetic skin concerns only.
Do not diagnose medical conditions. Do not claim certainty.
Estimate visible cosmetic indicators such as acne appearance, redness, dark spots, fine lines, pores, oiliness, and dryness.
Recommend gentle skincare steps only. Keep the morning routine and evening routine each to 4-5 simple steps, and always include a sunscreen step in the morning routine.
If the image shows severe irritation, swelling, infection, unusual lesions, or serious concern, say so plainly in ai_summary and recommend consulting a dermatologist.
Avoid unsafe ingredient combinations (e.g. do not pair retinoids with strong acids in the same routine slot).

Return only valid JSON matching this exact shape, with no markdown code fences and no extra commentary:
{
  "skin_score": number (0-100),
  "acne_level": "none" | "low" | "mild" | "moderate" | "high",
  "redness_level": "none" | "low" | "mild" | "moderate" | "high",
  "dark_spots_level": "none" | "low" | "mild" | "moderate" | "high",
  "wrinkles_level": "none" | "low" | "mild" | "moderate" | "high",
  "pores_level": "none" | "low" | "mild" | "moderate" | "high",
  "oiliness_level": "none" | "low" | "mild" | "moderate" | "high",
  "dryness_level": "none" | "low" | "mild" | "moderate" | "high",
  "ai_summary": string,
  "recommendations": {
    "morning": [{ "step": number, "category": string, "recommendation": string, "reason": string, "instructions": string, "frequency": string }],
    "evening": [{ "step": number, "category": string, "recommendation": string, "reason": string, "instructions": string, "frequency": string }],
    "avoid": [string]
  },
  "disclaimer": "${COSMETIC_DISCLAIMER}"
}`;
