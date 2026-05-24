import { cache } from "react";
import {
  defaultContent,
  getBySlug,
  getPublished,
  SCHEMA_VERSION,
  type Project,
  type SiteContent,
} from "./content";
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
    return override === undefined ? base : (override as T);
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
 * Reconcile saved data into a valid `SiteContent`.
 *
 *  • New shape (has `projects`)  → studio/theme deep-merged over defaults,
 *    projects replaced wholesale, publishedId carried over.
 *  • Legacy shape (has `presentation`, no `projects`) → keep the customised
 *    brand + palette, but adopt the new template's default projects (the old
 *    single-deck content belonged to a retired section set).
 *  • Anything unrecognised → built-in defaults.
 */
function reconcile(saved: unknown): SiteContent {
  if (!isPlainObject(saved)) return defaultContent;

  // New multi-project shape.
  if (Array.isArray(saved.projects)) {
    const merged: SiteContent = {
      schemaVersion: SCHEMA_VERSION,
      studio: deepMerge(defaultContent.studio, saved.studio),
      theme: deepMerge(defaultContent.theme, saved.theme),
      projects: saved.projects as Project[],
      publishedId:
        typeof saved.publishedId === "string" ? saved.publishedId : defaultContent.publishedId,
    };
    if (!merged.projects.length) return defaultContent;
    return merged;
  }

  // Legacy single-presentation shape — preserve brand + colours only.
  if (isPlainObject(saved.presentation)) {
    return {
      ...defaultContent,
      studio: deepMerge(defaultContent.studio, saved.studio),
      theme: deepMerge(defaultContent.theme, saved.theme),
    };
  }

  return defaultContent;
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
    return reconcile(data.data);
  } catch {
    return defaultContent;
  }
});

/** The project shown at `/` (published, with fallbacks). */
export const getPublishedProject = cache(async (): Promise<Project | undefined> => {
  const content = await getSiteContent();
  return getPublished(content);
});

/** A specific project by slug, for `/p/[slug]`. */
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const content = await getSiteContent();
  return getBySlug(content, slug);
}

/** All slugs — used to pre-render per-project pages. */
export async function getAllSlugs(): Promise<string[]> {
  const content = await getSiteContent();
  return content.projects.map((p) => p.slug);
}
