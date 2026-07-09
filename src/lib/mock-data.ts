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

// Real products with images from Open Beauty Facts (openbeautyfacts.org),
// an open, crowdsourced product database (photos licensed CC-BY-SA).
export const products = [
  {
    id: "p1",
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    brandDomain: "cerave.com",
    category: "Cleanser",
    price: "$16",
    rating: 4.7,
    match: 96,
    skinTypes: ["Dry", "Sensitive"],
    concerns: ["Redness", "Dryness"],
    why: "Ceramides + hyaluronic acid cleanse without stripping — ideal for your sensitive score.",
    image: "https://images.openbeautyfacts.org/images/products/333/787/559/7180/front_nl.31.400.jpg",
  },
  {
    id: "p2",
    name: "Hyaluronic Acid 2% + B5",
    brand: "The Ordinary",
    brandDomain: "theordinary.com",
    category: "Serum",
    price: "$9",
    rating: 4.6,
    match: 93,
    skinTypes: ["All"],
    concerns: ["Dryness", "Dullness"],
    why: "Multi-weight hyaluronic acid deeply hydrates for a plumper, brighter finish.",
    image: "https://images.openbeautyfacts.org/images/products/076/991/519/0199/front_en.10.400.jpg",
  },
  {
    id: "p3",
    name: "Daily Moisturizing Lotion",
    brand: "CeraVe",
    brandDomain: "cerave.com",
    category: "Moisturizer",
    price: "$18",
    rating: 4.8,
    match: 91,
    skinTypes: ["Dry", "Combination"],
    concerns: ["Dryness", "Fine lines"],
    why: "MVE-delivered ceramides restore your barrier overnight.",
    image: "https://images.openbeautyfacts.org/images/products/360/600/053/7743/front_en.37.400.jpg",
  },
  {
    id: "p4",
    name: "Unseen Sunscreen SPF 40",
    brand: "Supergoop!",
    brandDomain: "supergoop.com",
    category: "Sunscreen",
    price: "$38",
    rating: 4.9,
    match: 98,
    skinTypes: ["All"],
    concerns: ["Dark spots", "Fine lines"],
    why: "Invisible, weightless SPF with no white cast — your daily essential.",
    image: "https://images.openbeautyfacts.org/images/products/081/621/802/6530/front_en.3.400.jpg",
  },
  {
    id: "p5",
    name: "Witch Hazel Aloe Vera Toner",
    brand: "Thayers",
    brandDomain: "thayers.com",
    category: "Toner",
    price: "$11",
    rating: 4.5,
    match: 88,
    skinTypes: ["Oily", "Combination"],
    concerns: ["Large pores", "Oiliness"],
    why: "Alcohol-free witch hazel soothes and refines pores without irritation.",
    image: "https://images.openbeautyfacts.org/images/products/004/150/707/0059/front_en.3.400.jpg",
  },
  {
    id: "p6",
    name: "2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    brandDomain: "paulaschoice.com",
    category: "Treatment",
    price: "$35",
    rating: 4.8,
    match: 90,
    skinTypes: ["Normal", "Combination", "Oily"],
    concerns: ["Large pores", "Uneven tone"],
    why: "Salicylic acid unclogs pores and smooths texture — a cult favorite.",
    image: "https://images.openbeautyfacts.org/images/products/065/543/900/5913/front_en.3.400.jpg",
  },
];

// Prestige-tier picks. Product images from Open Beauty Facts.
export const luxuryPicks = [
  {
    id: "lux1",
    name: "Crème de la Mer",
    brand: "La Mer",
    brandDomain: "cremedelamer.com",
    category: "Moisturizer",
    price: "$190",
    rating: 4.6,
    match: 94,
    tagline: "Iconic Miracle Broth cream — legendary barrier repair.",
    image: "https://images.openbeautyfacts.org/images/products/074/793/000/0013/front_fr.3.400.jpg",
  },
  {
    id: "lux2",
    name: "Advanced Night Repair",
    brand: "Estée Lauder",
    brandDomain: "esteelauder.com",
    category: "Serum",
    price: "$115",
    rating: 4.8,
    match: 96,
    tagline: "Multi-recovery complex for overnight radiance.",
    image: "https://images.openbeautyfacts.org/images/products/088/716/748/5488/front_nl.9.400.jpg",
  },
  {
    id: "lux3",
    name: "Orchidée Impériale Black La Crème",
    brand: "Guerlain",
    brandDomain: "guerlain.com",
    category: "Anti-Age",
    price: "$520",
    rating: 4.7,
    match: 92,
    tagline: "Rare Black Orchid molecule — deep age-defying ritual.",
    image: "https://images.openbeautyfacts.org/images/products/334/647/061/2068/front_fr.4.400.jpg",
  },
  {
    id: "lux4",
    name: "Advanced Génifique Serum",
    brand: "Lancôme",
    brandDomain: "lancome.com",
    category: "Serum",
    price: "$88",
    rating: 4.7,
    match: 93,
    tagline: "Bifidus prebiotic serum for radiant, youthful skin.",
    image: "https://images.openbeautyfacts.org/images/products/361/427/278/3478/front_en.6.400.jpg",
  },
  {
    id: "lux5",
    name: "Double Serum",
    brand: "Clarins",
    brandDomain: "clarins.com",
    category: "Serum",
    price: "$95",
    rating: 4.6,
    match: 91,
    tagline: "21 plant extracts in a dual water + oil concentrate.",
    image: "https://images.openbeautyfacts.org/images/products/338/081/014/9661/front_fr.4.400.jpg",
  },
  {
    id: "lux6",
    name: "Atmosphere Airy Light UV Emulsion",
    brand: "SK-II",
    brandDomain: "sk-ii.com",
    category: "Sunscreen",
    price: "$95",
    rating: 4.5,
    match: 90,
    tagline: "Pitera-infused daily UV shield with a weightless finish.",
    image: "https://images.openbeautyfacts.org/images/products/692/882/002/9572/front_xx.7.400.jpg",
  },
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
