import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  const url = new URL(`/register?ref=${encodeURIComponent(code)}`, request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set({
    name: "ref_code",
    value: code,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    path: "/"
  });

  return response;
}
