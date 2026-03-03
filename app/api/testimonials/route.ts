import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { testimonialSchema } from "../../../lib/zod";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  await admin.from("testimonials").insert({
    user_id: auth.user.id,
    category: parsed.data.category,
    title: parsed.data.title,
    content: parsed.data.content,
    media_urls: parsed.data.media_urls ?? [],
    is_anonymous: parsed.data.is_anonymous,
    consent_public: parsed.data.consent_public,
    status: "PENDING"
  });

  return NextResponse.json({ ok: true });
}
