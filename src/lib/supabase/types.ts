// Hand-written types mirroring supabase/migrations/*.sql.
// Regenerate with `npx supabase gen types typescript` once the project is
// linked, and this file can be replaced wholesale.

export type SkinLevel = "none" | "low" | "mild" | "moderate" | "high";

export type RoutineStepJson = {
  step: number;
  category: string;
  recommendation: string;
  reason: string;
  instructions: string;
  frequency: string;
};

export type SkinAnalysisRecommendations = {
  morning: RoutineStepJson[];
  evening: RoutineStepJson[];
  avoid: string[];
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  age_range: string | null;
  gender: string | null;
  skin_type: string | null;
  skin_concerns: string[];
  allergies: string[];
  preferred_budget: string | null;
  country: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type SkinAnalysis = {
  id: string;
  user_id: string;
  image_url: string | null;
  skin_score: number | null;
  acne_level: SkinLevel | null;
  redness_level: SkinLevel | null;
  dark_spots_level: SkinLevel | null;
  wrinkles_level: SkinLevel | null;
  pores_level: SkinLevel | null;
  oiliness_level: SkinLevel | null;
  dryness_level: SkinLevel | null;
  ai_summary: string | null;
  recommendations: SkinAnalysisRecommendations | null;
  disclaimer: string | null;
  created_at: string;
};

export type SkincareRoutine = {
  id: string;
  user_id: string;
  analysis_id: string | null;
  routine_type: "morning" | "evening";
  routine_steps: RoutineStepJson[];
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  skin_type_match: string[];
  concerns_match: string[];
  ingredients: string[];
  price_range: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RecommendedProduct = {
  id: string;
  user_id: string;
  analysis_id: string | null;
  product_id: string;
  reason: string | null;
  match_score: number | null;
  created_at: string;
};

export type SavedProduct = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type ProgressPhoto = {
  id: string;
  user_id: string;
  image_url: string;
  notes: string | null;
  skin_score: number | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_time: string;
  days_of_week: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: "free" | "premium";
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  apple_original_transaction_id: string | null;
  apple_product_id: string | null;
  apple_environment: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type RoutineCompletion = {
  id: string;
  user_id: string;
  routine_type: "morning" | "evening";
  step: number;
  completed_date: string;
  created_at: string;
};

// Minimal `Database` shape — just enough structure for the supabase-js
// generic client to type `.from("table")` calls across the app. Each table
// needs a `Relationships` array (even if empty) or supabase-js's type
// inference silently collapses Row/Insert/Update to `never`.
type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }>;
      skin_analyses: Table<SkinAnalysis, Partial<SkinAnalysis> & { user_id: string }>;
      skincare_routines: Table<
        SkincareRoutine,
        Partial<SkincareRoutine> & { user_id: string; routine_type: "morning" | "evening" }
      >;
      products: Table<Product, Partial<Product> & { name: string }>;
      recommended_products: Table<
        RecommendedProduct,
        Partial<RecommendedProduct> & { user_id: string; product_id: string }
      >;
      saved_products: Table<
        SavedProduct,
        Partial<SavedProduct> & { user_id: string; product_id: string }
      >;
      progress_photos: Table<
        ProgressPhoto,
        Partial<ProgressPhoto> & { user_id: string; image_url: string }
      >;
      reminders: Table<
        Reminder,
        Partial<Reminder> & { user_id: string; title: string; reminder_time: string }
      >;
      subscriptions: Table<Subscription, Partial<Subscription> & { user_id: string }>;
      routine_completions: Table<
        RoutineCompletion,
        Partial<RoutineCompletion> & {
          user_id: string;
          routine_type: "morning" | "evening";
          step: number;
          completed_date: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
