import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getCurrentLanguage } from "../lib/i18n/server";
import { getSiteUrl } from "../lib/metaenergy/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "元象能量会员系统",
    template: "%s | 元象能量会员系统"
  },
  description: "元象能量会员系统，为长期体验而设计的成长空间，整合会员、课程活动、导师会谈、推荐回馈与财务管理。",
  keywords: [
    "元象",
    "元象能量会员系统",
    "MetaEnergy",
    "membership",
    "导师预约",
    "课程活动",
    "推荐回馈"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "元象能量会员系统",
    title: "元象能量会员系统",
    description: "为长期体验而设计的成长空间，整合会员、课程活动、导师会谈、推荐回馈与财务管理。",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "元象能量会员系统"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "元象能量会员系统",
    description: "为长期体验而设计的成长空间，整合会员、课程活动、导师会谈、推荐回馈与财务管理。",
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = await getCurrentLanguage();

  return (
    <html lang={language === "en" ? "en" : "zh-CN"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
