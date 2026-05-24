/**
 * Shared, dependency-free helpers for media URLs — used by the renderer
 * (ui/Media, Cover, Navigation, Preloader) and the admin (fields). Kept out of
 * any "use client" component so both server and client code can import it.
 */

/** Distinguish stills from animated GIFs and MP4/WebM video by extension. */
export function mediaKind(src: string): "video" | "gif" | "image" {
  const s = (src || "").split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(s)) return "video";
  if (/\.gif$/.test(s)) return "gif";
  return "image";
}

/** Supabase Storage public URL — serve these raw (the optimizer can blank them). */
export function isSupabasePublicUrl(src: string): boolean {
  return /\/storage\/v1\/object\/public\//.test(src || "");
}

/** Best-effort MIME hint for a <source>, so browsers don't have to sniff. */
export function videoMime(src: string): string | undefined {
  const s = (src || "").split("?")[0].toLowerCase();
  if (s.endsWith(".webm")) return "video/webm";
  if (s.endsWith(".ogv")) return "video/ogg";
  if (s.endsWith(".mov") || s.endsWith(".m4v")) return "video/quicktime";
  if (s.endsWith(".mp4")) return "video/mp4";
  return undefined; // unknown extension (e.g. a CDN URL) — let the browser sniff
}

/**
 * Append a cache-busting `?v=<version>` to our own uploaded files so a browser
 * that cached a stale (or previously-broken) response fetches a fresh copy after
 * the project is re-saved. Only touches Supabase Storage URLs — pasted external
 * URLs are left untouched (their query strings can be load-bearing / signed).
 */
export function bustCache(url: string, version?: string | number | null): string {
  if (!url || version == null || version === "") return url;
  if (!isSupabasePublicUrl(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
}
