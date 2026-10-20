import { createClient } from "@supabase/supabase-js";

/**
 * Daily Drape — Supabase client
 *
 * Reuses the existing project credentials from the original
 * `frontend/js/supabase.js` file. These are the PUBLIC project URL and
 * the PUBLISHABLE (anon) key — safe to ship in frontend code.
 *
 * IMPORTANT: Never put a service-role / secret key here. All privileged
 * operations must be enforced with Postgres Row Level Security policies
 * (see /sql/policies.sql) rather than by trusting the browser.
 */
const SUPABASE_URL = "https://atztddftttggrqqavlsj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TjmUno96hrBnUlwhnAqscg_AdXvqfZ-";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** True once we've attempted to confirm the backend schema exists. */
let schemaChecked = false;
let schemaAvailable = false;

/**
 * Best-effort check for whether the documented schema (see sql/schema.sql)
 * has actually been applied to this Supabase project. We never assume
 * success — a failed request always falls back to local/demo data and is
 * surfaced to calling code so the UI can be honest about it.
 */
export async function isSchemaReady(): Promise<boolean> {
  if (schemaChecked) return schemaAvailable;
  try {
    const { error } = await supabase.from("products").select("id").limit(1);
    schemaAvailable = !error;
  } catch {
    schemaAvailable = false;
  } finally {
    schemaChecked = true;
  }
  return schemaAvailable;
}

export function resetSchemaCheckCache() {
  schemaChecked = false;
}
