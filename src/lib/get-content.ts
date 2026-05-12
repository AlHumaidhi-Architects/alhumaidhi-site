import { cache } from "react";
import { defaultContent, type SiteContent } from "./content";
import {
  CONTENT_ROW_ID,
  CONTENT_TABLE,
  getSupabaseAdmin,
} from "./supabase-admin";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Recursively merge `override` over `base`. Arrays & primitives replace wholesale. */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : (override as T));
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const o = (override as Record<string, unknown>)[key];
    if (o === undefined) continue;
    const b = (base as Record<string, unknown>)[key];
    out[key] = isPlainObject(b) && isPlainObject(o) ? deepMerge(b, o) : o;
  }
  return out as T;
}

/**
 * Loads the live site content from Supabase, falling back to the built-in
 * `defaultContent` whenever Supabase isn't configured, the row is missing,
 * or anything goes wrong. Memoised per request.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultContent;
  try {
    const { data, error } = await supabase
      .from(CONTENT_TABLE)
      .select("data")
      .eq("id", CONTENT_ROW_ID)
      .maybeSingle();
    if (error || !data || !data.data) return defaultContent;
    return deepMerge(defaultContent, data.data);
  } catch {
    return defaultContent;
  }
});
