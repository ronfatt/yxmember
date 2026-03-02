import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { isAdminEmail } from "../../../../lib/metaenergy/auth";
import { getAccountingSnapshot, resolveAccountingMonth } from "../../../../lib/metaenergy/accounting";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let isAdmin = isAdminEmail(auth.user.email);
  if (!isAdmin) {
    const { data: role } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", auth.user.id)
      .single();
    isAdmin = !!role && ["ADMIN", "STAFF"].includes(role.role);
  }

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const month = resolveAccountingMonth(url.searchParams.get("month"));
  const snapshot = await getAccountingSnapshot(supabaseAdmin(), month);

  const rows = [
    ["month", "entry_type", "title", "amount", "date", "note", "receipt_url"].join(","),
    ...snapshot.timeline.map((item) =>
      [
        csvCell(snapshot.month),
        csvCell(item.type),
        csvCell(item.title),
        csvCell(item.amount.toFixed(2)),
        csvCell(item.date),
        csvCell(item.note ?? ""),
        csvCell((item as { receiptUrl?: string | null }).receiptUrl ?? "")
      ].join(",")
    )
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="accounting-${snapshot.month}.csv"`
    }
  });
}
