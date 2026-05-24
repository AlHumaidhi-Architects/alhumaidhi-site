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

/**
 * Make sure the public media bucket exists (and is public), creating it with
 * the service-role key if needed. Returns `{ ok }` so callers can report a
 * precise reason. Idempotent and cheap to call.
 */
export async function ensureMediaBucket(): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  try {
    const { data: bucket } = await supabase.storage.getBucket(MEDIA_BUCKET);
    if (bucket) {
      // Ensure it's public (so getPublicUrl works) and raise the size cap for video.
      if (!bucket.public || (bucket.file_size_limit ?? 0) < 26214400) {
        await supabase.storage.updateBucket(MEDIA_BUCKET, { public: true, fileSizeLimit: "26214400" });
      }
      return { ok: true };
    }

    const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: "26214400", // 25 MB
    });
    // A concurrent request may have created it first — treat "already exists" as success.
    if (error && !/exist/i.test(error.message)) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Storage check failed." };
  }
}

export type SupabaseStatus = {
  /** Both env vars are present on the server. */
  configured: boolean;
  /** The site_content table is reachable. */
  table: "ok" | "missing" | "error" | "skipped";
  /** The public media bucket exists (auto-created if it didn't). */
  storage: "ok" | "missing" | "error" | "skipped";
  /** Human-readable detail for the first problem found. */
  detail?: string;
};

/**
 * Live health of the Supabase backend, used by /admin to tell the editor
 * exactly what (if anything) needs setting up. Runs a couple of quick checks
 * and is safe to call on every admin load (internal, low-traffic page).
 */
export async function getSupabaseStatus(): Promise<SupabaseStatus> {
  if (!supabaseConfigured) {
    return { configured: false, table: "skipped", storage: "skipped" };
  }
  const supabase = getSupabaseAdmin() as SupabaseClient;
  const status: SupabaseStatus = { configured: true, table: "ok", storage: "ok" };

  try {
    const { error } = await supabase.from(CONTENT_TABLE).select("id").limit(1);
    if (error) {
      status.table = /relation|does not exist|not exist|could not find the table|schema cache/i.test(error.message)
        ? "missing"
        : "error";
      status.detail = error.message;
    }
  } catch (e) {
    status.table = "error";
    status.detail = e instanceof Error ? e.message : "Database check failed.";
  }

  const bucket = await ensureMediaBucket();
  if (!bucket.ok) {
    status.storage = "missing";
    status.detail = status.detail ?? bucket.error;
  }

  return status;
}
