import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Live auth session (client-only) */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading, isAuthenticated: !!session };
}

export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

/** Current user's profile row */
export function useProfile(user: User | null) {
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ProfileRow | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
  });
}

export type SubscriptionRow = {
  user_id: string;
  tier: "free" | "pro";
  status: "active" | "inactive" | "expired" | "cancelled" | "in_trial";
  expires_at: string | null;
  trial_ends_at: string | null;
};

/** Current user's Pro entitlement */
export function useSubscription(user: User | null) {
  return useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionRow | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id, tier, status, expires_at, trial_ends_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    },
  });
}

/** True if the user has an active Pro entitlement */
export function isPro(sub: SubscriptionRow | null | undefined): boolean {
  if (!sub) return false;
  if (sub.tier !== "pro") return false;
  if (sub.status !== "active" && sub.status !== "in_trial") return false;
  if (sub.expires_at && new Date(sub.expires_at).getTime() < Date.now()) return false;
  return true;
}

/** Full sign-out with cache teardown */
export function useSignOut() {
  const qc = useQueryClient();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
  };
}
