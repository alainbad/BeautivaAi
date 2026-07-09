import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Browser-side Supabase client. Safe to use in components: it only ever sees
 * the public URL + anon key, and Postgres access is gated by RLS.
 */
export function getSupabaseBrowserClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set them in your environment (see .env.example).",
      );
    }
    client = createBrowserClient<Database>(url, anonKey);
  }
  return client;
}
