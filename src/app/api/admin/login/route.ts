import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  cookieOptions,
  passwordMatches,
  sessionToken,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "The editor is not configured yet. Set ADMIN_PASSWORD." }, { status: 503 });
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!body.password || !passwordMatches(body.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), cookieOptions);
  return res;
}
