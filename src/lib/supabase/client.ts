"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components.
 * Uses the public anon key + the user's session cookie, so every query is
 * filtered by your RLS SELECT policies. Do NOT write with it: writes go
 * through server actions (src/lib/actions).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
