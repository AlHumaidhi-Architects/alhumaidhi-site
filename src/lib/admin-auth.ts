// Server-only module. Do not import from client components.
import { cookies } from "next/headers";
import { createHash } from "crypto";

export const ADMIN_COOKIE = "ah_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

/** True once an admin password has been set in the environment. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** The opaque value stored in the session cookie. */
export function sessionToken(): string {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? pw;
  return createHash("sha256").update(`${pw}::${secret}`).digest("hex");
}

/** Constant-time-ish comparison against the configured admin password. */
export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  if (!pw || input.length !== pw.length) return false;
  let diff = 0;
  for (let i = 0; i < pw.length; i++) diff |= input.charCodeAt(i) ^ pw.charCodeAt(i);
  return diff === 0;
}

/** Whether the current request carries a valid admin session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === sessionToken();
}
