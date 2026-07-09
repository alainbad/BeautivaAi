import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { AppError } from "./response";
import { getSupabaseServerClient } from "./supabase";

export type AuthedContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

/** Resolve the signed-in user for this request, or throw a 401 AppError. */
export async function requireUser(): Promise<AuthedContext> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError("You must be signed in to do that.", 401);
  }

  return { supabase, user };
}

/** Resolve the signed-in user and verify profiles.is_admin, or throw. */
export async function requireAdmin(): Promise<AuthedContext> {
  const ctx = await requireUser();
  const { data: profile, error } = await ctx.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", ctx.user.id)
    .single();

  if (error || !profile?.is_admin) {
    throw new AppError("Admin access required.", 403);
  }

  return ctx;
}
