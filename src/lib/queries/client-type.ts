import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Works with the browser client, the server client and the admin client. */
export type DB = SupabaseClient<Database>;
