import "@/env/server";
import "./globals.css";

import { cn } from "@ui/lib/cn";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";

import { APP_DESCRIPTION, APP_TITLE, SITE_URL, TITLE_TEMPLATE } from "@/app/metadata";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { AppProviders } from "@/modules/core/providers/AppProviders";

const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: APP_TITLE, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE_URL, siteName: APP_TITLE, title: APP_TITLE, description: APP_DESCRIPTION },
  twitter: { card: "summary_large_image", title: APP_TITLE, description: APP_DESCRIPTION },
};

type RootLayoutProps = { children: ReactNode };
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={cn(outfit.variable, "font-sans")}>
        <AppProviders>{children}</AppProviders>
        <MicrosoftClarity />
      </body>
    </html>
  );
}
