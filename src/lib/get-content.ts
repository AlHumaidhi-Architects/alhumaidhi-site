import { cache } from "react";
import {
  defaultContent,
  getBySlug,
  getPublished,
  SCHEMA_VERSION,
  type Media,
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

/* ── One-time, conservative upgrade of retired template sections ───────────
 *  Saved decks created before the Next Steps / Cost Estimate redesign carry
 *  the old section shapes. We swap a section for the new default ONLY when it
 *  still exactly matches the retired template (so any edited content is kept).
 *  This runs at read time; it sticks permanently once the editor saves again.
 */
const RETIRED_COST_COLUMNS = ["Item", "Scope", "Area / Qty", "Rate", "Estimate"];
const RETIRED_COST_HEADLINE = "Indicative budget";
const RETIRED_NEXTSTEPS_HEADLINE = ["Let us build", "something", "that lasts"];

function sameStringArray(a: unknown, b: string[]): boolean {
  return Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
}

function upgradeRetiredSections(project: Project): Project {
  const def = defaultContent.projects[0];
  const sections = project.sections;
  if (!sections) return project;
  let next = sections;

  const cost = sections.costEstimate;
  if (cost && cost.headline === RETIRED_COST_HEADLINE && sameStringArray(cost.table?.columns, RETIRED_COST_COLUMNS)) {
    next = { ...next, costEstimate: structuredClone(def.sections.costEstimate) };
  }

  const ns = sections.nextSteps;
  if (ns && sameStringArray(ns.headline, RETIRED_NEXTSTEPS_HEADLINE)) {
    next = { ...next, nextSteps: structuredClone(def.sections.nextSteps) };
  }

  return next === sections ? project : { ...project, sections: next };
}

/* ── Migrate the Intro's old single media slots into the flexible gallery ──
 *  Older decks stored `intro.media` + `intro.secondaryMedia`. The Intro now
 *  reads `intro.gallery`. When a deck has no (non-empty) gallery yet, build one
 *  from the legacy slots so their images keep showing. Sticks once re-saved. */
function isMedia(v: unknown): v is { src?: string } {
  return typeof v === "object" && v !== null;
}

/** Build a gallery from any legacy single-media slots that still hold a src. */
function galleryFromLegacy(...slots: unknown[]): Media[] {
  return slots
    .filter((m): m is Media => isMedia(m) && typeof (m as Media).src === "string" && (m as Media).src.length > 0)
    .map((m) => ({ ...m }));
}

function upgradeIntroGallery(project: Project): Project {
  const intro = project.sections?.intro;
  if (!intro) return project;
  if (Array.isArray(intro.gallery) && intro.gallery.length > 0) return project;

  const gallery = galleryFromLegacy(intro.media, intro.secondaryMedia);
  return { ...project, sections: { ...project.sections, intro: { ...intro, gallery } } };
}

function upgradeGifDiagramGallery(project: Project): Project {
  const gd = project.sections?.gifDiagram;
  if (!gd) return project;
  if (Array.isArray(gd.gallery) && gd.gallery.length > 0) return project;

  const gallery = galleryFromLegacy(gd.media);
  return { ...project, sections: { ...project.sections, gifDiagram: { ...gd, gallery } } };
}

function upgradeProject(project: Project): Project {
  return upgradeGifDiagramGallery(upgradeIntroGallery(upgradeRetiredSections(project)));
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
      projects: (saved.projects as Project[]).map(upgradeProject),
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
