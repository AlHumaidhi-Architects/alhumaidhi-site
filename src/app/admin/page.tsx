import { redirect } from "next/navigation";
import { adminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { getSupabaseStatus } from "@/lib/supabase-admin";
import { getSiteContent } from "@/lib/get-content";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) return <AdminNotice kind="no-admin" />;
  if (!(await isAuthenticated())) redirect("/admin/login");
  const content = await getSiteContent();
  const supabase = await getSupabaseStatus();
  return <AdminDashboard initialContent={content} supabase={supabase} />;
}
