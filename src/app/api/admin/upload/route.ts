import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { MEDIA_BUCKET, ensureMediaBucket, getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase-admin";

/* Formats the presentation can actually render. Keep in sync with the renderer
 * (src/components/ui/Media.tsx) and the admin file picker (fields.tsx). */
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "application/pdf", // downloadable plans / documents
]);
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v|pdf)$/i;

/** A file is acceptable if its MIME type OR its extension is one we support. */
function isSupportedFile(type: string, name: string): boolean {
  if (type && ALLOWED_MIME.has(type.toLowerCase())) return true;
  return ALLOWED_EXT.test(name); // some browsers send empty/odd MIME types
}

/**
 * Confirm the freshly-uploaded object is actually served publicly. `getPublicUrl`
 * only string-builds a URL — it returns a "valid-looking" link even when the
 * bucket is private, which is the classic "upload worked but the image never
 * shows" failure. So we fetch it and check.
 */
async function isPubliclyReadable(
  url: string,
): Promise<{ ok: boolean; status?: number; networkError?: string }> {
  try {
    let res = await fetch(url, { method: "HEAD", cache: "no-store" });
    // Some gateways reject HEAD — fall back to a 1-byte ranged GET.
    if (!res.ok && (res.status === 400 || res.status === 405)) {
      res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, cache: "no-store" });
    }
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, networkError: e instanceof Error ? e.message : "network error" };
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!supabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "File uploads are off because Supabase storage isn't connected on the server. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or paste an image URL instead.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  const original = file instanceof File ? file.name : "image";
  const fileType = file.type || "";

  if (!isSupportedFile(fileType, original)) {
    return NextResponse.json(
      {
        error: `Unsupported file type${fileType ? ` (${fileType})` : ""}. Upload an image (JPG, PNG, WEBP, GIF), a video (MP4, WEBM, MOV), or a PDF — or paste a URL instead.`,
      },
      { status: 415 },
    );
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File is too large (max 25 MB). For larger videos, host it elsewhere and paste the URL." },
      { status: 413 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 503 });
  }

  // Auto-create the public bucket if it doesn't exist yet (service-role key).
  const bucket = await ensureMediaBucket();
  if (!bucket.ok) {
    return NextResponse.json(
      {
        error: `Couldn't reach the "${MEDIA_BUCKET}" storage bucket: ${bucket.error ?? "unknown error"}. Check the service-role key has Storage access, or paste an image URL instead.`,
      },
      { status: 502 },
    );
  }

  const safe = original.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(-48) || "image";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, buffer, { contentType: fileType || "application/octet-stream", upsert: false });
  if (error) {
    return NextResponse.json(
      { error: `Upload failed: ${error.message}. Make sure the public Storage bucket "${MEDIA_BUCKET}" exists and the service-role key can write to it.` },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  const url = data?.publicUrl;
  if (!url) {
    return NextResponse.json(
      { error: "File uploaded, but Supabase returned no public URL. Check the bucket configuration, or paste a URL instead." },
      { status: 500 },
    );
  }

  // End-to-end check: confirm the object is actually publicly served.
  let check = await isPubliclyReadable(url);
  if (!check.ok && !check.networkError) {
    // The object exists but isn't readable — almost always a private bucket.
    // Try to flip it public, then re-check once.
    await supabase.storage.updateBucket(MEDIA_BUCKET, { public: true }).catch(() => {});
    check = await isPubliclyReadable(url);
  }

  if (!check.ok && !check.networkError) {
    return NextResponse.json(
      {
        url,
        error: `File uploaded, but it isn't publicly readable (HTTP ${check.status}). The "${MEDIA_BUCKET}" Storage bucket is private. In Supabase → Storage → ${MEDIA_BUCKET}, switch it to a public bucket, then upload again.`,
      },
      { status: 502 },
    );
  }

  // Uploaded and verified (or we couldn't reach it to verify — pass it through
  // with a soft warning rather than blocking a legitimate upload).
  return NextResponse.json({
    url,
    contentType: fileType,
    size: file.size,
    ...(check.networkError
      ? { warning: `Uploaded, but the server couldn't verify the public URL (${check.networkError}). If the image doesn't appear, check the "${MEDIA_BUCKET}" bucket is public.` }
      : {}),
  });
}
