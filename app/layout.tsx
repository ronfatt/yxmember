import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getCurrentLanguage } from "../lib/i18n/server";

export const metadata: Metadata = {
  title: "元像 Membership",
  description: "Membership, courses, and mentoring for 元像.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const language = getCurrentLanguage();

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
