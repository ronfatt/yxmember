import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { normalizeUsernameId, isValidUsernameId } from "../../../../lib/metaenergy/username";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = normalizeUsernameId(url.searchParams.get("username"));

  if (!isValidUsernameId(username)) {
    return NextResponse.json({ ok: false, available: false, normalized: username });
  }

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("users_profile")
    .select("id")
    .eq("username_id", username)
    .limit(1);

  return NextResponse.json({
    ok: true,
    normalized: username,
    available: !data?.length
  });
}
