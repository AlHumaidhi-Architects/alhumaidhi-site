import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { defaultContent, type ProjectApproval } from "@/lib/content";
import {
  CONTENT_ROW_ID,
  CONTENT_TABLE,
  getSupabaseAdmin,
  supabaseConfigured,
} from "@/lib/supabase-admin";

/**
 * Public, deliberately narrow endpoint: lets a client viewing a presentation
 * record their approval. It can ONLY write the `approval` field on an existing
 * project — never any other content — so the public surface stays tiny. An
 * admin can clear or overwrite the approval from /admin.
 */

type Body = { id?: string; slug?: string; name?: string };

/** Trim, strip control characters, collapse whitespace and cap the length. */
function cleanName(input: unknown): string {
  if (typeof input !== "string") return "";
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    // Replace ASCII control chars (0x00–0x1F) and DEL (0x7F) with a space.
    out += code < 0x20 || code === 0x7f ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, 120);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(req: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Approvals can't be saved yet — the backend isn't connected. Please contact the studio." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = cleanName(body.name);
  if (!name) {
    return NextResponse.json({ error: "Please enter your name to confirm approval." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!id && !slug) {
    return NextResponse.json({ error: "Couldn't tell which project to approve." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Backend isn't configured." }, { status: 503 });
  }

  // Read the raw stored content (not the reconciled view) so we write back
  // exactly what's there, only touching the one project's approval.
  let data: Record<string, unknown>;
  try {
    const { data: row, error } = await supabase
      .from(CONTENT_TABLE)
      .select("data")
      .eq("id", CONTENT_ROW_ID)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: "Couldn't reach the backend. Please try again." }, { status: 500 });
    }
    data = isPlainObject(row?.data)
      ? (row!.data as Record<string, unknown>)
      : (structuredClone(defaultContent) as unknown as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Couldn't reach the backend. Please try again." }, { status: 500 });
  }

  const projects = Array.isArray(data.projects) ? (data.projects as Record<string, unknown>[]) : null;
  if (!projects) {
    return NextResponse.json({ error: "No projects found." }, { status: 404 });
  }

  const project = projects.find((p) => (id && p.id === id) || (slug && p.slug === slug));
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const approval: ProjectApproval = { approvedBy: name, approvedAt: new Date().toISOString() };
  project.approval = approval;
  project.updatedAt = Date.now();

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .upsert({ id: CONTENT_ROW_ID, data, updated_at: new Date().toISOString() });
  if (error) {
    return NextResponse.json({ error: "Couldn't save your approval. Please try again." }, { status: 500 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, approval });
}
