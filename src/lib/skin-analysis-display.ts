import type { SkinAnalysis, SkinLevel } from "@/lib/supabase/types";

const LEVEL_VALUE: Record<SkinLevel, number> = {
  none: 5,
  low: 20,
  mild: 40,
  moderate: 65,
  high: 90,
};
const LEVEL_TONE: Record<SkinLevel, "good" | "warn"> = {
  none: "good",
  low: "good",
  mild: "warn",
  moderate: "warn",
  high: "warn",
};

type LevelKey =
  | "acne_level"
  | "redness_level"
  | "dark_spots_level"
  | "wrinkles_level"
  | "pores_level"
  | "oiliness_level"
  | "dryness_level";

const ROWS: Array<{ label: string; key: LevelKey }> = [
  { label: "Acne", key: "acne_level" },
  { label: "Redness", key: "redness_level" },
  { label: "Dark spots", key: "dark_spots_level" },
  { label: "Fine lines", key: "wrinkles_level" },
  { label: "Pores", key: "pores_level" },
  { label: "Oiliness", key: "oiliness_level" },
  { label: "Dryness", key: "dryness_level" },
];

export function buildSkinMetrics(analysis: Pick<SkinAnalysis, LevelKey>) {
  return ROWS.map(({ label, key }) => {
    const level = analysis[key] ?? "low";
    return {
      label,
      level: level.charAt(0).toUpperCase() + level.slice(1),
      value: LEVEL_VALUE[level] ?? 30,
      tone: LEVEL_TONE[level] ?? ("good" as const),
    };
  });
}

export function scoreLabel(score: number) {
  if (score >= 85) return "Radiant";
  if (score >= 70) return "Balanced";
  if (score >= 50) return "Needs care";
  return "Needs attention";
}
