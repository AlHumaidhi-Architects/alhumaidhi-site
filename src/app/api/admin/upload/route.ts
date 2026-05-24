import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { MEDIA_BUCKET, ensureMediaBucket, getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase-admin";

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
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large (max 12 MB)." }, { status: 400 });
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

  const original = file instanceof File ? file.name : "image";
  const safe = original.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(-48) || "image";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) {
    return NextResponse.json(
      { error: `Upload failed: ${error.message}. Make sure the public Storage bucket "${MEDIA_BUCKET}" exists and the service-role key can write to it.` },
      { status: 500 },
    );
  }
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
