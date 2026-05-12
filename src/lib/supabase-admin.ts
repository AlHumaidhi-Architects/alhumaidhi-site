// Server-only module — uses the service-role key. Do not import from client components.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the server has everything it needs to read & write content. */
export const supabaseConfigured = Boolean(url && serviceKey);

export const CONTENT_TABLE = "site_content";
export const CONTENT_ROW_ID = 1;
export const MEDIA_BUCKET = "site-media";

let cached: SupabaseClient | null = null;

/** Server-only Supabase client using the service-role key. Never expose this. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
