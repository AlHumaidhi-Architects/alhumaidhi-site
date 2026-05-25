import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { defaultContent, type ProjectApproval, type ProjectComments } from "@/lib/content";
import {
  CONTENT_ROW_ID,
  CONTENT_TABLE,
  getSupabaseAdmin,
  supabaseConfigured,
} from "@/lib/supabase-admin";

/**
 * Public, deliberately narrow endpoint used by the deck's two closing actions:
 *   kind="approve"  → records { approvedBy, approvedAt, signature }
 *   kind="comments" → records { sentAt } (the "Email Comments" button)
 * It can ONLY write a project's `approval` / `comments` fields — never any
 * other content — so the public surface stays tiny. An admin can clear either.
 */

type Body = { id?: string; slug?: string; name?: string; signature?: string; kind?: string };

/** Cap on the stored signature data URL (~1.5 MB of base64) to bound abuse. */
const MAX_SIGNATURE_LEN = 2_000_000;

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

/** Accept only reasonably-sized PNG/JPEG data URLs. */
function validSignature(input: unknown): input is string {
  return (
    typeof input === "string" &&
    /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(input) &&
    input.length <= MAX_SIGNATURE_LEN
  );
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(req: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "This can't be saved yet — the backend isn't connected. Please contact the studio." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = body.kind === "comments" ? "comments" : "approve";
  const id = typeof body.id === "string" ? body.id : "";
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!id && !slug) {
    return NextResponse.json({ error: "Couldn't tell which project this is for." }, { status: 400 });
  }

  // Approval needs a name and a signature; comments needs neither.
  let name = "";
  if (kind === "approve") {
    name = cleanName(body.name);
    if (!name) {
      return NextResponse.json({ error: "Please enter your full name to confirm approval." }, { status: 400 });
    }
    if (!validSignature(body.signature)) {
      return NextResponse.json({ error: "Please add your signature to confirm approval." }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Backend isn't configured." }, { status: 503 });
  }

  // Read the raw stored content (not the reconciled view) so we write back
  // exactly what's there, only touching the one project's approval / comments.
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

  let payload: { approval?: ProjectApproval; comments?: ProjectComments };
  if (kind === "comments") {
    const comments: ProjectComments = { sentAt: new Date().toISOString() };
    project.comments = comments;
    payload = { comments };
  } else {
    const approval: ProjectApproval = {
      approvedBy: name,
      approvedAt: new Date().toISOString(),
      signature: body.signature as string,
    };
    project.approval = approval;
    payload = { approval };
  }
  project.updatedAt = Date.now();

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .upsert({ id: CONTENT_ROW_ID, data, updated_at: new Date().toISOString() });
  if (error) {
    return NextResponse.json({ error: "Couldn't save. Please try again." }, { status: 500 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, ...payload });
}
