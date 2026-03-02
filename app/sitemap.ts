import type { MetadataRoute } from "next";
import { getSiteUrl } from "../lib/metaenergy/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl().toString();
  const now = new Date();

  const publicRoutes = [
    "",
    "/login",
    "/register",
    "/courses",
    "/products",
    "/mentors",
    "/rooms",
    "/testimonials"
  ];

  return publicRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7
  }));
}
