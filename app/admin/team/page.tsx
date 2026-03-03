import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/actions/session";
import { getCurrentLanguage } from "../../../lib/i18n/server";
import { t } from "../../../lib/i18n/shared";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

async function saveAdminRoleAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const userId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim().toUpperCase();

  if (!userId || !["ADMIN", "STAFF"].includes(role)) {
    return;
  }

  const admin = supabaseAdmin();
  const { data: existing } = await admin
    .from("admin_roles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.id) {
    await admin.from("admin_roles").update({ role }).eq("id", existing.id);
  } else {
    await admin.from("admin_roles").insert({ user_id: userId, role });
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin");
}

async function removeAdminRoleAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const roleId = String(formData.get("role_id") ?? "").trim();
  if (!roleId) return;

  await supabaseAdmin().from("admin_roles").delete().eq("id", roleId);
  revalidatePath("/admin/team");
  revalidatePath("/admin");
}

export default async function AdminTeamPage() {
  await requireAdmin();
  const language = await getCurrentLanguage();
  const admin = supabaseAdmin();

  const [{ data: roles }, { data: users }] = await Promise.all([
    admin
      .from("admin_roles")
      .select("id,user_id,role")
      .order("role", { ascending: true }),
    admin
      .from("users")
      .select("id,email,phone,name,created_at")
      .order("created_at", { ascending: false })
  ]);

  const roleMap = new Map((roles ?? []).map((role) => [role.user_id, role]));
  const activeAdmins = (users ?? [])
    .filter((user) => roleMap.has(user.id))
    .map((user) => ({
      user,
      role: roleMap.get(user.id)!
    }));

  const availableUsers = (users ?? []).filter((user) => !roleMap.has(user.id));

  return (
    <section className="space-y-6">
      <div className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7240]">
          {t(language, { zh: "管理员与员工权限", en: "Admin and staff access" })}
        </p>
        <h2 className="font-display text-5xl text-[#123524]">
          {t(language, { zh: "管理员管理", en: "Admin management" })}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-black/62">
          {t(language, {
            zh: "以后不需要再进 SQL。直接在这里把已注册用户设成 ADMIN 或 STAFF，也可以随时移除后台权限。",
            en: "Manage admin access here instead of editing SQL. Assign registered users as ADMIN or STAFF, or remove access at any time."
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="card space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d7240]">
              {t(language, { zh: "新增后台权限", en: "Grant new access" })}
            </p>
            <h3 className="mt-2 font-display text-3xl text-[#123524]">
              {t(language, { zh: "选择一个已注册账号", en: "Choose a registered account" })}
            </h3>
          </div>

          <form action={saveAdminRoleAction} className="space-y-4">
            <label className="grid gap-2 text-sm text-black/65">
              <span>{t(language, { zh: "账号", en: "Account" })}</span>
              <select
                name="user_id"
                required
                className="rounded-2xl border border-black/10 bg-white px-4 py-3"
                defaultValue=""
              >
                <option value="" disabled>
                  {t(language, { zh: "请选择一个用户", en: "Select a user" })}
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {(user.name || t(language, { zh: "未命名用户", en: "Unnamed user" }))} · {user.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-black/65">
              <span>{t(language, { zh: "角色", en: "Role" })}</span>
              <select
                name="role"
                required
                defaultValue="ADMIN"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
              </select>
            </label>

            <button className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white">
              {t(language, { zh: "保存权限", en: "Save access" })}
            </button>
          </form>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d7240]">
                {t(language, { zh: "当前后台成员", en: "Current admin members" })}
              </p>
              <h3 className="mt-2 font-display text-3xl text-[#123524]">
                {t(language, { zh: "已拥有后台权限的账号", en: "Accounts with admin access" })}
              </h3>
            </div>
            <span className="rounded-full border border-black/10 bg-[#f8f3ea] px-4 py-2 text-sm text-black/55">
              {activeAdmins.length} {t(language, { zh: "位", en: "total" })}
            </span>
          </div>

          {activeAdmins.length ? (
            <div className="space-y-3">
              {activeAdmins.map(({ user, role }) => (
                <div key={role.id} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-[#123524]">
                        {user.name || t(language, { zh: "未命名用户", en: "Unnamed user" })}
                      </p>
                      <p className="text-sm text-black/60">{user.email}</p>
                      {user.phone ? <p className="text-xs text-black/45">{user.phone}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={saveAdminRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="user_id" value={user.id} />
                        <select
                          name="role"
                          defaultValue={role.role}
                          className="rounded-full border border-black/10 bg-[#f8f3ea] px-4 py-2 text-sm"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="STAFF">STAFF</option>
                        </select>
                        <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#123524]">
                          {t(language, { zh: "更新", en: "Update" })}
                        </button>
                      </form>
                      <form action={removeAdminRoleAction}>
                        <input type="hidden" name="role_id" value={role.id} />
                        <button className="rounded-full border border-[#8c3a1f]/20 bg-[#fff5f1] px-4 py-2 text-sm font-semibold text-[#8c3a1f]">
                          {t(language, { zh: "移除权限", en: "Remove access" })}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-5 text-sm text-black/55">
              {t(language, { zh: "目前还没有通过 admin_roles 设置的后台成员。", en: "No admin_roles entries yet." })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
