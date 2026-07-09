// Mock data used across BeautyAI screens until backend is wired up.

export const skinScore = 82;
export const lastAnalysisDate = "May 14, 2026";

export const skinMetrics = [
  { label: "Acne", level: "Low", value: 22, tone: "good" },
  { label: "Redness", level: "Mild", value: 38, tone: "warn" },
  { label: "Dark spots", level: "Low", value: 18, tone: "good" },
  { label: "Fine lines", level: "Very low", value: 10, tone: "good" },
  { label: "Pores", level: "Mild", value: 42, tone: "warn" },
  { label: "Oiliness", level: "Moderate", value: 55, tone: "warn" },
  { label: "Dryness", level: "Low", value: 20, tone: "good" },
] as const;

export const aiSummary =
  "Your skin looks balanced overall with a healthy glow. Focus on hydration and consistent SPF to reduce redness and refine texture over the next 4 weeks.";

export const morningRoutine = [
  { step: 1, category: "Cleanser", product: "Gentle Gel Cleanser", why: "Removes overnight oil without stripping.", how: "Massage 20 seconds, rinse with lukewarm water.", frequency: "Daily" },
  { step: 2, category: "Toner", product: "Hydrating Rose Toner", why: "Replenishes moisture and preps skin.", how: "Press into skin with palms.", frequency: "Daily" },
  { step: 3, category: "Serum", product: "10% Vitamin C Serum", why: "Brightens and evens skin tone.", how: "3–4 drops on damp skin.", frequency: "Every morning" },
  { step: 4, category: "Moisturizer", product: "Lightweight Ceramide Cream", why: "Locks in hydration.", how: "Pea-size amount, upward strokes.", frequency: "Daily" },
  { step: 5, category: "Sunscreen", product: "SPF 50 PA++++", why: "Prevents dark spots and aging.", how: "Two-finger rule, reapply midday.", frequency: "Daily" },
];

export const eveningRoutine = [
  { step: 1, category: "Cleanser", product: "Oil-to-Milk Cleanser", why: "Melts SPF and makeup gently.", how: "Massage on dry skin then emulsify.", frequency: "Daily" },
  { step: 2, category: "Treatment", product: "Niacinamide 5% Serum", why: "Balances oil and refines pores.", how: "Apply after cleansing.", frequency: "Every evening" },
  { step: 3, category: "Retinoid", product: "0.3% Retinol", why: "Speeds cell turnover.", how: "Pea-size amount on dry skin.", frequency: "3x per week" },
  { step: 4, category: "Moisturizer", product: "Rich Night Cream", why: "Restores the skin barrier overnight.", how: "Warm between palms, press in.", frequency: "Daily" },
];

export const products = [
  { id: "p1", name: "Rose Dew Cleanser", brand: "Lumière", category: "Cleanser", price: "$24", rating: 4.7, match: 96, skinTypes: ["Dry", "Sensitive"], concerns: ["Redness"], why: "Fragrance-free and calming, ideal for your sensitive score." },
  { id: "p2", name: "Glow 10 Vitamin C", brand: "Petale", category: "Serum", price: "$38", rating: 4.6, match: 93, skinTypes: ["Combination", "Normal"], concerns: ["Dark spots", "Dullness"], why: "Stabilized ascorbic acid brightens your uneven tone." },
  { id: "p3", name: "Silk Barrier Cream", brand: "Aurea", category: "Moisturizer", price: "$46", rating: 4.8, match: 91, skinTypes: ["Dry", "Combination"], concerns: ["Dryness", "Fine lines"], why: "Ceramide + squalane for overnight repair." },
  { id: "p4", name: "Featherlight SPF 50", brand: "Solène", category: "Sunscreen", price: "$32", rating: 4.9, match: 98, skinTypes: ["All"], concerns: ["Dark spots", "Fine lines"], why: "Invisible finish, no white cast — daily essential." },
  { id: "p5", name: "Pore Refining Toner", brand: "Maison Belle", category: "Toner", price: "$28", rating: 4.5, match: 88, skinTypes: ["Oily", "Combination"], concerns: ["Large pores", "Oiliness"], why: "Gentle PHA smooths texture without irritation." },
  { id: "p6", name: "Velvet Retinol 0.3", brand: "Lumière", category: "Treatment", price: "$52", rating: 4.7, match: 90, skinTypes: ["Normal", "Combination"], concerns: ["Fine lines", "Uneven tone"], why: "Encapsulated retinol — low irritation, steady results." },
];

export const progressTimeline = [
  { date: "Feb 2026", score: 68, note: "Started routine, redness noticeable." },
  { date: "Mar 2026", score: 72, note: "Introduced Vitamin C — brighter tone." },
  { date: "Apr 2026", score: 77, note: "Added SPF daily, fewer dark spots." },
  { date: "May 2026", score: 82, note: "Barrier stronger, glow visible." },
];

export const reminders = [
  { id: "r1", time: "Today · 8:00 PM", title: "Evening routine", detail: "Cleanser · Retinol · Moisturizer" },
  { id: "r2", time: "Tomorrow · 7:30 AM", title: "Morning routine", detail: "Vitamin C · SPF 50" },
  { id: "r3", time: "Sat · 9:00 AM", title: "Weekly progress selfie", detail: "Track your glow" },
];

export const chatSuggestions = [
  "What should I use for oily skin?",
  "Can I use vitamin C with retinol?",
  "Build me a simple night routine.",
  "What should I avoid for sensitive skin?",
];

export const mockChat = [
  { role: "assistant" as const, text: "Hi! I'm your BeautyAI assistant. Ask me anything about your skin, routines, or products." },
];
