import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  CONTENT_ROW_ID,
  CONTENT_TABLE,
  getSupabaseAdmin,
  supabaseConfigured,
} from "@/lib/supabase-admin";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase isn't configured on the server, so changes can't be saved yet. See the README." },
      { status: 503 },
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 503 });
  }
  const { error } = await supabase
    .from(CONTENT_TABLE)
    .upsert({ id: CONTENT_ROW_ID, data: body, updated_at: new Date().toISOString() });
  if (error) {
    return NextResponse.json({ error: `Couldn't save: ${error.message}` }, { status: 500 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
