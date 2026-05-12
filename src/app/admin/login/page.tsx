import { redirect } from "next/navigation";
import { adminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!adminConfigured()) return <AdminNotice kind="no-admin" />;
  if (await isAuthenticated()) redirect("/admin");
  return <LoginForm />;
}
