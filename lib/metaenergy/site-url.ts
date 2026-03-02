export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = process.env.NODE_ENV === "production" ? "https://yxenergy.my" : "http://localhost:3000";
  return new URL((configured || fallback).replace(/\/$/, ""));
}
