import type { MetadataRoute } from "next";
import { getSiteUrl } from "../lib/metaenergy/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${siteUrl.toString()}/sitemap.xml`,
    host: siteUrl.toString()
  };
}
