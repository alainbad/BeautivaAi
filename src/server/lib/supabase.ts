import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getRequestHeader, setCookie } from "@tanstack/react-start/server";
import type { Database } from "@/lib/supabase/types";
import { serverEnv } from "./env";

/**
 * Cookie-bound Supabase client for the current request. Respects RLS as the
 * signed-in user (or acts anonymously if there's no session) — this is what
 * every user-facing server function should use.
 */
export function getSupabaseServerClient() {
  return createServerClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        const raw = getRequestHeader("cookie") ?? "";
        return raw
          .split(";")
          .map((pair) => pair.trim())
          .filter(Boolean)
          .map((pair) => {
            const eq = pair.indexOf("=");
            const name = eq === -1 ? pair : pair.slice(0, eq);
            const value = eq === -1 ? "" : decodeURIComponent(pair.slice(eq + 1));
            return { name, value };
          });
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options as Record<string, unknown>);
        }
      },
    },
  });
}

/**
 * Service-role Supabase client. Bypasses RLS entirely — only use it after
 * verifying the caller's identity yourself (webhooks, admin actions, or
 * server functions that already called requireUser()/requireAdmin()).
 */
export function getSupabaseAdminClient() {
  return createClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
