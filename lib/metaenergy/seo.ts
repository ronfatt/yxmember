import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

export function createPublicMetadata(title: string, description: string, path: string): Metadata {
  const siteUrl = getSiteUrl();
  const url = new URL(path, siteUrl);

  return {
    title,
    description,
    alternates: {
      canonical: url.pathname
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "元象能量会员系统",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"]
    }
  };
}
