import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { isAdminEmail } from "../metaenergy/auth";

export async function requireUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  return data.user;
}

export async function requireAdmin() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  if (isAdminEmail(auth.user.email)) {
    return auth.user;
  }

  const { data: role } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", auth.user.id)
    .single();

  if (!role || !["ADMIN", "STAFF"].includes(role.role)) {
    redirect("/dashboard");
  }
  return auth.user;
}

export async function getAdminStatus(userId?: string | null, email?: string | null) {
  const supabase = createClient();

  if (isAdminEmail(email)) {
    return true;
  }

  if (!userId) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return false;
    }

    if (isAdminEmail(auth.user.email)) {
      return true;
    }

    userId = auth.user.id;
  }

  const { data: role } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return !!role && ["ADMIN", "STAFF"].includes(role.role);
}
